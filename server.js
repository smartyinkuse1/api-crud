const express = require("express");
const path = require("path")
const dotenv = require('dotenv');
const cors = require("cors");
dotenv.config({path: './config/config.env'})
const bootcamps = require("./routes/bootcamps");
const auth = require("./routes/auth");
const courses = require("./routes/courses");
const users = require("./routes/user");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const xxs = require("xss-clean")
const rateLimit = require("express-rate-limit")
const hpp = require("hpp")
const errrorHandler = require("./middleware/error");
const connectDB = require("./config/db")

connectDB()

const app = express();
app.use(cors())
app.use(express.json())

app.use(cookieParser())

app.use(fileUpload())
app.use(mongoSanitize())
app.use(helmet())
app.use(xxs())

const limiter = rateLimit({
    windowMs: 5*60*1000,
    max: 1000
})
app.use(limiter)
app.use(hpp())

app.use(express.static(path.join(__dirname, 'public')))

app.use("/api/v1/bootcamps", bootcamps)
app.use("/api/v1/courses", courses)
app.use("/api/v1/auth", auth)
app.use("/api/v1/user", users)


app.use(errrorHandler)
const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`));

process.on('unhandledRejection', (err, promise)=>{
    console.log(`Error : ${err.message}`);
    server.close(() => process.exit(1))
})