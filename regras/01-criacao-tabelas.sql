-- Banco de dados ProtocoloDigital
CREATE DATABASE ProtocoloDigital;
GO

USE ProtocoloDigital;
GO

-- Setores
CREATE TABLE ProtocoloDigital_Setores (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(120) NOT NULL
);
GO

-- Usuários
CREATE TABLE ProtocoloDigital_Usuarios (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(120) NOT NULL,
    SetorId INT NULL,
    Email NVARCHAR(255) NULL,
    FOREIGN KEY (SetorId) REFERENCES ProtocoloDigital_Setores(Id)
);
GO

-- Tipos de Protocolo
CREATE TABLE ProtocoloDigital_TiposProtocolo (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(120) NOT NULL
);
GO

-- Fluxos de Aprovação
CREATE TABLE ProtocoloDigital_FluxosAprovacao (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TipoProtocoloId INT NOT NULL,
    Ordem INT NOT NULL,
    SetorDestinoId INT NOT NULL,
    ValorMinimo DECIMAL(18,2) NULL,
    ValorMaximo DECIMAL(18,2) NULL,
    FOREIGN KEY (TipoProtocoloId) REFERENCES ProtocoloDigital_TiposProtocolo(Id),
    FOREIGN KEY (SetorDestinoId) REFERENCES ProtocoloDigital_Setores(Id)
);
GO
CREATE INDEX IX_FluxosAprovacao_TipoOrdem ON ProtocoloDigital_FluxosAprovacao(TipoProtocoloId, Ordem);
GO

-- Protocolos
CREATE TABLE ProtocoloDigital_Protocolos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Numero NVARCHAR(50) NOT NULL,
    TipoProtocoloId INT NOT NULL,
    ValorTotal DECIMAL(18,2) NOT NULL DEFAULT(0),
    EtapaAtual INT NULL,
    SetorAtualId INT NULL,
    Status NVARCHAR(30) NOT NULL DEFAULT('EmAndamento'),
    DataCriacao DATETIME NOT NULL DEFAULT(GETDATE()),
    FOREIGN KEY (TipoProtocoloId) REFERENCES ProtocoloDigital_TiposProtocolo(Id),
    FOREIGN KEY (SetorAtualId) REFERENCES ProtocoloDigital_Setores(Id)
);
GO

-- Histórico
CREATE TABLE ProtocoloDigital_Historico (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProtocoloId INT NOT NULL,
    Evento NVARCHAR(200) NOT NULL,
    Detalhes NVARCHAR(2000) NULL,
    DataEvento DATETIME NOT NULL DEFAULT(GETDATE()),
    UsuarioId INT NULL,
    FOREIGN KEY (ProtocoloId) REFERENCES ProtocoloDigital_Protocolos(Id),
    FOREIGN KEY (UsuarioId) REFERENCES ProtocoloDigital_Usuarios(Id)
);
GO

-- Regras
CREATE TABLE ProtocoloDigital_Regras (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(120) NOT NULL,
    TipoProtocoloId INT NULL,
    FluxoAprovacaoId INT NULL,
    Prioridade INT NOT NULL DEFAULT(100),
    Ativo BIT NOT NULL DEFAULT(1),
    ValidoDe DATETIME NULL,
    ValidoAte DATETIME NULL,
    FOREIGN KEY (TipoProtocoloId) REFERENCES ProtocoloDigital_TiposProtocolo(Id),
    FOREIGN KEY (FluxoAprovacaoId) REFERENCES ProtocoloDigital_FluxosAprovacao(Id)
);
GO
CREATE INDEX IX_Regras_AtivoPrior ON ProtocoloDigital_Regras(Ativo, Prioridade);
GO

-- Condições de Regras
CREATE TABLE ProtocoloDigital_RegraCondicoes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RegraId INT NOT NULL,
    Fonte NVARCHAR(20) NOT NULL,
    Campo NVARCHAR(100) NOT NULL,
    Operador NVARCHAR(20) NOT NULL,
    Valor NVARCHAR(255) NULL,
    ValorAte NVARCHAR(255) NULL,
    FOREIGN KEY (RegraId) REFERENCES ProtocoloDigital_Regras(Id)
);
GO

-- Ações de Regras
CREATE TABLE ProtocoloDigital_RegraAcoes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RegraId INT NOT NULL,
    AcaoTipo NVARCHAR(40) NOT NULL,
    Parametro1 NVARCHAR(255) NULL,
    Parametro2 NVARCHAR(255) NULL,
    FOREIGN KEY (RegraId) REFERENCES ProtocoloDigital_Regras(Id)
);
GO

-- Metadados do Protocolo
CREATE TABLE ProtocoloDigital_ProtocoloMetadados (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProtocoloId INT NOT NULL,
    Chave NVARCHAR(100) NOT NULL,
    Valor NVARCHAR(4000) NOT NULL,
    FOREIGN KEY (ProtocoloId) REFERENCES ProtocoloDigital_Protocolos(Id)
);
GO
CREATE INDEX IX_ProtocoloMetadados_ProtChave ON ProtocoloDigital_ProtocoloMetadados(ProtocoloId, Chave);
GO

-- Etapas Extras
CREATE TABLE ProtocoloDigital_EtapasExtras (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProtocoloId INT NOT NULL,
    AntesDaOrdem INT NOT NULL,
    TipoDestino NVARCHAR(20) NOT NULL,
    UsuarioId INT NULL,
    SetorId INT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pendente',
    DataCriacao DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ProtocoloId) REFERENCES ProtocoloDigital_Protocolos(Id),
    FOREIGN KEY (UsuarioId) REFERENCES ProtocoloDigital_Usuarios(Id),
    FOREIGN KEY (SetorId) REFERENCES ProtocoloDigital_Setores(Id)
);
GO
CREATE INDEX IX_EtapasExtras_ProtAntes ON ProtocoloDigital_EtapasExtras(ProtocoloId, AntesDaOrdem, Status);
GO
