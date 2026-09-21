import serverless from 'serverless-http';
import app, { connectDB } from './index.js';

let isDbConnected = false;

export const handler = async (event, context) => {
  // Allow Lambda to finish immediately without waiting for background event loop timers
  context.callbackWaitsForEmptyEventLoop = false;

  // Reuse existing MongoDB connection across warm Lambda invocations
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      console.error('Failed to connect to MongoDB in Lambda:', err.message);
    }
  }

  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};
