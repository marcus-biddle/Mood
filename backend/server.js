import express from 'express';
import searchSongsRouter from './src/api/searchSongs.js';

const app = express();

app.use(express.json());
app.use('/api', searchSongsRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
