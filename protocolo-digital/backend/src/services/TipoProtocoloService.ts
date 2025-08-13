import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { TipoProtocolo } from "../entities/TipoProtocolo";

export class TipoProtocoloService {
    private get repo(): Repository<TipoProtocolo> {
        return AppDataSource.getRepository(TipoProtocolo);
    }

    listar(setorId?: number) {
        if (!setorId) return this.repo.find();
        return this.repo.createQueryBuilder('t')
            .leftJoin('t.setores', 'ts')
            .where('ts.setorId = :s', { s: setorId })
            .orWhere('t.todosSetores = 1')
            .getMany();
    }

    async criar(dados: Partial<TipoProtocolo>) {
        const tipo = this.repo.create(dados);
        return await this.repo.save(tipo);
    }

    async atualizar(id: number, dados: Partial<TipoProtocolo>) {
        await this.repo.update(id, dados);
        return this.repo.findOne({ where: { id } });
    }

    async remover(id: number) {
        await this.repo.delete(id);
    }
}
