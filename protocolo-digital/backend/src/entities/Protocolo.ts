import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { TipoProtocolo } from "./TipoProtocolo";
import { Setor } from "./Setor";
import { Usuario } from "./Usuario";
import { Parcela } from "./Parcela";
import { Anexo } from "./Anexo";
import { Historico } from "./Historico";

@Entity("ProtocoloDigital_Protocolos")
export class Protocolo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 20 })
    numero: string;

    @Column({ type: "decimal", precision: 18, scale: 2, nullable: true })
    valorTotal: number;

    @Column("text")
    descricao: string;

    @Column({ length: 50 })
    status: string;

    @Column({ type: "int", nullable: true })
    etapaAtual: number | null;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    dataCriacao: Date;

    @Column({ type: "datetime", nullable: true })
    dataAtualizacao: Date;

    @ManyToOne(() => TipoProtocolo, tipo => tipo.protocolos)
    tipoProtocolo: TipoProtocolo;

    @ManyToOne(() => Setor, setor => setor.protocolosOrigem)
    setorOrigem: Setor;

    @ManyToOne(() => Usuario, usuario => usuario.protocolosCriados)
    usuarioCriador: Usuario;

    @OneToMany(() => Parcela, parcela => parcela.protocolo)
    parcelas: Parcela[];

    @OneToMany(() => Anexo, anexo => anexo.protocolo)
    anexos: Anexo[];

    @OneToMany(() => Historico, historico => historico.protocolo)
    historico: Historico[];
}
