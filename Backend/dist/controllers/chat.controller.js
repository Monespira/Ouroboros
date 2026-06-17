"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.chatController = {
    async createChannel(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            const { projectId, name, description, isPrivate } = req.body;
            const channel = await prisma.chatChannel.create({
                data: {
                    projectId,
                    name,
                    description: description || null,
                    isPrivate: isPrivate || false,
                },
            });
            res.status(201).json(channel);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getChannels(req, res) {
        try {
            const { projectId } = req.params;
            const channels = await prisma.chatChannel.findMany({
                where: { projectId },
                include: {
                    messages: {
                        select: {
                            id: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json(channels.map((c) => ({
                ...c,
                messageCount: c.messages.length,
                lastMessage: c.messages[0]?.createdAt || null,
            })));
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getMessages(req, res) {
        try {
            const { channelId } = req.params;
            const { limit = '50', offset = '0' } = req.query;
            const messages = await prisma.chatMessage.findMany({
                where: { channelId },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: parseInt(limit),
                skip: parseInt(offset),
            });
            res.json(messages.reverse());
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async sendMessage(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            const { channelId } = req.params;
            const { content } = req.body;
            const message = await prisma.chatMessage.create({
                data: {
                    channelId,
                    authorId: req.user.id,
                    content,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            });
            res.status(201).json(message);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            await prisma.chatMessage.delete({ where: { id } });
            res.json({ message: 'Message deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=chat.controller.js.map