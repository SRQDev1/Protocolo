import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Usuario } from "../entities/Usuario";
import { UsuarioSetor } from "../entities/UsuarioSetor";

export class UsuarioService {
    private get usuarioRepo(): Repository<Usuario> {
        return AppDataSource.getRepository(Usuario);
    }

    private get usuarioSetorRepo(): Repository<UsuarioSetor> {
        return AppDataSource.getRepository(UsuarioSetor);
    }

    listar() {
        return this.usuarioRepo.find();
    }

    async criar(dados: Partial<Usuario>) {
        const usuario = this.usuarioRepo.create(dados);
        return await this.usuarioRepo.save(usuario);
    }

    async vincularSetores(usuarioId: number, setoresIds: number[]) {
        const vinculos = setoresIds.map(id => {
            const us = new UsuarioSetor();
            us.usuarioId = usuarioId;
            us.setorId = id;
            return us;
        });
        return await this.usuarioSetorRepo.save(vinculos);
    }

    listarSetores(usuarioId: number) {
        return this.usuarioSetorRepo.find({
            where: { usuarioId },
            relations: ["setor"]
        });
    }

    async removerVinculo(usuarioId: number, setorId: number) {
        await this.usuarioSetorRepo.delete({ usuarioId, setorId });
    }

    async atualizarSetores(usuarioId: number, setoresIds: number[]) {
        await this.usuarioSetorRepo.delete({ usuarioId });
        return this.vincularSetores(usuarioId, setoresIds);
    }
}
