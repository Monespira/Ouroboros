"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const sprint_routes_1 = __importDefault(require("./routes/sprint.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const forum_routes_1 = __importDefault(require("./routes/forum.routes"));
const meeting_routes_1 = __importDefault(require("./routes/meeting.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/sprints', sprint_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/forum', forum_routes_1.default);
app.use('/api/meetings', meeting_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3001;
const start = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✓ Database connected');
        app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL}`);
        });
    }
    catch (error) {
        console.error('✗ Failed to start server:', error);
        process.exit(1);
    }
};
// Graceful shutdown
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
start();
//# sourceMappingURL=server.js.map