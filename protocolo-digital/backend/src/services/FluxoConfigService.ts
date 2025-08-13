import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { FluxoAprovacao } from "../entities/FluxoAprovacao";

export class FluxoConfigService {
    private get repo(): Repository<FluxoAprovacao> {
        return AppDataSource.getRepository(FluxoAprovacao);
    }

    listar(tipoProtocoloId: number) {
        return this.repo.find({
            where: { tipoProtocolo: { id: tipoProtocoloId } },
            order: { ordem: 'ASC' },
            relations: ['setor', 'tipoProtocolo']
        });
    }

    async criar(dados: Partial<FluxoAprovacao>) {
        const f = this.repo.create(dados);
        return await this.repo.save(f);
    }

    async atualizar(id: number, dados: Partial<FluxoAprovacao>) {
        await this.repo.update(id, dados);
        return this.repo.findOne({ where: { id }, relations: ['setor', 'tipoProtocolo'] });
    }

    async remover(id: number) {
        await this.repo.delete(id);
    }
}
