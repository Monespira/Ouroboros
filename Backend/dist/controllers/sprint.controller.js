"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sprintController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.sprintController = {
    async create(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { projectId, name, goal, startDate, endDate } = req.body;
            const project = await prisma.project.findUnique({
                where: { id: projectId },
            });
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            if (project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            const sprint = await prisma.sprint.create({
                data: {
                    projectId,
                    name,
                    goal,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    status: 'PLANNED',
                },
                include: {
                    tasks: true,
                },
            });
            res.status(201).json(sprint);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getByProject(req, res) {
        try {
            const { projectId } = req.params;
            const sprints = await prisma.sprint.findMany({
                where: { projectId },
                include: {
                    tasks: {
                        include: {
                            assignee: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { startDate: 'desc' },
            });
            res.json(sprints);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const sprint = await prisma.sprint.findUnique({
                where: { id },
                include: { project: true },
            });
            if (!sprint) {
                return res.status(404).json({ error: 'Sprint not found' });
            }
            if (sprint.project.ownerId !== req.user?.id && req.user?.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            const updated = await prisma.sprint.update({
                where: { id },
                data: req.body,
                include: { tasks: true },
            });
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            const sprint = await prisma.sprint.findUnique({
                where: { id },
                include: { project: true },
            });
            if (!sprint) {
                return res.status(404).json({ error: 'Sprint not found' });
            }
            if (sprint.project.ownerId !== req.user?.id && req.user?.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            await prisma.sprint.delete({ where: { id } });
            res.json({ message: 'Sprint deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getStats(req, res) {
        try {
            const { id } = req.params;
            const sprint = await prisma.sprint.findUnique({
                where: { id },
                include: {
                    tasks: {
                        select: {
                            status: true,
                            storyPoints: true,
                        },
                    },
                },
            });
            if (!sprint) {
                return res.status(404).json({ error: 'Sprint not found' });
            }
            const stats = {
                totalTasks: sprint.tasks.length,
                completedTasks: sprint.tasks.filter((t) => t.status === 'DONE').length,
                totalPoints: sprint.tasks.reduce((sum, t) => sum + t.storyPoints, 0),
                completedPoints: sprint.tasks
                    .filter((t) => t.status === 'DONE')
                    .reduce((sum, t) => sum + t.storyPoints, 0),
            };
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=sprint.controller.js.map