import { Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { TipoProtocolo } from "./TipoProtocolo";
import { Setor } from "./Setor";

@Entity("ProtocoloDigital_TipoProtocoloSetores")
export class TipoProtocoloSetor {
    @PrimaryColumn()
    tipoProtocoloId: number;

    @PrimaryColumn()
    setorId: number;

    @ManyToOne(() => TipoProtocolo, tipo => tipo.setores, { onDelete: "CASCADE" })
    tipoProtocolo: TipoProtocolo;

    @ManyToOne(() => Setor, setor => setor.tiposProtocolo, { onDelete: "CASCADE" })
    setor: Setor;
}
