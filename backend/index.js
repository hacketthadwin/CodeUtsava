// index.js

// 🔑 CRITICAL FIX: Ensure environment variables are loaded FIRST
require('dotenv').config();

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const server = http.createServer(app);

// --- ENVIRONMENT & CONFIGURATION CHECK ---
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables. Server cannot start.");
    process.exit(1);
}

console.log("Loaded DB URL:", process.env.DATABASE_URL);

// NOTE: Ensure this path is correct for your MongoDB message model
const Message = require('./models/message');

// --- CORS Configuration (Same for Express and Socket.IO) ---
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://192.168.137.1:5000',
    'http://10.0.2.2:5000',
    'http://127.0.0.1:5000'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Database connection
require("./config/database").connect();

// ===============================================
// 🩺 IMPORT NEW MEDICAL RECORD ROUTES
// ===============================================
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');

// ===============================================
// ⚙️ SOCKET.IO SERVER SETUP
// ===============================================
const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// ===============================================
// 🛡️ SOCKET AUTHENTICATION MIDDLEWARE
// ===============================================
const verifySocketToken = (token) => {
    return jwt.verify(token, SECRET_KEY);
};

io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) {
        return next(new Error('Authentication Error: Token missing.'));
    }

    try {
        const decoded = verifySocketToken(token);
        socket.userId = decoded.id || decoded._id || decoded.user_id;
        socket.userName = decoded.name || 'Unknown User';
        next();
    } catch (err) {
        return next(new Error('Authentication Error: Invalid token.'));
    }
});

// ===============================================
// 💬 SOCKET EVENT HANDLERS
// ===============================================
io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected (Socket ID: ${socket.id})`);

    socket.on('joinRoom', async ({ roomId, role }) => {
        const userId = socket.userId;
        socket.join(roomId);
        console.log(`[Chat] ${role} ${userId} joined room: ${roomId}`);

        try {
            const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
            socket.emit('previousMessages', messages);
        } catch (err) {
            console.error('Error fetching previous messages:', err);
        }
    });

    socket.on('sendMessage', async ({ roomId, receiverId, message }) => {
        const senderId = socket.userId;
        const senderName = socket.userName;

        io.to(roomId).emit('receiveMessage', {
            senderId,
            senderName,
            message,
            timestamp: Date.now(),
            roomId
        });

        try {
            await Message.create({
                roomId,
                sender: senderId,
                receiver: receiverId,
                message
            });
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔌 User ${socket.userId} disconnected (Socket ID: ${socket.id})`);
    });
});

// ===============================================
// 🌐 EXPRESS ROUTES
// ===============================================
const user = require("./routes/user");
const appointmentRoutes = require("./routes/appointmentRoutes");

// Existing routes
app.use("/api/v1", user);
app.use("/api/v1/appointments", appointmentRoutes);

// 🩺 NEW MEDICAL RECORD ROUTE (Symptom APIs)
app.use("/api/v1/records", medicalRecordRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Hello, World! REST API is running.');
});

// ===============================================
// 🚀 START SERVER (HTTP + SOCKET.IO)
// ===============================================
server.listen(5000, '0.0.0.0', () => {
    console.log('✅ Server is running on port 5000 and accessible externally.');
});
