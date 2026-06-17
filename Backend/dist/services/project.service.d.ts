import { ProjectStatus, Role } from '@prisma/client';
export declare const projectService: {
    createProject(tenantId: string, ownerId: string, data: {
        name: string;
        slug: string;
        description: string;
        goals: string;
        area?: string;
        tags?: string[];
        startDate: Date;
        targetDate: Date;
    }): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
        members: ({
            user: {
                id: string;
                name: string;
                email: string;
                department: string | null;
                image: string | null;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.Role;
            projectId: string;
            userId: string;
            joinedAt: Date;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        slug: string;
        description: string;
        goals: string;
        icon: string | null;
        area: string | null;
        tags: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date;
        targetDate: Date;
        ownerId: string;
    }>;
    getProjectById(projectId: string): Promise<({
        owner: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
        members: ({
            user: {
                id: string;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                image: string | null;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.Role;
            projectId: string;
            userId: string;
            joinedAt: Date;
        })[];
        sprints: ({
            tasks: {
                id: string;
                title: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                status: import(".prisma/client").$Enums.TaskStatus;
                startDate: Date | null;
                sprintId: string | null;
                projectId: string;
                storyId: string | null;
                assigneeId: string | null;
                priority: import(".prisma/client").$Enums.Priority;
                storyPoints: number;
                labels: string | null;
                attachments: string | null;
                dueDate: Date | null;
                completedAt: Date | null;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SprintStatus;
            startDate: Date;
            projectId: string;
            goal: string;
            endDate: Date;
            velocity: number;
            plannedPoints: number;
            completedPoints: number;
        })[];
        tasks: {
            id: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            status: import(".prisma/client").$Enums.TaskStatus;
            startDate: Date | null;
            sprintId: string | null;
            projectId: string;
            storyId: string | null;
            assigneeId: string | null;
            priority: import(".prisma/client").$Enums.Priority;
            storyPoints: number;
            labels: string | null;
            attachments: string | null;
            dueDate: Date | null;
            completedAt: Date | null;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        slug: string;
        description: string;
        goals: string;
        icon: string | null;
        area: string | null;
        tags: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date;
        targetDate: Date;
        ownerId: string;
    }) | null>;
    getProjectsByTenant(tenantId: string): Promise<({
        owner: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
        members: {
            userId: string;
        }[];
        sprints: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SprintStatus;
            startDate: Date;
            projectId: string;
            goal: string;
            endDate: Date;
            velocity: number;
            plannedPoints: number;
            completedPoints: number;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        slug: string;
        description: string;
        goals: string;
        icon: string | null;
        area: string | null;
        tags: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date;
        targetDate: Date;
        ownerId: string;
    })[]>;
    updateProject(projectId: string, data: Partial<{
        name: string;
        slug: string;
        description: string;
        goals: string;
        area: string;
        tags: string[];
        status: ProjectStatus;
        startDate: Date;
        targetDate: Date;
    }>): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
        members: ({
            user: {
                id: string;
                name: string;
                email: string;
                department: string | null;
                image: string | null;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.Role;
            projectId: string;
            userId: string;
            joinedAt: Date;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        slug: string;
        description: string;
        goals: string;
        icon: string | null;
        area: string | null;
        tags: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date;
        targetDate: Date;
        ownerId: string;
    }>;
    deleteProject(projectId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        slug: string;
        description: string;
        goals: string;
        icon: string | null;
        area: string | null;
        tags: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date;
        targetDate: Date;
        ownerId: string;
    }>;
    addMember(projectId: string, userId: string, role?: Role | string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            department: string | null;
            image: string | null;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.Role;
        projectId: string;
        userId: string;
        joinedAt: Date;
    }>;
    removeMember(projectId: string, userId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        projectId: string;
        userId: string;
        joinedAt: Date;
    }>;
    getProjectStats(projectId: string): Promise<{
        tasks: Record<string, number>;
        activeSprints: number;
        totalMembers: number;
        sprints: {
            id: string;
            name: string;
            completedPoints: number;
            plannedPoints: number;
            velocity: number;
        }[];
    }>;
};
//# sourceMappingURL=project.service.d.ts.map