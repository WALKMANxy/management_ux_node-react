import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import agentRoutes from './routes/agents';
import clientRoutes from './routes/clients';
import movementRoutes from './routes/movements';

dotenv.config();

const app = express();
const port = process.env.PORT || "";

const corsOptions =  {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Enable CORS
app.use(cors(corsOptions));

/* mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err)); */

app.use(express.json(), l);

app.use('/api/agents', agentRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/movements', movementRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
