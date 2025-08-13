USE ProtocoloDigital;
GO

-- Inserir Setores
INSERT INTO ProtocoloDigital_Setores (Nome, Descricao) VALUES 
('TI', 'Tecnologia da Informação'),
('Financeiro', 'Departamento Financeiro'),
('Compras', 'Setor de Compras'),
('RH', 'Recursos Humanos'),
('Diretoria', 'Diretoria Executiva');
GO

-- Inserir Usuários
INSERT INTO ProtocoloDigital_Usuarios (Nome, Email, SenhaHash, Ativo, Administrador) VALUES
('Admin', 'admin@empresa.com', '123456', 1, 1),
('Gerente TI', 'ti@empresa.com', '123456', 1, 0),
('Analista Financeiro', 'financeiro@empresa.com', '123456', 1, 0),
('Comprador', 'compras@empresa.com', '123456', 1, 0),
('Diretor', 'diretor@empresa.com', '123456', 1, 0);
GO

-- Vincular Usuários a Setores
INSERT INTO ProtocoloDigital_UsuarioSetores VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), -- Admin em todos os setores
(2, 1), -- TI
(3, 2), -- Financeiro
(4, 3), -- Compras
(5, 5); -- Diretoria
GO

-- Inserir Tipos de Protocolo
INSERT INTO ProtocoloDigital_TiposProtocolo (Nome, Descricao, AnexosObrigatorios, TodosSetores) VALUES
('Nota Fiscal', 'Pagamento de notas fiscais', '["nota_fiscal.pdf", "xml.xml"]', 0),
('Pagamento', 'Solicitação de pagamento', '["comprovante.pdf"]', 0),
('Contrato', 'Aprovação de contrato', '["contrato.pdf", "anexos.pdf"]', 0),
('Viagem', 'Solicitação de viagem', '["orcamento.pdf"]', 1);
GO

INSERT INTO ProtocoloDigital_TipoProtocoloSetores VALUES
(1,2), (1,5),
(2,3), (2,2),
(3,5),
(4,1);
GO

-- Inserir Fluxos de Aprovação
-- Fluxo para Nota Fiscal
INSERT INTO ProtocoloDigital_FluxosAprovacao (TipoProtocoloId, Ordem, SetorId, ValorMinimo, ValorMaximo, PrazoHoras, ComportamentoRecusa) VALUES
(1, 1, 2, 0, 5000, 24, 'Anterior'),
(1, 2, 5, 5000.01, NULL, 48, 'Inicio');

-- Fluxo para Pagamento
INSERT INTO ProtocoloDigital_FluxosAprovacao (TipoProtocoloId, Ordem, SetorId, ValorMinimo, ValorMaximo, PrazoHoras, ComportamentoRecusa) VALUES
(2, 1, 3, 0, 10000, 24, 'Anterior'),
(2, 2, 2, 0, NULL, 24, 'Anterior'),
(2, 3, 5, 10000.01, NULL, 48, 'Inicio');
GO

-- Inserir Tipos de Acao
INSERT INTO ProtocoloDigital_TiposAcao (Nome, Descricao) VALUES
('Registrar', 'Permite criar e editar protocolos'),
('Aprovar', 'Permite aprovar protocolos');
GO

-- Inserir Permissões
INSERT INTO ProtocoloDigital_Permissoes (UsuarioId, TipoProtocoloId, SetorId, ValorMaximo, AcaoId) VALUES
(1, NULL, NULL, NULL, 2),
(2, 1, 1, 1000, 2),
(3, NULL, 2, 5000, 2),
(4, 2, 3, 10000, 2),
(5, NULL, NULL, NULL, 2);
GO

-- Inserir Protocolos de Exemplo
INSERT INTO ProtocoloDigital_Protocolos (Numero, TipoProtocoloId, SetorOrigemId, UsuarioCriadorId, ValorTotal, Descricao, Status) VALUES
('20230001', 1, 1, 2, 1500.00, 'Nota fiscal de licenças de software', 'Aprovado'),
('20230002', 2, 3, 4, 25000.00, 'Pagamento de fornecedor de materiais', 'EmAnálise'),
('20230003', 1, 2, 3, 7500.00, 'Nota fiscal de consultoria', 'Pendente');
GO

-- Inserir Histórico
INSERT INTO ProtocoloDigital_Historico (ProtocoloId, UsuarioId, Acao, Observacao) VALUES
(1, 2, 'Criacao', 'Protocolo criado pelo sistema'),
(1, 3, 'Aprovacao', 'Aprovado conforme contrato'),
(2, 4, 'Criacao', 'Solicitação de pagamento urgente'),
(3, 3, 'Criacao', 'Nota fiscal de consultoria trimestral');
GO
