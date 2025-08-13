import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Usuario } from "./Usuario";
import { TipoProtocolo } from "./TipoProtocolo";
import { TipoAcao } from "./TipoAcao";
import { Setor } from "./Setor";

@Entity("ProtocoloDigital_Permissoes")
export class Permissao {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "decimal", precision: 18, scale: 2, nullable: true })
    valorMaximo: number;

    @ManyToOne(() => TipoAcao, acao => acao.permissoes)
    acao: TipoAcao;

    @ManyToOne(() => Usuario, usuario => usuario.permissoes)
    usuario: Usuario;

    @ManyToOne(() => TipoProtocolo, tipo => tipo.permissoes, { nullable: true })
    tipoProtocolo: TipoProtocolo;

    @ManyToOne(() => Setor, setor => setor.permissoes, { nullable: true })
    setor: Setor;
}
