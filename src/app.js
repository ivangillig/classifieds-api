import express from 'express';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors'; // Import the CORS middleware
import './config/passport.js';
import routes from './routes/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL, // Allow requests only from frontend
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/' }) // Store sessions in MongoDB
}));

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Use the defined routes
app.use(routes);

export default app;
