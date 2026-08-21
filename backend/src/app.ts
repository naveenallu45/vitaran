import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows browser to load static images from backend localhost url
}));

// CORS configuration
app.use(
  cors({
    origin: '*', // We can restrict this in production if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' })); // support large base64 uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static images
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
