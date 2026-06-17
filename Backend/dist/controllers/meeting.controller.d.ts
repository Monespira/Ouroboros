import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const meetingController: {
    create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getByProject(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    addAttendee(req: AuthRequest, res: Response): Promise<void>;
    start(req: AuthRequest, res: Response): Promise<void>;
    end(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=meeting.controller.d.ts.map