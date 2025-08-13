import { Repository, Not, Brackets, In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Protocolo } from "../entities/Protocolo";
import { Usuario } from "../entities/Usuario";
import { TipoProtocolo } from "../entities/TipoProtocolo";
import { Setor } from "../entities/Setor";
import { UsuarioSetor } from "../entities/UsuarioSetor";
import { FluxoAprovacao } from "../entities/FluxoAprovacao";
import { Permissao } from "../entities/Permissao";
import { Anexo } from "../entities/Anexo";
import { Historico } from "../entities/Historico";
import nodemailer from 'nodemailer';
import path from 'path';

export class ProtocoloService {
    private get protocoloRepository(): Repository<Protocolo> {
        return AppDataSource.getRepository(Protocolo);
    }

    private get anexoRepo(): Repository<Anexo> {
        return AppDataSource.getRepository(Anexo);
    }

    private get historicoRepo(): Repository<Historico> {
        return AppDataSource.getRepository(Historico);
    }
    private get usuarioSetorRepo(): Repository<UsuarioSetor> {
        return AppDataSource.getRepository(UsuarioSetor);
    }
    private get fluxoRepo(): Repository<FluxoAprovacao> {
        return AppDataSource.getRepository(FluxoAprovacao);
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

    async listarProtocolos(
        usuario?: Usuario,
        filtros?: { tipoProtocoloId?: number; setorId?: number; status?: string }
    ) {
        const qb = this.protocoloRepository.createQueryBuilder('p')
            .leftJoinAndSelect('p.tipoProtocolo', 'tipo')
            .leftJoinAndSelect('p.setorOrigem', 'setor')
            .leftJoinAndSelect('p.usuarioCriador', 'criador')
            .orderBy('p.dataCriacao', 'DESC');

        if (filtros?.tipoProtocoloId) {
            qb.andWhere('tipo.id = :tp', { tp: filtros.tipoProtocoloId });
        }
        if (filtros?.setorId) {
            const sub = qb.subQuery()
                .select('1')
                .from(FluxoAprovacao, 'fs')
                .where('fs.tipoProtocoloId = tipo.id')
                .andWhere('fs.setorId = :fs', { fs: filtros.setorId })
                .getQuery();
            qb.andWhere(new Brackets(qb2 => {
                qb2.where('setor.id = :fs', { fs: filtros.setorId })
                    .orWhere(`EXISTS (${sub})`);
            }));
        }
        if (filtros?.status && filtros.status !== 'Todos') {
            qb.andWhere('p.status = :st', { st: filtros.status });
        }

        if (usuario && !usuario.administrador) {
            const setoresUsuario = await this.usuarioSetorRepo.find({ where: { usuarioId: usuario.id } });
            const ids = setoresUsuario.map(s => s.setorId);

            const subPerm = qb.subQuery()
                .select('1')
                .from(Permissao, 'perm')
                .innerJoin('perm.acao', 'a')
                .where('perm.usuarioId = :u', { u: usuario.id })
                .andWhere('a.nome = :acao', { acao: 'Aprovar' })
                .andWhere('(perm.tipoProtocoloId IS NULL OR perm.tipoProtocoloId = tipo.id)')
                .andWhere('(perm.setorId IS NULL OR perm.setorId IN (:...ids))', { ids: ids.length ? ids : [0] })
                .getQuery();

            const subFluxoAtual = qb.subQuery()
                .select('1')
                .from(FluxoAprovacao, 'fa')
                .where('fa.tipoProtocoloId = tipo.id')
                .andWhere('fa.setorId IN (:...ids)', { ids: ids.length ? ids : [0] })
                .andWhere('fa.ordem = p.etapaAtual')
                .getQuery();

            const subHistorico = qb.subQuery()
                .select('1')
                .from(Historico, 'h')
                .where('h.protocoloId = p.id')
                .andWhere('h.usuarioId = :u', { u: usuario.id })
                .andWhere('h.acao IN (:...ac)', { ac: ['Aprovacao', 'Recusa'] })
                .getQuery();

            qb.andWhere(new Brackets(qb1 => {
                qb1.where('criador.id = :userId', { userId: usuario.id })
                    .orWhere(new Brackets(qb2 => {
                        qb2.where(`EXISTS ${subPerm}`)
                            .andWhere(`EXISTS ${subFluxoAtual}`);
                    }))
                    .orWhere(`EXISTS ${subHistorico}`);
            }));
        }

        const protocolos = await qb.getMany();


        const tipos = Array.from(new Set(protocolos.map(p => p.tipoProtocolo.id)));
        const fluxosAll = await AppDataSource.getRepository(FluxoAprovacao).find({
            where: { tipoProtocolo: { id: In(tipos.length ? tipos : [0]) } },
            order: { ordem: 'ASC' },
            relations: ['setor', 'tipoProtocolo']
        });
        const fluxosMap = new Map<number, FluxoAprovacao[]>();
        for (const f of fluxosAll) {
            const key = f.tipoProtocolo.id;
            if (!fluxosMap.has(key)) fluxosMap.set(key, []);
            fluxosMap.get(key)!.push(f);
        }

        const histMap = new Map<number, Historico>();
        if (protocolos.length) {
            const hist = await this.historicoRepo.createQueryBuilder('h')
                .leftJoinAndSelect('h.usuario', 'u')
                .leftJoinAndSelect('h.protocolo', 'hp')
                .where('h.protocoloId IN (:...ids)', { ids: protocolos.map(p => p.id) })
                .orderBy('h.protocoloId', 'ASC')
                .addOrderBy('h.dataHora', 'DESC')
                .getMany();
            for (const h of hist) {
                if (!histMap.has(h.protocolo.id)) histMap.set(h.protocolo.id, h);
            }
        }

        for (const p of protocolos) {
            const fluxos = fluxosMap.get(p.tipoProtocolo.id) || [];

            const valid = fluxos.filter(f =>
                p.valorTotal >= f.valorMinimo &&
                (f.valorMaximo === null || p.valorTotal <= f.valorMaximo)
            );
            const total = valid.length;
            let concluido = 0;
            if (p.status === 'Aprovado') {
                concluido = total;
            } else if (p.etapaAtual) {
                const idx = valid.findIndex(v => v.ordem === p.etapaAtual);
                if (idx >= 0) concluido = idx;
            }
            (p as any).percentualAprovacao = total ? Math.round(concluido * 100 / total) : 0;

            let etapaNome = '';
            if (p.status === 'Aprovado') {
                etapaNome = 'Finalizado';
            } else {
                const fluxoAtual = p.etapaAtual ?
                    valid.find(f => f.ordem === p.etapaAtual) :
                    valid[0];
                if (fluxoAtual) {
                    etapaNome = `${fluxoAtual.ordem} - ${fluxoAtual.setor.nome}`;
                }
            }
            (p as any).etapaAtualNome = etapaNome;

            const lastHist = histMap.get(p.id);
            if (lastHist) {
                (p as any).etapaTooltip = `${lastHist.acao} por ${lastHist.usuario.nome}`;
            }
        }
        return protocolos;
    }

    async obterProtocolo(id: number, usuario?: Usuario) {
        const protocolo = await this.protocoloRepository.findOne({
            where: { id },
            relations: ['tipoProtocolo', 'setorOrigem', 'usuarioCriador', 'anexos']
        });
        if (!protocolo) return null;

        if (usuario && !usuario.administrador) {
            const setoresUsuario = await this.usuarioSetorRepo.find({ where: { usuarioId: usuario.id } });
            const ids = setoresUsuario.map(s => s.setorId);
            const fluxos = await AppDataSource.getRepository(FluxoAprovacao).find({
                where: { tipoProtocolo: { id: protocolo.tipoProtocolo.id } },
                order: { ordem: 'ASC' },
                relations: ['setor']
            });
            const valid = fluxos.filter(f =>
                protocolo.valorTotal >= f.valorMinimo &&
                (f.valorMaximo === null || protocolo.valorTotal <= f.valorMaximo)
            );
            const fluxoAtual = protocolo.etapaAtual ?
                valid.find(f => f.ordem === protocolo.etapaAtual) :
                valid[0];

            const acessoOrigem = ids.includes(protocolo.setorOrigem.id);
            let acessoFluxo = false;

            if (fluxoAtual) {
                const permissoes = await AppDataSource.getRepository(Permissao)
                    .createQueryBuilder('perm')
                    .innerJoin('perm.acao', 'a')
                    .where('perm.usuarioId = :u', { u: usuario.id })
                    .andWhere('a.nome = :a', { a: 'Aprovar' })
                    .andWhere('(perm.tipoProtocoloId IS NULL OR perm.tipoProtocoloId = :tp)', { tp: protocolo.tipoProtocolo.id })
                    .andWhere('(perm.setorId IS NULL OR perm.setorId = :s)', { s: fluxoAtual.setor.id })
                    .getMany();
                const permitido = permissoes.some(p => !p.valorMaximo || protocolo.valorTotal <= p.valorMaximo);
                acessoFluxo = ids.includes(fluxoAtual.setor.id) && permitido;
            }

            if (!acessoOrigem && !acessoFluxo) return null;
        }
        return protocolo;
    }

    async criarProtocolo(dados: {
        tipoProtocoloId: number;
        setorOrigemId: number;
        usuarioCriadorId: number;
        valorTotal?: number;
        descricao: string;
    }, ip?: string, usuario?: Usuario) {
        // Validar dados
        if (!dados.descricao) throw new Error("Descrição é obrigatória");

        await this.verificarAcesso(usuario, dados.setorOrigemId);

        const duplicado = await this.protocoloRepository.findOne({
            where: {
                descricao: dados.descricao,
                usuarioCriador: { id: dados.usuarioCriadorId },
                tipoProtocolo: { id: dados.tipoProtocoloId },
                setorOrigem: { id: dados.setorOrigemId },
                status: Not('Rejeitado')
            },
            relations: ['usuarioCriador', 'tipoProtocolo', 'setorOrigem']
        });
        if (duplicado) throw new Error('Protocolo duplicado');

        // Gerar número do protocolo
        const [ultimoProtocolo] = await this.protocoloRepository.find({
            order: { dataCriacao: "DESC" },
            take: 1
        });
        
        const novoNumero = this.gerarNumeroProtocolo(ultimoProtocolo?.numero);

        // Criar protocolo
        const protocolo = new Protocolo();
        protocolo.numero = novoNumero;
        protocolo.tipoProtocolo = { id: dados.tipoProtocoloId } as TipoProtocolo;
        protocolo.setorOrigem = { id: dados.setorOrigemId } as Setor;
        protocolo.usuarioCriador = { id: dados.usuarioCriadorId } as Usuario;
        protocolo.valorTotal = dados.valorTotal || 0;
        protocolo.descricao = dados.descricao;
        protocolo.status = "Pendente";
        const primeiraEtapa = await this.fluxoRepo.createQueryBuilder('f')
            .where('f.tipoProtocoloId = :tp', { tp: dados.tipoProtocoloId })
            .orderBy('f.ordem', 'ASC')
            .getOne();
        protocolo.etapaAtual = primeiraEtapa ? primeiraEtapa.ordem : null;
        const saved = await this.protocoloRepository.save(protocolo);

        const historico = new Historico();
        historico.protocolo = saved;
        historico.usuario = { id: dados.usuarioCriadorId } as Usuario;
        historico.acao = 'Criacao';
        if (ip) historico.ip = ip;
        await this.historicoRepo.save(historico);
        if (process.env.NOTIFY_EMAIL) {
            await this.transporter.sendMail({
                to: process.env.NOTIFY_EMAIL,
                subject: 'Protocolo criado',
                text: `Protocolo ${saved.numero} criado.`
            });
        }
        return saved;
    }

    async adicionarAnexos(id: number, files: Express.Multer.File[], usuario?: Usuario) {
        const protocolo = await this.protocoloRepository.findOne({ where: { id }, relations: ['setorOrigem'] });
        if (!protocolo) throw new Error('Protocolo não encontrado');
        await this.verificarAcesso(usuario, protocolo.setorOrigem.id);
        const anexos = files.map(f => {
            const a = new Anexo();
            a.nomeArquivo = f.originalname;
            a.tipo = f.mimetype;
            a.tamanho = f.size;
            a.caminho = f.filename;
            a.protocolo = protocolo;
            return a;
        });
        return await this.anexoRepo.save(anexos);
    }

    async removerAnexo(anexoId: number, usuario?: Usuario) {
        const anexo = await this.anexoRepo.findOne({ where: { id: anexoId }, relations: ['protocolo', 'protocolo.setorOrigem'] });
        if (!anexo) return;
        await this.verificarAcesso(usuario, anexo.protocolo.setorOrigem.id);
        await this.anexoRepo.delete(anexoId);
        try {
            const fs = await import('fs/promises');
            await fs.unlink(path.join(__dirname, '../../uploads', anexo.caminho));
        } catch {
            // ignore errors removing file
        }
    }

    async atualizar(id: number, dados: Partial<Protocolo>, usuario?: Usuario) {
        const protocolo = await this.protocoloRepository.findOne({
            where: { id },
            relations: ['setorOrigem', 'usuarioCriador', 'tipoProtocolo']
        });
        if (!protocolo) throw new Error('Protocolo não encontrado');
        await this.verificarAcesso(usuario, protocolo.setorOrigem.id);

        const primeiraEtapa = await this.fluxoRepo.createQueryBuilder('f')
            .where('f.tipoProtocoloId = :tp', { tp: protocolo.tipoProtocolo.id })
            .orderBy('f.ordem', 'ASC')
            .getOne();
        const primeiraOrdem = primeiraEtapa ? primeiraEtapa.ordem : null;

        const podeReenviar = protocolo.status === 'Recusado' &&
            usuario && protocolo.usuarioCriador.id === usuario.id;

        if (!podeReenviar && protocolo.status !== 'Pendente' && protocolo.status !== 'EmCorrecao') {
            throw new Error('Edição não permitida para este status');
        }

        await this.protocoloRepository.update(id, {
            descricao: dados.descricao,
            valorTotal: dados.valorTotal,
            dataAtualizacao: new Date(),
            ...(podeReenviar ? { status: 'Pendente', etapaAtual: primeiraOrdem } : {})
        });

        const historico = new Historico();
        historico.protocolo = protocolo;
        if (usuario) historico.usuario = { id: usuario.id } as Usuario;
        historico.acao = 'Edicao';
        await this.historicoRepo.save(historico);

        return await this.obterProtocolo(id, usuario);
    }

    listarHistorico(protocoloId: number) {
        return this.historicoRepo.createQueryBuilder('h')
            .leftJoinAndSelect('h.usuario', 'u')
            .leftJoinAndSelect('u.setores', 'us')
            .leftJoinAndSelect('us.setor', 'setor')
            .where('h.protocoloId = :id', { id: protocoloId })
            .orderBy('h.dataHora', 'DESC')
            .getMany();
    }

    private gerarNumeroProtocolo(ultimoNumero?: string): string {
        const anoAtual = new Date().getFullYear();
        
        if (!ultimoNumero || !ultimoNumero.startsWith(anoAtual.toString())) {
            return `${anoAtual}0001`;
        }
        
        const sequencia = parseInt(ultimoNumero.substring(4)) + 1;
        return `${anoAtual}${sequencia.toString().padStart(4, '0')}`;
    }
}
