import express, { Request, Response } from 'express';
import { TipoAcaoService } from '../services/TipoAcaoService';

const router = express.Router() as express.Router;
const service = new TipoAcaoService();

router.get('/', async (_req: Request, res: Response) => {
    res.json(await service.listar());
});

router.post('/', async (req: Request, res: Response) => {
    res.json(await service.criar(req.body));
});

router.put('/:id', async (req: Request, res: Response) => {
    const acao = await service.atualizar(parseInt(req.params.id, 10), req.body);
    res.json(acao);
});

router.delete('/:id', async (req: Request, res: Response) => {
    await service.remover(parseInt(req.params.id, 10));
    res.sendStatus(204);
});

export default router;
