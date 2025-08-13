import { Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { Usuario } from "./Usuario";
import { Setor } from "./Setor";

@Entity("ProtocoloDigital_UsuarioSetores")
export class UsuarioSetor {
    @PrimaryColumn()
    usuarioId: number;

    @PrimaryColumn()
    setorId: number;

    @ManyToOne(() => Usuario, usuario => usuario.setores, { onDelete: "CASCADE" })
    usuario: Usuario;

    @ManyToOne(() => Setor, setor => setor.usuarios, { onDelete: "CASCADE" })
    setor: Setor;
}
