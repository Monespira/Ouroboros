"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forumController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.forumController = {
    async createPost(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { forumId, projectId, title, content, type, tags } = req.body;
            const post = await prisma.forumPost.create({
                data: {
                    forumId,
                    projectId: projectId || null,
                    authorId: req.user.id,
                    title,
                    content,
                    type: type || 'DISCUSSION',
                    tags: tags || [],
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
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
            });
            res.status(201).json(post);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getPosts(req, res) {
        try {
            const { forumId } = req.params;
            const { type, search, limit = '20', offset = '0' } = req.query;
            const where = { forumId };
            if (type)
                where.type = type;
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } },
                ];
            }
            const posts = await prisma.forumPost.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    comments: {
                        select: {
                            id: true,
                        },
                    },
                    votes: {
                        select: {
                            voteType: true,
                        },
                    },
                },
                orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
                take: parseInt(limit),
                skip: parseInt(offset),
            });
            const total = await prisma.forumPost.count({ where });
            res.json({
                posts: posts.map((p) => ({
                    ...p,
                    commentCount: p.comments.length,
                    votes: {
                        up: p.votes.filter((v) => v.voteType === 'UP').length,
                        down: p.votes.filter((v) => v.voteType === 'DOWN').length,
                    },
                })),
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getPostById(req, res) {
        try {
            const { id } = req.params;
            const post = await prisma.forumPost.update({
                where: { id },
                data: { views: { increment: 1 } },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
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
                            votes: true,
                        },
                    },
                    votes: true,
                },
            });
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json(post);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async addComment(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { id: postId } = req.params;
            const { content } = req.body;
            const comment = await prisma.forumComment.create({
                data: {
                    postId,
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
    async vote(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { postId, commentId, voteType } = req.body;
            const vote = await prisma.forumVote.upsert({
                where: {
                    userId_postId_commentId: {
                        userId: req.user.id,
                        postId: postId || null,
                        commentId: commentId || null,
                    },
                },
                update: { voteType },
                create: {
                    userId: req.user.id,
                    postId: postId || null,
                    commentId: commentId || null,
                    voteType,
                },
            });
            res.json(vote);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async deletePost(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const { id } = req.params;
            const post = await prisma.forumPost.findUnique({ where: { id } });
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            await prisma.forumPost.delete({ where: { id } });
            res.json({ message: 'Post deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=forum.controller.js.map