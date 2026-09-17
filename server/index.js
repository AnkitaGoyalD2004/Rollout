import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import benchmarkRoutes from './routes/benchmarkRoutes.js';
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
app.use('/api/benchmark', benchmarkRoutes);

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'Rollout Backend is running!' });
    });

    const connectDB = async () => {
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
      } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
      }
    };

    // Listen on 0.0.0.0 so both localhost and 127.0.0.1 can connect!
    connectDB().then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    });