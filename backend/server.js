import express from 'express';
import cors from 'cors';
import busRouter from './routes/bus.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api/bus', busRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'bus-crowding-ai' });
});

app.listen(PORT, () => {
  console.log(`Bus crowding API listening on http://localhost:${PORT}`);
});
