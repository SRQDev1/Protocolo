import { Repository, LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Parcela } from '../entities/Parcela';
import { Protocolo } from '../entities/Protocolo';
import nodemailer from 'nodemailer';

export class ParcelaService {
    private get repo(): Repository<Parcela> {
        return AppDataSource.getRepository(Parcela);
    }

    private get protocoloRepo(): Repository<Protocolo> {
        return AppDataSource.getRepository(Protocolo);
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

    async gerarParcelas(protocoloId: number, quantidade: number, primeiraData: Date) {
        const protocolo = await this.protocoloRepo.findOne({ where: { id: protocoloId } });
        if (!protocolo) throw new Error('Protocolo não encontrado');
        const valor = Number(protocolo.valorTotal || 0) / quantidade;
        const parcelas: Parcela[] = [];
        for (let i = 0; i < quantidade; i++) {
            const p = new Parcela();
            p.protocolo = protocolo;
            p.valor = parseFloat(valor.toFixed(2));
            const d = new Date(primeiraData);
            d.setMonth(d.getMonth() + i);
            p.vencimento = d;
            p.status = 'Pendente';
            parcelas.push(p);
        }
        return await this.repo.save(parcelas);
    }

    async verificarPrazos() {
        const limite = new Date();
        limite.setDate(limite.getDate() + 3);
        const parcelas = await this.repo.find({
            where: {
                status: 'Pendente',
                vencimento: LessThanOrEqual(limite)
            },
            relations: ['protocolo']
        });
        for (const p of parcelas) {
            if (process.env.NOTIFY_EMAIL) {
                await this.transporter.sendMail({
                    to: process.env.NOTIFY_EMAIL,
                    subject: 'Prazo próximo a expirar',
                    text: `Parcela do protocolo ${p.protocolo.numero} vence em ${p.vencimento.toLocaleDateString()}.`
                });
            }
        }
    }
}
