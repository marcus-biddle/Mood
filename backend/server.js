import express from 'express';
import cors from 'cors';
import searchSongsRouter from './src/api/searchSongs.js';

const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://mood-q5ju.onrender.com']
  : ['http://localhost:5173', 'https://mood-q5ju.onrender.com'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // if you use cookies or authorization headers
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', searchSongsRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
