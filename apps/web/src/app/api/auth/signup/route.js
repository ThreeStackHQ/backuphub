"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("@backuphub/db");
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    name: zod_1.z.string().min(1, 'Name is required').max(100),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
async function POST(req) {
    try {
        const body = await req.json();
        const parsed = signupSchema.safeParse(body);
        if (!parsed.success) {
            return server_1.NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
        }
        const { email, name, password } = parsed.data;
        const db = (0, db_1.getDatabase)();
        // Check for existing user
        const [existing] = await db
            .select({ id: db_1.users.id })
            .from(db_1.users)
            .where((0, db_1.eq)(db_1.users.email, email))
            .limit(1);
        if (existing) {
            return server_1.NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const [newUser] = await db
            .insert(db_1.users)
            .values({ email, name, password_hash: passwordHash })
            .returning({ id: db_1.users.id, email: db_1.users.email, name: db_1.users.name });
        return server_1.NextResponse.json({ user: newUser }, { status: 201 });
    }
    catch (error) {
        console.error('[signup] error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map