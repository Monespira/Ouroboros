"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sprint_controller_1 = require("../controllers/sprint.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, sprint_controller_1.sprintController.create);
router.get('/project/:projectId', auth_1.authenticate, sprint_controller_1.sprintController.getByProject);
router.put('/:id', auth_1.authenticate, sprint_controller_1.sprintController.update);
router.delete('/:id', auth_1.authenticate, sprint_controller_1.sprintController.delete);
router.get('/:id/stats', auth_1.authenticate, sprint_controller_1.sprintController.getStats);
exports.default = router;
//# sourceMappingURL=sprint.routes.js.map