import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const forumController: {
    createPost(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPosts(req: AuthRequest, res: Response): Promise<void>;
    getPostById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    addComment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    vote(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deletePost(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=forum.controller.d.ts.map