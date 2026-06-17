import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const taskController: {
    create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getByProject(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    assign(req: AuthRequest, res: Response): Promise<void>;
    addComment(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=task.controller.d.ts.map