import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './db.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Inventory System API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await pool.connect();
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
});
