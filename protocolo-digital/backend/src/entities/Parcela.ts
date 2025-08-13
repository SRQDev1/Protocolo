import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Protocolo } from "./Protocolo";

@Entity("ProtocoloDigital_Parcelas")
export class Parcela {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "decimal", precision: 18, scale: 2 })
    valor: number;

    @Column({ type: "date" })
    vencimento: Date;

    @Column({ length: 50 })
    status: string;

    @Column({ length: 255, nullable: true })
    observacao: string;

    @ManyToOne(() => Protocolo, protocolo => protocolo.parcelas)
    protocolo: Protocolo;
}
