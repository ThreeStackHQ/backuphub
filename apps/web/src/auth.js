"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.signOut = exports.signIn = exports.handlers = void 0;
const next_auth_1 = __importDefault(require("next-auth"));
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("@backuphub/db");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const authConfig = {
    providers: [
        (0, credentials_1.default)({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success)
                    return null;
                const { email, password } = parsed.data;
                const db = (0, db_1.getDatabase)();
                const [user] = await db
                    .select()
                    .from(db_1.users)
                    .where((0, db_1.eq)(db_1.users.email, email))
                    .limit(1);
                if (!user)
                    return null;
                const passwordMatch = await bcryptjs_1.default.compare(password, user.password_hash);
                if (!passwordMatch)
                    return null;
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
            }
            return session;
        },
    },
};
const nextAuth = (0, next_auth_1.default)(authConfig);
exports.handlers = nextAuth.handlers;
exports.signIn = nextAuth.signIn;
exports.signOut = nextAuth.signOut;
exports.auth = nextAuth.auth;
//# sourceMappingURL=auth.js.map