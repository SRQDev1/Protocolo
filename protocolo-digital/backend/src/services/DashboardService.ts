import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Historico } from '../entities/Historico';
import { Protocolo } from '../entities/Protocolo';

export class DashboardService {
    private get historicoRepo(): Repository<Historico> {
        return AppDataSource.getRepository(Historico);
    }

    private get protocoloRepo(): Repository<Protocolo> {
        return AppDataSource.getRepository(Protocolo);
    }

    tempoMedioEtapas() {
        return this.historicoRepo.query(`
            SELECT Acao as acao,
                   AVG(DATEDIFF(MINUTE, prev_data, DataHora)) as tempoMedioMinutos
            FROM (
                SELECT *, LAG(DataHora) OVER (PARTITION BY ProtocoloId ORDER BY DataHora) as prev_data
                FROM ProtocoloDigital_Historico
            ) t
            WHERE prev_data IS NOT NULL
            GROUP BY Acao
        `);
    }

    volumePorStatusSetor(inicio?: Date, fim?: Date) {
        const qb = this.protocoloRepo.createQueryBuilder('p')
            .innerJoin('p.setorOrigem', 's')
            .select('s.nome', 'setor')
            .addSelect('p.status', 'status')
            .addSelect('COUNT(*)', 'total');
        if (inicio) qb.andWhere('p.dataCriacao >= :inicio', { inicio });
        if (fim) qb.andWhere('p.dataCriacao <= :fim', { fim });
        qb.groupBy('s.nome').addGroupBy('p.status');
        return qb.getRawMany();
    }
}
