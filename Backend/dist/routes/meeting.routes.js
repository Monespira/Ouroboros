"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const meeting_controller_1 = require("../controllers/meeting.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, meeting_controller_1.meetingController.create);
router.get('/project/:projectId', auth_1.authenticate, meeting_controller_1.meetingController.getByProject);
router.get('/:id', auth_1.authenticate, meeting_controller_1.meetingController.getById);
router.post('/:id/attendees', auth_1.authenticate, meeting_controller_1.meetingController.addAttendee);
router.patch('/:id/start', auth_1.authenticate, meeting_controller_1.meetingController.start);
router.patch('/:id/end', auth_1.authenticate, meeting_controller_1.meetingController.end);
router.delete('/:id', auth_1.authenticate, meeting_controller_1.meetingController.delete);
exports.default = router;
//# sourceMappingURL=meeting.routes.js.map