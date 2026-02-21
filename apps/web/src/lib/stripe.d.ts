import Stripe from 'stripe';
export declare function getStripe(): Stripe;
export declare const PLANS: {
    readonly free: {
        readonly name: "Free";
        readonly price: 0;
        readonly databases: 1;
        readonly backupsPerDay: 1;
        readonly retentionDays: 7;
    };
    readonly starter: {
        readonly name: "Starter";
        readonly price: 900;
        readonly databases: 5;
        readonly backupsPerDay: 4;
        readonly retentionDays: 30;
        readonly priceId: string;
    };
    readonly pro: {
        readonly name: "Pro";
        readonly price: 2900;
        readonly databases: -1;
        readonly backupsPerDay: 24;
        readonly retentionDays: 365;
        readonly priceId: string;
    };
};
export type PlanTier = 'free' | 'starter' | 'pro';
//# sourceMappingURL=stripe.d.ts.map