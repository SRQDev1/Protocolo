import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Usuario } from '../entities/Usuario';

const router = express.Router() as express.Router;

router.post('/login', async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(Usuario);
    const { email, senha } = req.body;
    const usuario = await repo.findOne({ where: { email } });
    if (!usuario) {
        res.status(401).json({ message: 'Credenciais inválidas' });
        return;
    }
    const valid = usuario.senhaHash === senha;
    if (!valid) {
        res.status(401).json({ message: 'Credenciais inválidas' });
        return;
    }
    const { senhaHash, ...rest } = usuario;
    res.json(rest);
});

export default router;
