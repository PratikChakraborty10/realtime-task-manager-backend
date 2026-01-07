const app = require('./app');
const connectWithDb = require('./src/config/db');
require("dotenv").config()

// Connect with database
connectWithDb()

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port: ${process.env.PORT}`)
})