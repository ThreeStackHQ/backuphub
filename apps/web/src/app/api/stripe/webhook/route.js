"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const stripe_1 = require("@/lib/stripe");
const db_1 = require("@backuphub/db");
const db_2 = require("@backuphub/db");
async function POST(req) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !webhookSecret) {
        return server_1.NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
    }
    let event;
    try {
        event = (0, stripe_1.getStripe)().webhooks.constructEvent(body, sig, webhookSecret);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Webhook error';
        return server_1.NextResponse.json({ error: msg }, { status: 400 });
    }
    const db = (0, db_1.getDatabase)();
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const workspaceId = session.metadata?.workspaceId;
                const tier = session.metadata?.tier;
                if (!workspaceId || !tier)
                    break;
                const [existing] = await db
                    .select({ id: db_2.subscriptions.id })
                    .from(db_2.subscriptions)
                    .where((0, db_2.eq)(db_2.subscriptions.workspace_id, workspaceId))
                    .limit(1);
                const vals = {
                    tier: tier,
                    status: 'active',
                    stripe_customer_id: session.customer,
                    stripe_subscription_id: session.subscription,
                    updated_at: new Date(),
                };
                if (existing) {
                    await db.update(db_2.subscriptions).set(vals).where((0, db_2.eq)(db_2.subscriptions.workspace_id, workspaceId));
                }
                else {
                    await db.insert(db_2.subscriptions).values({ workspace_id: workspaceId, ...vals });
                }
                break;
            }
            case 'customer.subscription.updated': {
                const sub = event.data.object;
                const status = sub.status === 'active' ? 'active'
                    : sub.status === 'trialing' ? 'trialing'
                        : sub.status === 'canceled' ? 'canceled'
                            : 'inactive';
                await db.update(db_2.subscriptions)
                    .set({
                    status: status,
                    // @ts-ignore - Stripe Subscription has current_period_end
                    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
                    updated_at: new Date(),
                })
                    .where((0, db_2.eq)(db_2.subscriptions.stripe_customer_id, sub.customer));
                break;
            }
            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                await db.update(db_2.subscriptions)
                    .set({ status: 'canceled', tier: 'free', updated_at: new Date() })
                    .where((0, db_2.eq)(db_2.subscriptions.stripe_customer_id, sub.customer));
                break;
            }
            default:
                break;
        }
    }
    catch (err) {
        console.error('[stripe/webhook] Error:', err);
        return server_1.NextResponse.json({ error: 'Handler error' }, { status: 500 });
    }
    return server_1.NextResponse.json({ received: true });
}
//# sourceMappingURL=route.js.map