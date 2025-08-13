import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { TipoAcao } from "../entities/TipoAcao";

export class TipoAcaoService {
    private get repo(): Repository<TipoAcao> {
        return AppDataSource.getRepository(TipoAcao);
    }

    listar() {
        return this.repo.find();
    }

    async criar(dados: Partial<TipoAcao>) {
        const acao = this.repo.create(dados);
        return await this.repo.save(acao);
    }

    async atualizar(id: number, dados: Partial<TipoAcao>) {
        await this.repo.update(id, dados);
        return this.repo.findOne({ where: { id } });
    }

    async remover(id: number) {
        await this.repo.delete(id);
    }
}
