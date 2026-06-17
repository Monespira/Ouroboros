"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.meetingController = {
    async create(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { projectId, sprintId, title, description, type, scheduledAt, meetingLink, } = req.body;
            const meeting = await prisma.meeting.create({
                data: {
                    projectId,
                    sprintId: sprintId || null,
                    creatorId: req.user.id,
                    title,
                    description,
                    type: type || 'OTHER',
                    scheduledAt: new Date(scheduledAt),
                    meetingLink: meetingLink || null,
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            });
            res.status(201).json(meeting);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getByProject(req, res) {
        try {
            const { projectId } = req.params;
            const meetings = await prisma.meeting.findMany({
                where: { projectId },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    attendees: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: { scheduledAt: 'asc' },
            });
            res.json(meetings);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getById(req, res) {
        try {
            const { id } = req.params;
            const meeting = await prisma.meeting.findUnique({
                where: { id },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            email: true,
                        },
                    },
                    attendees: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            email: true,
                        },
                    },
                },
            });
            if (!meeting) {
                return res.status(404).json({ error: 'Meeting not found' });
            }
            res.json(meeting);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async addAttendee(req, res) {
        try {
            const { id: meetingId } = req.params;
            const { userId } = req.body;
            const meeting = await prisma.meeting.update({
                where: { id: meetingId },
                data: {
                    attendees: {
                        connect: { id: userId },
                    },
                },
                include: {
                    attendees: true,
                },
            });
            res.json(meeting);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async start(req, res) {
        try {
            const { id } = req.params;
            const meeting = await prisma.meeting.update({
                where: { id },
                data: {
                    status: 'IN_PROGRESS',
                    startedAt: new Date(),
                },
                include: {
                    creator: true,
                    attendees: true,
                },
            });
            res.json(meeting);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async end(req, res) {
        try {
            const { id } = req.params;
            const { notes } = req.body;
            const meeting = await prisma.meeting.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    endedAt: new Date(),
                    notes: notes || null,
                },
                include: {
                    creator: true,
                    attendees: true,
                },
            });
            res.json(meeting);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.meeting.delete({ where: { id } });
            res.json({ message: 'Meeting deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=meeting.controller.js.map