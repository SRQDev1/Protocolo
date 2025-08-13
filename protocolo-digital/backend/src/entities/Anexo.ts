import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Protocolo } from "./Protocolo";

@Entity("ProtocoloDigital_Anexos")
export class Anexo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    nomeArquivo: string;

    @Column({ length: 50 })
    tipo: string;

    @Column()
    tamanho: number;

    @Column({ length: 255 })
    caminho: string;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    dataUpload: Date;

    @ManyToOne(() => Protocolo, protocolo => protocolo.anexos)
    protocolo: Protocolo;
}
