import express from 'express';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import './config/passport.js';
import routes from './routes/index.js';
import config from '../config/config.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session
app.use(session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: config.MONGO_URI || 'mongodb://localhost:27017/' })
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(routes);

export default app;
