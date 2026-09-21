import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import serverless from 'serverless-http';
import authRoutes from './routes/authRoutes.js';
import flagRoutes from './routes/flagRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Request logger to see requests in terminal
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/flags', flagRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Rollout Backend is running on AWS Lambda!' });
});

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
      process.exit(1);
    }
  }
};

// Start local server if not running inside AWS Lambda
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

// AWS Lambda handler export (Compatible with default "index.handler")
let isDbConnected = false;
export const handler = async (event, context) => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }
  if (!isDbConnected) {
    await connectDB();
    isDbConnected = true;
  }
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};

export default app;