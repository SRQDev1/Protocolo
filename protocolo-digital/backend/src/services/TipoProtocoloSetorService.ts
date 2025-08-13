import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { TipoProtocoloSetor } from "../entities/TipoProtocoloSetor";

export class TipoProtocoloSetorService {
    private get repo(): Repository<TipoProtocoloSetor> {
        return AppDataSource.getRepository(TipoProtocoloSetor);
    }

    listar(tipoId: number) {
        return this.repo.find({ where: { tipoProtocoloId: tipoId }, relations: ['setor'] });
    }

    listarTodos() {
        return this.repo.createQueryBuilder('ts')
            .leftJoinAndSelect('ts.tipoProtocolo', 'tipo')
            .leftJoinAndSelect('ts.setor', 'setor')
            .getMany();
    }

    async criar(dados: Partial<TipoProtocoloSetor>) {
        const ts = this.repo.create(dados);
        return await this.repo.save(ts);
    }

    async remover(tipoId: number, setorId: number) {
        await this.repo.delete({ tipoProtocoloId: tipoId, setorId });
    }
}
