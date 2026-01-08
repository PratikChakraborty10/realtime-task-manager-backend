const http = require('http');
const app = require('./app');
const connectWithDb = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
require("dotenv").config();

// Connect with database
connectWithDb();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);
});