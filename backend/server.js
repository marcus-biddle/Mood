import express from 'express';
import cors from 'cors';
import searchSongsRouter from './src/api/searchSongs.js';

const app = express();

const allowedOrigin = process.env.NODE_ENV === 'production' ? 'https://yourproductiondomain.com' : 'http://localhost:5173';

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
app.use('/api', searchSongsRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
