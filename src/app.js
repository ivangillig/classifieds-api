import express from 'express'
import passport from 'passport'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import cors from 'cors'
import './config/passport.js'
import routes from './routes/index.js'
import dotenv from 'dotenv'
import errorHandler from './middleware/errorHandler.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

// Middleware for parsing JSON and URL-encoded data
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGO_URI ||
        'mongodb://admin:SecureMongoDB2025!@127.0.0.1:27017/classifieds?authSource=admin',
    }),
  })
)

// Initialize Passport for authentication
app.use(passport.initialize())
app.use(passport.session())

// Use the defined routes
app.use(routes)

// Error handling middleware (must be placed at the end of all routes)
app.use(errorHandler)

export default app
