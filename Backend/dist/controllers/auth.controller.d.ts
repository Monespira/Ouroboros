import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const authController: {
    register(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    me(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=auth.controller.d.ts.map