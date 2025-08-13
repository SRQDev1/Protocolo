import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { FluxoAprovacao } from "../entities/FluxoAprovacao";
import { Protocolo } from "../entities/Protocolo";
import { Historico } from "../entities/Historico";
import { Usuario } from "../entities/Usuario";
import { UsuarioSetor } from "../entities/UsuarioSetor";
import { Permissao } from "../entities/Permissao";
import { logger } from "../config/logger";
import nodemailer from 'nodemailer';

const STATUS_VALIDO = ['Pendente', 'EmCorrecao', 'EmAnalise', 'Recusado'];

export class FluxoAprovacaoService {
    private get protocoloRepo(): Repository<Protocolo> {
        return AppDataSource.getRepository(Protocolo);
    }

    private get fluxoRepo(): Repository<FluxoAprovacao> {
        return AppDataSource.getRepository(FluxoAprovacao);
    }

    private get historicoRepo(): Repository<Historico> {
        return AppDataSource.getRepository(Historico);
    }
    private get usuarioSetorRepo(): Repository<UsuarioSetor> {
        return AppDataSource.getRepository(UsuarioSetor);
    }
    private get permissaoRepo(): Repository<Permissao> {
        return AppDataSource.getRepository(Permissao);
    }
    private transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    private async verificarAcesso(usuario: Usuario | undefined, setorId: number) {
        if (!usuario || usuario.administrador) return;
        const count = await this.usuarioSetorRepo.count({ where: { usuarioId: usuario.id, setorId } });
        if (!count) throw new Error('Acesso negado ao setor');
    }

    private async obterFluxoAtual(protocolo: Protocolo) {
        const fluxos = await this.fluxoRepo.find({
            where: { tipoProtocolo: { id: protocolo.tipoProtocolo.id } },
            order: { ordem: 'ASC' },
            relations: ['setor']
        });
        const valid = fluxos.filter(f =>
            protocolo.valorTotal >= f.valorMinimo &&
            (f.valorMaximo === null || protocolo.valorTotal <= f.valorMaximo)
        );
        if (!protocolo.etapaAtual) {
            return valid[0];
        }
        return valid.find(f => f.ordem === protocolo.etapaAtual) || null;
    }

    listarPorTipo(tipoProtocoloId: number) {
        return this.fluxoRepo.find({
            where: { tipoProtocolo: { id: tipoProtocoloId } },
            order: { ordem: 'ASC' },
            relations: ['setor']
        });
    }

    private async obterProtocolo(id: number) {
        return await this.protocoloRepo.findOne({
            where: { id },
            relations: [
                "tipoProtocolo",
                "setorOrigem",
                "usuarioCriador"
            ]
        });
    }

    private async registrar(protocolo: Protocolo, usuario: Usuario, acao: string, observacao?: string, ip?: string) {
        const h = new Historico();
        h.protocolo = protocolo;
        h.usuario = { id: usuario.id } as Usuario;
        h.acao = acao;
        h.observacao = observacao || null;
        if (ip) h.ip = ip;
        await this.historicoRepo.save(h);
    }

    async verificarPermissaoParaAprovar(id: number, usuario: Usuario) {
        const protocolo = await this.obterProtocolo(id);
        if (!protocolo) return { pode: false, motivo: 'Protocolo não encontrado' };
        if (!STATUS_VALIDO.includes(protocolo.status))
            return { pode: false, motivo: 'Status não permite ação' };

        const fluxoAtual = await this.obterFluxoAtual(protocolo);
        if (!fluxoAtual) return { pode: false, motivo: 'Fluxo não configurado' };

        try {
            await this.verificarAcesso(usuario, fluxoAtual.setor.id);
        } catch (e) {
            return { pode: false, motivo: 'Acesso negado ao setor' };
        }
        if (protocolo.usuarioCriador.id === usuario.id)
            return { pode: false, motivo: 'Criador não pode aprovar' };
        const permitido = await this.temPermissao(usuario, protocolo, fluxoAtual.setor.id);
        if (!permitido) return { pode: false, motivo: 'Sem permissão para aprovar' };
        return { pode: true };
    }

    private async temPermissao(usuario: Usuario, protocolo: Protocolo, setorId: number) {
        if (usuario.administrador) return true;
        const permissoes = await this.permissaoRepo.createQueryBuilder('p')
            .innerJoin('p.acao', 'a')
            .where('p.usuarioId = :u', { u: usuario.id })
            .andWhere('a.nome = :a', { a: 'Aprovar' })
            .andWhere('(p.tipoProtocoloId IS NULL OR p.tipoProtocoloId = :tp)', { tp: protocolo.tipoProtocolo.id })
            .andWhere('(p.setorId IS NULL OR p.setorId = :s)', { s: setorId })
            .getMany();
        return permissoes.some(p => !p.valorMaximo || protocolo.valorTotal <= p.valorMaximo);
    }

    async aprovar(id: number, usuario: Usuario, observacao?: string, ip?: string) {
        const protocolo = await this.obterProtocolo(id);
        if (!protocolo) throw new Error('Protocolo não encontrado');
        const fluxoAtual = await this.obterFluxoAtual(protocolo);
        if (!fluxoAtual) throw new Error('Fluxo não configurado');
        await this.verificarAcesso(usuario, fluxoAtual.setor.id);
        if (!STATUS_VALIDO.includes(protocolo.status))
            throw new Error('Status não permite aprovação');
        if (protocolo.usuarioCriador.id === usuario.id) {
            logger.warn(`Usuario ${usuario.id} tentou aprovar o proprio protocolo ${id}`);
            await this.registrar(protocolo, usuario, 'AprovacaoNegada', 'Criador tentando aprovar', ip);
            throw new Error('Usuário não pode aprovar o próprio protocolo');
        }
        const permitido = await this.temPermissao(usuario, protocolo, fluxoAtual.setor.id);
        if (!permitido) {
            logger.warn(`Usuario ${usuario.id} sem permissão tentou aprovar protocolo ${id}`);
            await this.registrar(protocolo, usuario, 'AprovacaoNegada', 'Sem permissão', ip);
            throw new Error('Permissão insuficiente para aprovar');
        }

        const fluxos = await this.fluxoRepo.find({
            where: { tipoProtocolo: { id: protocolo.tipoProtocolo.id } },
            order: { ordem: 'ASC' },
            relations: ['setor']
        });

        const fluxoAtualIdx = fluxos.findIndex(f => f.ordem === fluxoAtual.ordem);
        const next = fluxos.slice(fluxoAtualIdx + 1).find(f =>
            protocolo.valorTotal >= f.valorMinimo &&
            (f.valorMaximo === null || protocolo.valorTotal <= f.valorMaximo));

        if (next) {
            protocolo.status = 'EmAnalise';
            protocolo.etapaAtual = next.ordem;
            if (process.env.NOTIFY_EMAIL) {
                await this.transporter.sendMail({
                    to: process.env.NOTIFY_EMAIL,
                    subject: 'Aprovação pendente',
                    text: `Protocolo ${protocolo.numero} aguardando aprovação.`
                });
            }
        } else {
            protocolo.status = 'Aprovado';
            protocolo.etapaAtual = null;
        }
        protocolo.dataAtualizacao = new Date();
        await this.protocoloRepo.save(protocolo);

        await this.registrar(protocolo, usuario, 'Aprovacao', observacao, ip);
        return protocolo;
    }

    async rejeitar(id: number, usuario: Usuario, observacao?: string, ip?: string) {
        const protocolo = await this.obterProtocolo(id);
        if (!protocolo) throw new Error('Protocolo não encontrado');
        const fluxoAtual = await this.obterFluxoAtual(protocolo);
        if (!fluxoAtual) throw new Error('Fluxo não configurado');
        await this.verificarAcesso(usuario, fluxoAtual.setor.id);
        if (!STATUS_VALIDO.includes(protocolo.status))
            throw new Error('Status não permite rejeição');
        if (protocolo.usuarioCriador.id === usuario.id) {
            logger.warn(`Usuario ${usuario.id} tentou rejeitar o proprio protocolo ${id}`);
            await this.registrar(protocolo, usuario, 'RecusaNegada', 'Criador tentando rejeitar', ip);
            throw new Error('Usuário não pode rejeitar o próprio protocolo');
        }

        const permitido = await this.temPermissao(usuario, protocolo, fluxoAtual.setor.id);
        if (!permitido) {
            logger.warn(`Usuario ${usuario.id} sem permissão tentou rejeitar protocolo ${id}`);
            throw new Error('Permissão insuficiente para rejeitar');
        }

        if (!observacao) {
            throw new Error('Justificativa é obrigatória');
        }

        const fluxos = await this.fluxoRepo.find({
            where: { tipoProtocolo: { id: protocolo.tipoProtocolo.id } },
            order: { ordem: 'ASC' }
        });

        const atual = fluxos.find(f => f.ordem === protocolo.etapaAtual) || fluxos[0];
        let destinoOrdem = protocolo.etapaAtual || fluxos[0].ordem;
        if (atual.comportamentoRecusa === 'Anterior') {
            const idx = fluxos.findIndex(f => f.id === atual.id);
            if (idx > 0) destinoOrdem = fluxos[idx - 1].ordem;
        }

        protocolo.status = 'Recusado';
        protocolo.etapaAtual = destinoOrdem;
        protocolo.dataAtualizacao = new Date();
        await this.protocoloRepo.save(protocolo);

        await this.registrar(protocolo, usuario, 'Recusa', observacao, ip);
        return protocolo;
    }

    async corrigir(id: number, usuario: Usuario, observacao?: string, ip?: string) {
        const protocolo = await this.obterProtocolo(id);
        if (!protocolo) throw new Error('Protocolo não encontrado');
        const fluxoAtual = await this.obterFluxoAtual(protocolo);
        if (!fluxoAtual) throw new Error('Fluxo não configurado');
        await this.verificarAcesso(usuario, fluxoAtual.setor.id);
        if (!STATUS_VALIDO.includes(protocolo.status))
            throw new Error('Status não permite correção');
        if (protocolo.usuarioCriador.id === usuario.id) {
            logger.warn(`Usuario ${usuario.id} tentou corrigir o proprio protocolo ${id}`);
            await this.registrar(protocolo, usuario, 'CorrecaoNegada', 'Criador tentando corrigir', ip);
            throw new Error('Usuário não pode corrigir o próprio protocolo');
        }

        const permitido = await this.temPermissao(usuario, protocolo, fluxoAtual.setor.id);
        if (!permitido) throw new Error('Permissão insuficiente para correção');

        protocolo.status = 'EmCorrecao';
        protocolo.dataAtualizacao = new Date();
        await this.protocoloRepo.save(protocolo);

        await this.registrar(protocolo, usuario, 'RetornoCorrecao', observacao, ip);
        return protocolo;
    }
}

