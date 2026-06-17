"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.authController = {
    async register(req, res) {
        try {
            const { email, password, name, tenantId } = req.body;
            if (!email || !password || !name) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const result = await auth_service_1.authService.register(tenantId, email, password, name);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }
            const result = await auth_service_1.authService.login(email, password);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    },
    async me(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    image: true,
                    department: true,
                    title: true,
                    bio: true,
                    tenantId: true,
                },
            });
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async updateProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { name, title, department, bio, image } = req.body;
            const user = await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    name: name || undefined,
                    title: title || undefined,
                    department: department || undefined,
                    bio: bio || undefined,
                    image: image || undefined,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    image: true,
                    department: true,
                    title: true,
                    bio: true,
                },
            });
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=auth.controller.js.map