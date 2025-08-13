import express, { Request, Response } from 'express';
import { SetorService } from '../services/SetorService';
import { requireAdmin } from '../middlewares/usuario';

const router = express.Router() as express.Router;
const service = new SetorService();

router.get('/', async (req: Request, res: Response) => {
    res.json(await service.listar(req.usuario));
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
    res.json(await service.criar(req.body));
});

router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
    const setor = await service.atualizar(parseInt(req.params.id, 10), req.body);
    res.json(setor);
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
    await service.remover(parseInt(req.params.id, 10));
    res.sendStatus(204);
});

export default router;
