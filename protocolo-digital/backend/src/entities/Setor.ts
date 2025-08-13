import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UsuarioSetor } from "./UsuarioSetor";
import { FluxoAprovacao } from "./FluxoAprovacao";
import { Protocolo } from "./Protocolo";
import { Permissao } from "./Permissao";
import { TipoProtocoloSetor } from "./TipoProtocoloSetor";

@Entity("ProtocoloDigital_Setores")
export class Setor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nome: string;

    @Column({ length: 255, nullable: true })
    descricao: string;

    @Column({ default: true })
    ativo: boolean;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    dataCriacao: Date;

    @OneToMany(() => UsuarioSetor, usuarioSetor => usuarioSetor.setor)
    usuarios: UsuarioSetor[];

    @OneToMany(() => FluxoAprovacao, fluxo => fluxo.setor)
    fluxosAprovacao: FluxoAprovacao[];

    @OneToMany(() => Protocolo, protocolo => protocolo.setorOrigem)
    protocolosOrigem: Protocolo[];

    @OneToMany(() => Permissao, permissao => permissao.setor)
    permissoes: Permissao[];

    @OneToMany(() => TipoProtocoloSetor, ts => ts.setor)
    tiposProtocolo: TipoProtocoloSetor[];
}
