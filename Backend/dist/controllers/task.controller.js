"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.taskController = {
    async create(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { projectId, sprintId, storyId, title, description, priority, storyPoints } = req.body;
            const task = await prisma.task.create({
                data: {
                    projectId,
                    sprintId: sprintId || null,
                    storyId: storyId || null,
                    title,
                    description,
                    priority: priority || 'MEDIUM',
                    storyPoints: storyPoints || 0,
                    status: 'BACKLOG',
                },
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    comments: true,
                },
            });
            res.status(201).json(task);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getByProject(req, res) {
        try {
            const { projectId } = req.params;
            const { status, sprintId } = req.query;
            const where = { projectId };
            if (status)
                where.status = status;
            if (sprintId)
                where.sprintId = sprintId;
            const tasks = await prisma.task.findMany({
                where,
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            email: true,
                        },
                    },
                    story: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    sprint: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    comments: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json(tasks);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getById(req, res) {
        try {
            const { id } = req.params;
            const task = await prisma.task.findUnique({
                where: { id },
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            email: true,
                            department: true,
                        },
                    },
                    comments: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                    story: true,
                    sprint: true,
                },
            });
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json(task);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const task = await prisma.task.findUnique({ where: { id } });
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
            const updated = await prisma.task.update({
                where: { id },
                data: {
                    ...req.body,
                    updatedAt: new Date(),
                },
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    comments: true,
                },
            });
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async assign(req, res) {
        try {
            const { id } = req.params;
            const { assigneeId } = req.body;
            const task = await prisma.task.update({
                where: { id },
                data: { assigneeId },
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            });
            res.json(task);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async addComment(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { id: taskId } = req.params;
            const { content } = req.body;
            const comment = await prisma.taskComment.create({
                data: {
                    taskId,
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
            res.status(201).json(comment);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.task.delete({ where: { id } });
            res.json({ message: 'Task deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=task.controller.js.map