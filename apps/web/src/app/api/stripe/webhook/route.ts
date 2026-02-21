import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getDatabase } from '@backuphub/db';
import { subscriptions, eq } from '@backuphub/db';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const db = getDatabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;
        const tier = session.metadata?.tier as 'business' | 'pro' | undefined;
        if (!workspaceId || !tier) break;

        const [existing] = await db
          .select({ id: subscriptions.id })
          .from(subscriptions)
          .where(eq(subscriptions.workspace_id, workspaceId))
          .limit(1);

        const vals = {
          tier: tier as 'free' | 'business' | 'pro',
          status: 'active' as const,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          updated_at: new Date(),
        };

        if (existing) {
          await db.update(subscriptions).set(vals).where(eq(subscriptions.workspace_id, workspaceId));
        } else {
          await db.insert(subscriptions).values({ workspace_id: workspaceId, ...vals });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status === 'active' ? 'active'
          : sub.status === 'trialing' ? 'trialing'
          : sub.status === 'canceled' ? 'canceled'
          : 'inactive';

        await db.update(subscriptions)
          .set({
            status: status as 'active' | 'inactive' | 'canceled',
            // @ts-ignore - Stripe Subscription has current_period_end
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
            updated_at: new Date(),
          })
          .where(eq(subscriptions.stripe_customer_id, sub.customer as string));
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await db.update(subscriptions)
          .set({ status: 'canceled', tier: 'free', updated_at: new Date() })
          .where(eq(subscriptions.stripe_customer_id, sub.customer as string));
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('[stripe/webhook] Error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
