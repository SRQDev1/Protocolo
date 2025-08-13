-- Banco de dados ProtocoloDigital
CREATE DATABASE ProtocoloDigital;
GO

USE ProtocoloDigital;
GO

-- Tabela de Setores
CREATE TABLE ProtocoloDigital_Setores (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(100) NOT NULL,
    Descricao NVARCHAR(255),
    Ativo BIT DEFAULT 1,
    DataCriacao DATETIME DEFAULT GETDATE()
);
GO

-- Tabela de Usuários
CREATE TABLE ProtocoloDigital_Usuarios (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    SenhaHash NVARCHAR(255) NOT NULL,
    Ativo BIT DEFAULT 1,
    Administrador BIT DEFAULT 0,
    DataCriacao DATETIME DEFAULT GETDATE()
);
GO

-- Tabela de relação Usuário-Setor (M:N)
CREATE TABLE ProtocoloDigital_UsuarioSetores (
    UsuarioId INT NOT NULL,
    SetorId INT NOT NULL,
    PRIMARY KEY (UsuarioId, SetorId),
    FOREIGN KEY (UsuarioId) REFERENCES ProtocoloDigital_Usuarios(Id),
    FOREIGN KEY (SetorId) REFERENCES ProtocoloDigital_Setores(Id)
);
GO

-- Tabela de Tipos de Protocolo
CREATE TABLE ProtocoloDigital_TiposProtocolo (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(100) NOT NULL,
    Descricao NVARCHAR(255),
    AnexosObrigatorios NVARCHAR(255), -- JSON com configuração
    Ativo BIT DEFAULT 1,
    TodosSetores BIT DEFAULT 0
);
GO

-- Relacionamento TipoProtocolo x Setor
CREATE TABLE ProtocoloDigital_TipoProtocoloSetores (
    TipoProtocoloId INT NOT NULL,
    SetorId INT NOT NULL,
    PRIMARY KEY (TipoProtocoloId, SetorId),
    FOREIGN KEY (TipoProtocoloId) REFERENCES ProtocoloDigital_TiposProtocolo(Id),
    FOREIGN KEY (SetorId) REFERENCES ProtocoloDigital_Setores(Id)
);
GO

-- Tabela de Fluxos de Aprovação
CREATE TABLE ProtocoloDigital_FluxosAprovacao (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TipoProtocoloId INT NOT NULL,
    Ordem INT NOT NULL,
    SetorId INT NOT NULL,
    ValorMinimo DECIMAL(18,2) DEFAULT 0,
    ValorMaximo DECIMAL(18,2),
    PrazoHoras INT NOT NULL,
    ComportamentoRecusa NVARCHAR(20) DEFAULT 'Anterior',
    FOREIGN KEY (TipoProtocoloId) REFERENCES ProtocoloDigital_TiposProtocolo(Id),
    FOREIGN KEY (SetorId) REFERENCES ProtocoloDigital_Setores(Id)
);
GO

-- Tabela de Protocolos
CREATE TABLE ProtocoloDigital_Protocolos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Numero NVARCHAR(20) NOT NULL UNIQUE,
    TipoProtocoloId INT NOT NULL,
    SetorOrigemId INT NOT NULL,
    UsuarioCriadorId INT NOT NULL,
    ValorTotal DECIMAL(18,2),
    Descricao NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(50) NOT NULL, -- 'Pendente', 'EmAnálise', 'Aprovado', 'Recusado', 'Finalizado', 'Cancelado'
    EtapaAtual INT NULL,
    DataCriacao DATETIME DEFAULT GETDATE(),
    DataAtualizacao DATETIME,
    FOREIGN KEY (TipoProtocoloId) REFERENCES ProtocoloDigital_TiposProtocolo(Id),
    FOREIGN KEY (SetorOrigemId) REFERENCES ProtocoloDigital_Setores(Id),
    FOREIGN KEY (UsuarioCriadorId) REFERENCES ProtocoloDigital_Usuarios(Id)
);
GO

-- Tabela de Parcelas (para protocolos parcelados)
CREATE TABLE ProtocoloDigital_Parcelas (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProtocoloId INT NOT NULL,
    Valor DECIMAL(18,2) NOT NULL,
    Vencimento DATE NOT NULL,
    Status NVARCHAR(50) NOT NULL, -- 'Pendente', 'Pago', 'Cancelado'
    Observacao NVARCHAR(255),
    FOREIGN KEY (ProtocoloId) REFERENCES ProtocoloDigital_Protocolos(Id)
);
GO

-- Tabela de Anexos
CREATE TABLE ProtocoloDigital_Anexos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProtocoloId INT NOT NULL,
    NomeArquivo NVARCHAR(255) NOT NULL,
    Tipo NVARCHAR(50) NOT NULL,
    Tamanho INT NOT NULL,
    Caminho NVARCHAR(255) NOT NULL,
    DataUpload DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProtocoloId) REFERENCES ProtocoloDigital_Protocolos(Id)
);
GO

-- Tabela de Histórico/Auditoria
CREATE TABLE ProtocoloDigital_Historico (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProtocoloId INT NOT NULL,
    UsuarioId INT NOT NULL,
    Acao NVARCHAR(50) NOT NULL, -- 'Criacao', 'Aprovacao', 'Recusa', 'Alteracao', 'Cancelamento'
    Observacao NVARCHAR(MAX),
    DataHora DATETIME DEFAULT GETDATE(),
    DadosAntigos NVARCHAR(MAX),
    DadosNovos NVARCHAR(MAX),
    Ip NVARCHAR(50),
    FOREIGN KEY (ProtocoloId) REFERENCES ProtocoloDigital_Protocolos(Id),
    FOREIGN KEY (UsuarioId) REFERENCES ProtocoloDigital_Usuarios(Id)
);
GO

-- Tabela de Tipos de Acao
CREATE TABLE ProtocoloDigital_TiposAcao (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(50) NOT NULL,
    Descricao NVARCHAR(255)
);
GO

-- Tabela de Permissões
CREATE TABLE ProtocoloDigital_Permissoes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UsuarioId INT NOT NULL,
    TipoProtocoloId INT,
    SetorId INT,
    ValorMaximo DECIMAL(18,2),
    AcaoId INT NOT NULL,
    FOREIGN KEY (UsuarioId) REFERENCES ProtocoloDigital_Usuarios(Id),
    FOREIGN KEY (TipoProtocoloId) REFERENCES ProtocoloDigital_TiposProtocolo(Id),
    FOREIGN KEY (SetorId) REFERENCES ProtocoloDigital_Setores(Id),
    FOREIGN KEY (AcaoId) REFERENCES ProtocoloDigital_TiposAcao(Id)
);
GO

-- Índices para otimizar consultas
CREATE INDEX IX_Historico_ProtocoloId_DataHora ON ProtocoloDigital_Historico (ProtocoloId, DataHora);
CREATE INDEX IX_FluxosAprovacao_TipoProtocoloId ON ProtocoloDigital_FluxosAprovacao (TipoProtocoloId);
CREATE INDEX IX_Protocolos_TipoProtocoloId ON ProtocoloDigital_Protocolos (TipoProtocoloId);
CREATE INDEX IX_Protocolos_Status ON ProtocoloDigital_Protocolos (Status);
GO
