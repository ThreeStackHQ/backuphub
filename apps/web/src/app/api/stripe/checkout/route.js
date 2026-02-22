"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const zod_1 = require("zod");
const stripe_1 = require("@/lib/stripe");
const auth_helpers_1 = require("@/lib/auth-helpers");
const db_1 = require("@backuphub/db");
const db_2 = require("@backuphub/db");
const checkoutSchema = zod_1.z.object({ tier: zod_1.z.enum(['starter', 'pro']) });
async function POST(req) {
    const userId = await (0, auth_helpers_1.getAuthUserId)();
    if (!userId)
        return (0, auth_helpers_1.unauthorized)();
    let body;
    try {
        body = await req.json();
    }
    catch {
        return server_1.NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success)
        return server_1.NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    const { tier } = parsed.data;
    const plan = stripe_1.PLANS[tier];
    if (!plan.priceId) {
        return server_1.NextResponse.json({ error: `Stripe price ID for "${tier}" not configured` }, { status: 500 });
    }
    const db = (0, db_1.getDatabase)();
    // Get user email and workspace ID
    const [user] = await db.select({ email: db_2.users.email }).from(db_2.users).where((0, db_2.eq)(db_2.users.id, userId)).limit(1);
    if (!user)
        return (0, auth_helpers_1.unauthorized)();
    const [workspace] = await db
        .select({ id: db_2.workspaces.id })
        .from(db_2.workspaces)
        .where((0, db_2.eq)(db_2.workspaces.owner_id, userId))
        .limit(1);
    if (!workspace) {
        return server_1.NextResponse.json({ error: 'No workspace found. Create a workspace first.' }, { status: 404 });
    }
    const stripe = (0, stripe_1.getStripe)();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://backuphub.threestack.io';
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [{ price: plan.priceId, quantity: 1 }],
        success_url: `${appUrl}/dashboard?upgrade=success`,
        cancel_url: `${appUrl}/pricing?upgrade=canceled`,
        metadata: { userId, workspaceId: workspace.id, tier },
    });
    return server_1.NextResponse.json({ url: session.url });
}
//# sourceMappingURL=route.js.map