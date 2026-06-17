"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const task_controller_1 = require("../controllers/task.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, task_controller_1.taskController.create);
router.get('/project/:projectId', auth_1.authenticate, task_controller_1.taskController.getByProject);
router.get('/:id', auth_1.authenticate, task_controller_1.taskController.getById);
router.put('/:id', auth_1.authenticate, task_controller_1.taskController.update);
router.patch('/:id/assign', auth_1.authenticate, task_controller_1.taskController.assign);
router.post('/:id/comments', auth_1.authenticate, task_controller_1.taskController.addComment);
router.delete('/:id', auth_1.authenticate, task_controller_1.taskController.delete);
exports.default = router;
//# sourceMappingURL=task.routes.js.map