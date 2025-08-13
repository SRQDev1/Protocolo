import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { TipoProtocolo } from "./TipoProtocolo";
import { Setor } from "./Setor";

@Entity("ProtocoloDigital_FluxosAprovacao")
export class FluxoAprovacao {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ordem: number;

    @Column({ type: "decimal", precision: 18, scale: 2, default: 0 })
    valorMinimo: number;

    @Column({ type: "decimal", precision: 18, scale: 2, nullable: true })
    valorMaximo: number;

    @Column()
    prazoHoras: number;

    @Column({ length: 20, default: 'Anterior' })
    comportamentoRecusa: string;

    @ManyToOne(() => TipoProtocolo, tipo => tipo.fluxos)
    tipoProtocolo: TipoProtocolo;

    @ManyToOne(() => Setor, setor => setor.fluxosAprovacao)
    setor: Setor;
}
