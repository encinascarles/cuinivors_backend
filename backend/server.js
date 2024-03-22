import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.get('/api', (req, res) => res.send('API running'));

app.listen(port, () => console.log(`Server started on port ${port}`))
