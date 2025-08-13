import express, { Request, Response } from 'express';
import { TipoProtocoloSetorService } from '../services/TipoProtocoloSetorService';

const router = express.Router() as express.Router;
const service = new TipoProtocoloSetorService();

router.get('/', async (_req: Request, res: Response) => {
    res.json(await service.listarTodos());
});

router.get('/:tipoId', async (req: Request, res: Response) => {
    const tipoId = parseInt(req.params.tipoId, 10);
    res.json(await service.listar(tipoId));
});

router.post('/', async (req: Request, res: Response) => {
    res.json(await service.criar(req.body));
});

router.delete('/:tipoId/:setorId', async (req: Request, res: Response) => {
    await service.remover(parseInt(req.params.tipoId,10), parseInt(req.params.setorId,10));
    res.sendStatus(204);
});

export default router;
