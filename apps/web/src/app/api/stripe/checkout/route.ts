import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe, PLANS } from '@/lib/stripe';
import { getAuthUserId, unauthorized } from '@/lib/auth-helpers';
import { getDatabase } from '@backuphub/db';
import { users, workspaces, eq } from '@backuphub/db';

const checkoutSchema = z.object({ tier: z.enum(['starter', 'pro']) });

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });

  const { tier } = parsed.data;
  const plan = PLANS[tier];
  if (!plan.priceId) {
    return NextResponse.json({ error: `Stripe price ID for "${tier}" not configured` }, { status: 500 });
  }

  const db = getDatabase();

  // Get user email and workspace ID
  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return unauthorized();

  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.owner_id, userId))
    .limit(1);
  if (!workspace) {
    return NextResponse.json({ error: 'No workspace found. Create a workspace first.' }, { status: 404 });
  }

  const stripe = getStripe();
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

  return NextResponse.json({ url: session.url });
}
