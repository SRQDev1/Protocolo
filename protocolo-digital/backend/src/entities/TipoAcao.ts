import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Permissao } from "./Permissao";

@Entity("ProtocoloDigital_TiposAcao")
export class TipoAcao {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    nome: string;

    @Column({ length: 255, nullable: true })
    descricao: string;

    @OneToMany(() => Permissao, permissao => permissao.acao)
    permissoes: Permissao[];
}
