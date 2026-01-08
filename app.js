const express = require("express");
require("dotenv").config()
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

//regular middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//cookie middleware
app.use(cookieParser());

//morgan middleware
app.use(morgan("tiny"));

// Import routes
const userRoutes = require('./src/routes/user');
const projectRoutes = require('./src/routes/project');
const taskRoutes = require('./src/routes/task');

// Use routes
app.use('/api/v1', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1', taskRoutes);

// Export app for use in index.js
module.exports = app;