import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Protocolo } from "./Protocolo";
import { Usuario } from "./Usuario";

@Entity("ProtocoloDigital_Historico")
export class Historico {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    acao: string;

    @Column("text", { nullable: true })
    observacao: string | null;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    dataHora: Date;

    @Column("text", { nullable: true })
    dadosAntigos: string;

    @Column("text", { nullable: true })
    dadosNovos: string;

    @Column({ length: 50, nullable: true })
    ip: string;

    @ManyToOne(() => Protocolo, protocolo => protocolo.historico)
    protocolo: Protocolo;

    @ManyToOne(() => Usuario, usuario => usuario.historicos)
    usuario: Usuario;
}
