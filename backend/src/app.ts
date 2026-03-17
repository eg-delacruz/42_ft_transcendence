import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

import { router } from '@routes/index';

// Middlewares
import { errorHandler } from '@middlewares/error.middleware';
import { notFoundMiddleware } from '@middlewares/notFound.middleware';

const app = express();

// Middleware
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// If behind a proxy (e.g., when deployed on Heroku), trust the proxy
app.set('trust proxy', true); // trust first proxy

// Explanation: this creates an endpoint to serve static files from the 'uploads' directory. When a request is made to '/uploads/somefile.jpg', Express will look for 'somefile.jpg' in the 'uploads' directory and serve it if found. This is useful for serving user-uploaded files or any other static assets that are stored in the 'uploads' folder.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// CORS
app.use(
  cors({
    origin: 'http://localhost:5173', // Update this to your frontend URL in production
    credentials: true, // Allow cookies to be sent in CORS requests
  }),
);

// Cookie parser (used to parse cookies from requests)
app.use(cookieParser());

// HTTP request logger -> displays the requests in the console
// It takes 'dev' as an argument, which is a predefined format string that tells morgan to log requests in a concise format that includes the method, URL, status code, response time, and other relevant information. This is useful for development and debugging purposes.
app.use(morgan('dev'));

// Routes
app.use('/api', router);

// 404 Not Found middleware
app.use(notFoundMiddleware);

app.use(errorHandler);

export default app;
