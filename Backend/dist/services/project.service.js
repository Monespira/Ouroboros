"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.projectService = {
    async createProject(tenantId, ownerId, data) {
        return await prisma.project.create({
            data: {
                tenantId,
                ownerId,
                name: data.name,
                slug: data.slug,
                description: data.description,
                goals: data.goals,
                area: data.area,
                tags: JSON.stringify(data.tags || []),
                startDate: data.startDate,
                targetDate: data.targetDate,
                status: 'PLANNING',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                                department: true,
                            },
                        },
                    },
                },
            },
        });
    },
    async getProjectById(projectId) {
        return await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                                department: true,
                                role: true,
                            },
                        },
                    },
                },
                sprints: {
                    include: {
                        tasks: true,
                    },
                },
                tasks: {
                    where: { sprintId: null },
                    take: 10,
                },
            },
        });
    },
    async getProjectsByTenant(tenantId) {
        return await prisma.project.findMany({
            where: { tenantId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                members: {
                    select: {
                        userId: true,
                    },
                },
                sprints: {
                    where: { status: 'ACTIVE' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    async updateProject(projectId, data) {
        const { tags, ...rest } = data;
        return await prisma.project.update({
            where: { id: projectId },
            data: {
                ...rest,
                ...(tags !== undefined && { tags: JSON.stringify(tags) }),
                updatedAt: new Date(),
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                                department: true,
                            },
                        },
                    },
                },
            },
        });
    },
    async deleteProject(projectId) {
        return await prisma.project.delete({
            where: { id: projectId },
        });
    },
    async addMember(projectId, userId, role = 'PARTICIPANT') {
        const validRoles = ['ADMIN', 'PROJECT_OWNER', 'PARTICIPANT'];
        const normalizedRole = (typeof role === 'string' ? role.toUpperCase() : role);
        if (!validRoles.includes(normalizedRole)) {
            throw new Error(`Invalid role: ${role}`);
        }
        return await prisma.projectMember.upsert({
            where: {
                projectId_userId: { projectId, userId },
            },
            update: { role: normalizedRole },
            create: {
                projectId,
                userId,
                role: normalizedRole,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        department: true,
                    },
                },
            },
        });
    },
    async removeMember(projectId, userId) {
        return await prisma.projectMember.delete({
            where: {
                projectId_userId: { projectId, userId },
            },
        });
    },
    async getProjectStats(projectId) {
        const [tasks, sprints, members] = await Promise.all([
            prisma.task.groupBy({
                by: ['status'],
                where: { projectId },
                _count: true,
            }),
            prisma.sprint.findMany({
                where: { projectId, status: 'ACTIVE' },
                include: {
                    tasks: {
                        select: {
                            storyPoints: true,
                            status: true,
                        },
                    },
                },
            }),
            prisma.projectMember.count({
                where: { projectId },
            }),
        ]);
        return {
            tasks: tasks.reduce((acc, t) => {
                acc[t.status] = t._count;
                return acc;
            }, {}),
            activeSprints: sprints.length,
            totalMembers: members,
            sprints: sprints.map((s) => ({
                id: s.id,
                name: s.name,
                completedPoints: s.completedPoints,
                plannedPoints: s.plannedPoints,
                velocity: s.velocity,
            })),
        };
    },
};
//# sourceMappingURL=project.service.js.map