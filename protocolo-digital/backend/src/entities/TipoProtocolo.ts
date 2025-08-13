import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { FluxoAprovacao } from "./FluxoAprovacao";
import { Protocolo } from "./Protocolo";
import { Permissao } from "./Permissao";
import { TipoProtocoloSetor } from "./TipoProtocoloSetor";

@Entity("ProtocoloDigital_TiposProtocolo")
export class TipoProtocolo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nome: string;

    @Column({ length: 255, nullable: true })
    descricao: string;

    @Column({ length: 255, nullable: true })
    anexosObrigatorios: string;

    @Column({ default: true })
    ativo: boolean;

    @Column({ default: false })
    todosSetores: boolean;

    @OneToMany(() => FluxoAprovacao, fluxo => fluxo.tipoProtocolo)
    fluxos: FluxoAprovacao[];

    @OneToMany(() => Protocolo, protocolo => protocolo.tipoProtocolo)
    protocolos: Protocolo[];

    @OneToMany(() => Permissao, permissao => permissao.tipoProtocolo)
    permissoes: Permissao[];

    @OneToMany(() => TipoProtocoloSetor, ts => ts.tipoProtocolo)
    setores: TipoProtocoloSetor[];
}
