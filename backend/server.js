import express from 'express';
import cors from 'cors';
import searchSongsRouter from './src/api/searchSongs.js';

const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://yourproductiondomain.com']
  : ['http://localhost:5173', 'https://yourproductiondomain.com'];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

// Use CORS before your routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use('/api', searchSongsRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
