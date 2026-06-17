"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("../controllers/chat.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/channels', auth_1.authenticate, chat_controller_1.chatController.createChannel);
router.get('/channels/:projectId', auth_1.authenticate, chat_controller_1.chatController.getChannels);
router.get('/:channelId/messages', auth_1.authenticate, chat_controller_1.chatController.getMessages);
router.post('/:channelId/messages', auth_1.authenticate, chat_controller_1.chatController.sendMessage);
router.delete('/messages/:id', auth_1.authenticate, chat_controller_1.chatController.deleteMessage);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map