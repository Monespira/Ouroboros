"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const forum_controller_1 = require("../controllers/forum.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/:forumId/posts', auth_1.authenticate, forum_controller_1.forumController.createPost);
router.get('/:forumId/posts', auth_1.authenticate, forum_controller_1.forumController.getPosts);
router.get('/posts/:id', auth_1.authenticate, forum_controller_1.forumController.getPostById);
router.post('/posts/:id/comments', auth_1.authenticate, forum_controller_1.forumController.addComment);
router.post('/posts/vote', auth_1.authenticate, forum_controller_1.forumController.vote);
router.delete('/posts/:id', auth_1.authenticate, forum_controller_1.forumController.deletePost);
exports.default = router;
//# sourceMappingURL=forum.routes.js.map