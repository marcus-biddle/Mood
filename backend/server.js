import express from 'express';
import cors from 'cors';
import searchSongsRouter from './src/api/searchSongs.js';

const app = express();

// Use simple fixed origin CORS middleware:
app.use(cors());
app.use(express.json());
app.use('/api', searchSongsRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
