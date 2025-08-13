import express, { Request, Response } from 'express';
import { FluxoConfigService } from '../services/FluxoConfigService';

const router = express.Router() as express.Router;
const service = new FluxoConfigService();

router.get('/:tipoProtocoloId', async (req: Request, res: Response) => {
    const tipoId = parseInt(req.params.tipoProtocoloId, 10);
    res.json(await service.listar(tipoId));
});

router.post('/', async (req: Request, res: Response) => {
    res.json(await service.criar(req.body));
});

router.put('/:id', async (req: Request, res: Response) => {
    const f = await service.atualizar(parseInt(req.params.id, 10), req.body);
    res.json(f);
});

router.delete('/:id', async (req: Request, res: Response) => {
    await service.remover(parseInt(req.params.id, 10));
    res.sendStatus(204);
});

export default router;
