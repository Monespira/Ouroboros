import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const chatController: {
    createChannel(req: AuthRequest, res: Response): Promise<void>;
    getChannels(req: AuthRequest, res: Response): Promise<void>;
    getMessages(req: AuthRequest, res: Response): Promise<void>;
    sendMessage(req: AuthRequest, res: Response): Promise<void>;
    deleteMessage(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=chat.controller.d.ts.map