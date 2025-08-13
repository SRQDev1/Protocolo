import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Usuario } from '../entities/Usuario';

export async function carregarUsuario(req: Request, _res: Response, next: NextFunction) {
    const id = req.header('x-user-id');
    if (id) {
        const repo = AppDataSource.getRepository(Usuario);
        const user = await repo.findOne({ where: { id: parseInt(id, 10) } });
        if (user) req.usuario = user;
    }
    next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.usuario || !req.usuario.administrador) {
        res.sendStatus(403);
        return;
    }
    next();
}

declare global {
    namespace Express {
        interface Request {
            usuario?: Usuario;
        }
    }
}
