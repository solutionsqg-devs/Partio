import express from 'express';
import type { Request, Response } from 'express';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('¡Backend con TypeScript corriendo!');
});

app.get('/api/usuarios', (req: Request, res: Response) => {
  res.json([
    { id: 1, nombre: 'Gustavo' },
    { id: 2, nombre: 'Quimey' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});