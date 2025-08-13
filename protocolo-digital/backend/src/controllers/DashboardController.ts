import express, { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

const router = express.Router() as express.Router;
const service = new DashboardService();

router.get('/tempo-medio-etapas', async (_req: Request, res: Response) => {
    const dados = await service.tempoMedioEtapas();
    res.json(dados);
});

router.get('/volume-status-setor', async (req: Request, res: Response) => {
    const inicio = req.query.inicio ? new Date(req.query.inicio as string) : undefined;
    const fim = req.query.fim ? new Date(req.query.fim as string) : undefined;
    const dados = await service.volumePorStatusSetor(inicio, fim);
    res.json(dados);
});

export default router;
