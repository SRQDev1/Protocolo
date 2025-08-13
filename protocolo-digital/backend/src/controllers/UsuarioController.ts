import express, { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';

const router = express.Router() as express.Router;
const service = new UsuarioService();

router.get('/', async (_req: Request, res: Response) => {
    const usuarios = await service.listar();
    res.json(usuarios);
});

router.post('/', async (req: Request, res: Response) => {
    const { nome, email, senha, administrador } = req.body;
    const senhaHash = senha;
    const usuario = await service.criar({ nome, email, senhaHash, administrador });
    res.json(usuario);
});

router.post('/:id/setores', async (req: Request, res: Response) => {
    const usuarioId = parseInt(req.params.id, 10);
    const { setorIds } = req.body;
    const vinculos = await service.vincularSetores(usuarioId, setorIds);
    res.json(vinculos);
});

router.get('/:id/setores', async (req: Request, res: Response) => {
    const usuarioId = parseInt(req.params.id, 10);
    const vinculos = await service.listarSetores(usuarioId);
    res.json(vinculos);
});

router.put('/:id/setores', async (req: Request, res: Response) => {
    const usuarioId = parseInt(req.params.id, 10);
    const { setorIds } = req.body;
    const vinculos = await service.atualizarSetores(usuarioId, setorIds);
    res.json(vinculos);
});

router.delete('/:id/setores/:setorId', async (req: Request, res: Response) => {
    const usuarioId = parseInt(req.params.id, 10);
    const setorId = parseInt(req.params.setorId, 10);
    await service.removerVinculo(usuarioId, setorId);
    res.sendStatus(204);
});

export default router;
