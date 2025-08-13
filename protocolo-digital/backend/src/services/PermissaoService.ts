import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Permissao } from "../entities/Permissao";

export class PermissaoService {
    private get repo(): Repository<Permissao> {
        return AppDataSource.getRepository(Permissao);
    }

    listar(setorId?: number) {
        const opts: any = { relations: ["usuario", "tipoProtocolo", "acao", "setor"] };
        if (setorId) {
            opts.where = { setor: { id: setorId } };
        }
        return this.repo.find(opts);
    }

    async criar(dados: Partial<Permissao>) {
        const where: any = {
            usuario: { id: dados.usuario?.id },
            acao: { id: dados.acao?.id }
        };
        if (dados.tipoProtocolo) {
            where.tipoProtocolo = { id: dados.tipoProtocolo.id };
        }
        if (dados.setor) {
            where.setor = { id: dados.setor.id };
        }
        const existe = await this.repo.findOne({ where });
        if (existe) throw new Error('Permissão duplicada');
        const p = this.repo.create(dados);
        return await this.repo.save(p);
    }

    async atualizar(id: number, dados: Partial<Permissao>) {
        await this.repo.update(id, dados);
        return this.repo.findOne({ where: { id }, relations: ["usuario", "tipoProtocolo", "acao", "setor"] });
    }

    async remover(id: number) {
        await this.repo.delete(id);
    }
}
