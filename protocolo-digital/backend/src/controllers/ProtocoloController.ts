import express, { Request, Response } from 'express';
import { ProtocoloService } from '../services/ProtocoloService';
import { FluxoAprovacaoService } from '../services/FluxoAprovacaoService';
import { ParcelaService } from '../services/ParcelaService';

const router = express.Router() as express.Router;
const service = new ProtocoloService();
const fluxoService = new FluxoAprovacaoService();
const parcelaService = new ParcelaService();

router.get('/', async (req: Request, res: Response) => {
    const filtros = {
        tipoProtocoloId: req.query.tipoProtocoloId ? parseInt(req.query.tipoProtocoloId as string, 10) : undefined,
        setorId: req.query.setorId ? parseInt(req.query.setorId as string, 10) : undefined,
        status: req.query.status as string | undefined
    };
    const protocolos = await service.listarProtocolos(req.usuario, filtros);
    res.json(protocolos);
});

router.get('/:id', async (req: Request, res: Response) => {
    const protocolo = await service.obterProtocolo(parseInt(req.params.id, 10), req.usuario);
    if (!protocolo) {
        res.sendStatus(404);
        return;
    }
    res.json(protocolo);
});

router.get('/:id/fluxos', async (req: Request, res: Response) => {
    const protocolo = await service.obterProtocolo(parseInt(req.params.id, 10), req.usuario);
    if (!protocolo) {
        res.sendStatus(404);
        return;
    }
    const fluxos = await fluxoService.listarPorTipo(protocolo.tipoProtocolo.id);
    res.json({ fluxos, etapaAtual: protocolo.etapaAtual });
});

router.get('/:id/pode-aprovar', async (req: Request, res: Response) => {
    try {
        const result = await fluxoService.verificarPermissaoParaAprovar(parseInt(req.params.id, 10), req.usuario!);
        res.json(result);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

router.get('/:id/historico', async (req: Request, res: Response) => {
    try {
        const hist = await service.listarHistorico(parseInt(req.params.id, 10));
        res.json(hist);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const protocolo = await service.criarProtocolo(req.body, req.ip, req.usuario);
        res.json(protocolo);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const protocolo = await service.atualizar(parseInt(req.params.id, 10), req.body, req.usuario);
        res.json(protocolo);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

router.post('/:id/aprovar', async (req: Request, res: Response) => {
    try {
        const { observacao } = req.body;
        const protocolo = await fluxoService.aprovar(parseInt(req.params.id, 10), req.usuario!, observacao, req.ip);
        res.json(protocolo);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

router.post('/:id/rejeitar', async (req: Request, res: Response) => {
    try {
        const { observacao } = req.body;
        const protocolo = await fluxoService.rejeitar(parseInt(req.params.id, 10), req.usuario!, observacao, req.ip);
        res.json(protocolo);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

router.post('/:id/corrigir', async (req: Request, res: Response) => {
    try {
        const { observacao } = req.body;
        const protocolo = await fluxoService.corrigir(parseInt(req.params.id, 10), req.usuario!, observacao, req.ip);
        res.json(protocolo);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

router.post('/:id/parcelas', async (req: Request, res: Response) => {
    try {
        const { quantidade, primeiraData } = req.body;
        const parcelas = await parcelaService.gerarParcelas(
            parseInt(req.params.id, 10),
            quantidade,
            new Date(primeiraData)
        );
        res.json(parcelas);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

export default router;
