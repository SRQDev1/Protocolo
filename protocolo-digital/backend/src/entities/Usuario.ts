import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Protocolo } from "./Protocolo";
import { UsuarioSetor } from "./UsuarioSetor";
import { Permissao } from "./Permissao";
import { Historico } from "./Historico";

@Entity("ProtocoloDigital_Usuarios")
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nome: string;

    @Column({ length: 100, unique: true })
    email: string;

    @Column({ length: 255 })
    senhaHash: string;

    @Column({ default: true })
    ativo: boolean;

    @Column({ name: "Administrador", default: false })
    administrador: boolean;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    dataCriacao: Date;

    @OneToMany(() => Protocolo, protocolo => protocolo.usuarioCriador)
    protocolosCriados: Protocolo[];

    @OneToMany(() => UsuarioSetor, usuarioSetor => usuarioSetor.usuario)
    setores: UsuarioSetor[];

    @OneToMany(() => Permissao, permissao => permissao.usuario)
    permissoes: Permissao[];

    @OneToMany(() => Historico, historico => historico.usuario)
    historicos: Historico[];
}
