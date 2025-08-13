import express, { Request, Response } from 'express';
import { PermissaoService } from '../services/PermissaoService';

const router = express.Router() as express.Router;
const service = new PermissaoService();

router.get('/', async (req: Request, res: Response) => {
    const setor = req.query.setor ? parseInt(req.query.setor as string, 10) : undefined;
    res.json(await service.listar(setor));
});

router.post('/', async (req: Request, res: Response) => {
    res.json(await service.criar(req.body));
});

router.put('/:id', async (req: Request, res: Response) => {
    const p = await service.atualizar(parseInt(req.params.id, 10), req.body);
    res.json(p);
});

router.delete('/:id', async (req: Request, res: Response) => {
    await service.remover(parseInt(req.params.id, 10));
    res.sendStatus(204);
});

export default router;
