const { Server } = require('socket.io');
const supabase = require('./supabase');

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // JWT Authentication middleware
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                return next(new Error('Invalid token'));
            }

            socket.userId = user.id;
            socket.userEmail = user.email;
            next();
        } catch (error) {
            next(new Error('Authentication failed'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join project room
        socket.on('join:project', (projectId) => {
            socket.join(`project:${projectId}`);
            console.log(`User ${socket.userId} joined project:${projectId}`);
        });

        // Leave project room
        socket.on('leave:project', (projectId) => {
            socket.leave(`project:${projectId}`);
        });

        // Join task room (for comments)
        socket.on('join:task', (taskId) => {
            socket.join(`task:${taskId}`);
            console.log(`User ${socket.userId} joined task:${taskId}`);
        });

        // Leave task room
        socket.on('leave:task', (taskId) => {
            socket.leave(`task:${taskId}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, getIO };
