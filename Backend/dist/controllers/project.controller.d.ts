import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const projectController: {
    create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAll(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    addMember(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    removeMember(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getStats(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=project.controller.d.ts.map