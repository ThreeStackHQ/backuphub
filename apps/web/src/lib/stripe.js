"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANS = void 0;
exports.getStripe = getStripe;
const stripe_1 = __importDefault(require("stripe"));
let _stripe = null;
function getStripe() {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key)
            throw new Error('STRIPE_SECRET_KEY is not set');
        _stripe = new stripe_1.default(key, { apiVersion: '2026-01-28.clover' });
    }
    return _stripe;
}
exports.PLANS = {
    free: {
        name: 'Free',
        price: 0,
        databases: 1,
        backupsPerDay: 1,
        retentionDays: 7,
    },
    starter: {
        name: 'Starter',
        price: 900, // $9/mo
        databases: 5,
        backupsPerDay: 4,
        retentionDays: 30,
        priceId: process.env.STRIPE_PRICE_STARTER ?? '',
    },
    pro: {
        name: 'Pro',
        price: 2900, // $29/mo
        databases: -1, // unlimited
        backupsPerDay: 24, // hourly
        retentionDays: 365,
        priceId: process.env.STRIPE_PRICE_PRO ?? '',
    },
};
//# sourceMappingURL=stripe.js.map