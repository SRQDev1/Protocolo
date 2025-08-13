USE ProtocoloDigital;
GO

-- Setores
INSERT INTO ProtocoloDigital_Setores (Nome) VALUES
(N'Financeiro'),
(N'Compras'),
(N'Diretoria');
GO

-- Usuários
INSERT INTO ProtocoloDigital_Usuarios (Nome, SetorId, Email) VALUES
(N'Analista Financeiro', 1, N'fin@empresa.com'),
(N'Comprador', 2, N'compras@empresa.com'),
(N'Diretor', 3, N'diretor@empresa.com');
GO

-- Tipos de Protocolo
INSERT INTO ProtocoloDigital_TiposProtocolo (Nome) VALUES
(N'Nota Fiscal');
GO

-- Fluxos de Aprovação
INSERT INTO ProtocoloDigital_FluxosAprovacao (TipoProtocoloId, Ordem, SetorDestinoId, ValorMinimo, ValorMaximo) VALUES
(1, 1, 1, 0, 5000),
(1, 2, 3, 5000.01, NULL);
GO

-- Regra para NF alto
INSERT INTO ProtocoloDigital_Regras (Nome, TipoProtocoloId, Prioridade, Ativo) VALUES
(N'NF alto exige etapa intermediária (Diretor)', 1, 10, 1);
GO

DECLARE @RegraId INT = SCOPE_IDENTITY();

INSERT INTO ProtocoloDigital_RegraCondicoes (RegraId, Fonte, Campo, Operador, Valor) VALUES
(@RegraId, 'Protocolo', 'ValorTotal', '>=', '20000');
GO

INSERT INTO ProtocoloDigital_RegraAcoes (RegraId, AcaoTipo, Parametro1, Parametro2) VALUES
(@RegraId, 'INSERIR_ETAPA_INTERMEDIARIA', 'ANTES_DA_ORDEM:2', 'USUARIO:3');
GO

-- Protocolos de exemplo
INSERT INTO ProtocoloDigital_Protocolos (Numero, TipoProtocoloId, ValorTotal, EtapaAtual, SetorAtualId) VALUES
(N'NF-0001', 1, 3000, 0, NULL),
(N'NF-0002', 1, 12000, 0, NULL),
(N'NF-0003', 1, 25000, 0, NULL);
GO
