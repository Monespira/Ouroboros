"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.authService = {
    async register(tenantId, email, password, name) {
        const userExists = await prisma.user.findUnique({
            where: { tenantId_email: { tenantId, email } },
        });
        if (userExists) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                tenantId,
                email,
                password: hashedPassword,
                name,
                role: 'PARTICIPANT',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                tenantId: true,
            },
        });
        const signOptions = {
            expiresIn: (process.env.JWT_EXPIRE || '7d'),
        };
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role,
        }, process.env.JWT_SECRET || 'secret', signOptions);
        return { user, token };
    },
    async login(email, password) {
        const user = await prisma.user.findFirst({
            where: { email },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid password');
        }
        const signOptions = {
            expiresIn: (process.env.JWT_EXPIRE || '7d'),
        };
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role,
        }, process.env.JWT_SECRET || 'secret', signOptions);
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    },
};
//# sourceMappingURL=auth.service.js.map