"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_controller_1 = require("../controllers/project.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, project_controller_1.projectController.create);
router.get('/', auth_1.authenticate, project_controller_1.projectController.getAll);
router.get('/:id', auth_1.authenticate, project_controller_1.projectController.getById);
router.put('/:id', auth_1.authenticate, project_controller_1.projectController.update);
router.delete('/:id', auth_1.authenticate, project_controller_1.projectController.delete);
router.get('/:id/stats', auth_1.authenticate, project_controller_1.projectController.getStats);
router.post('/:id/members', auth_1.authenticate, project_controller_1.projectController.addMember);
router.delete('/:id/members/:userId', auth_1.authenticate, project_controller_1.projectController.removeMember);
exports.default = router;
//# sourceMappingURL=project.routes.js.map