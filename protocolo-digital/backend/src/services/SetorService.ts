import { Repository, Not } from "typeorm";
import { AppDataSource } from "../config/database";
import { Setor } from "../entities/Setor";
import { Usuario } from "../entities/Usuario";

export class SetorService {
    private get repo(): Repository<Setor> {
        return AppDataSource.getRepository(Setor);
    }

    listar(usuario?: Usuario) {
        if (!usuario || usuario.administrador) {
            return this.repo.find();
        }
        return this.repo.createQueryBuilder('setor')
            .innerJoin('setor.usuarios', 'us', 'us.usuarioId = :u', { u: usuario.id })
            .getMany();
    }

    async criar(dados: Partial<Setor>) {
        const existente = await this.repo.findOne({ where: { nome: dados.nome } });
        if (existente) throw new Error('Nome de setor já utilizado');
        const setor = this.repo.create(dados);
        return await this.repo.save(setor);
    }

    async atualizar(id: number, dados: Partial<Setor>) {
        const existente = await this.repo.findOne({ where: { nome: dados.nome, id: Not(id) } });
        if (dados.nome && existente) throw new Error('Nome de setor já utilizado');
        await this.repo.update(id, dados);
        return this.repo.findOne({ where: { id } });
    }

    async remover(id: number) {
        await this.repo.update(id, { ativo: false });
    }
}
