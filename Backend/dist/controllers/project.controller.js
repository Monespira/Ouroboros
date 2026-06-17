"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
const project_service_1 = require("../services/project.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.projectController = {
    async create(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { name, slug, description, goals, area, tags, startDate, targetDate, } = req.body;
            const project = await project_service_1.projectService.createProject(req.user.tenantId, req.user.id, {
                name,
                slug,
                description,
                goals,
                area,
                tags,
                startDate: new Date(startDate),
                targetDate: new Date(targetDate),
            });
            res.status(201).json(project);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getAll(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const projects = await project_service_1.projectService.getProjectsByTenant(req.user.tenantId);
            res.json(projects);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getById(req, res) {
        try {
            const { id } = req.params;
            const project = await project_service_1.projectService.getProjectById(id);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.json(project);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async update(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { id } = req.params;
            const project = await project_service_1.projectService.getProjectById(id);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            if (project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            const updated = await project_service_1.projectService.updateProject(id, req.body);
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async delete(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { id } = req.params;
            const project = await project_service_1.projectService.getProjectById(id);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            if (project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            await project_service_1.projectService.deleteProject(id);
            res.json({ message: 'Project deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async addMember(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { id: projectId } = req.params;
            const { userId, role } = req.body;
            const project = await project_service_1.projectService.getProjectById(projectId);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            if (project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            const member = await project_service_1.projectService.addMember(projectId, userId, role);
            res.status(201).json(member);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async removeMember(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { id: projectId, userId } = req.params;
            const project = await project_service_1.projectService.getProjectById(projectId);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            if (project.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            await project_service_1.projectService.removeMember(projectId, userId);
            res.json({ message: 'Member removed successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await project_service_1.projectService.getProjectStats(id);
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=project.controller.js.map