USE ProtocoloDigital;
GO

-- Exemplo de uso: aplicar regras e verificar próxima parada
DECLARE @ProtocoloId INT = (SELECT TOP 1 Id FROM ProtocoloDigital_Protocolos WHERE Numero = N'NF-0003');

-- Avaliar regra aplicável
DECLARE @AcaoTipo NVARCHAR(40), @Parametro1 NVARCHAR(255), @Parametro2 NVARCHAR(255);
SELECT TOP 1 @AcaoTipo = a.AcaoTipo, @Parametro1 = a.Parametro1, @Parametro2 = a.Parametro2
FROM ProtocoloDigital_RegraAcoes a
JOIN ProtocoloDigital_Regras r ON r.Id = a.RegraId
WHERE r.Ativo = 1 AND (r.TipoProtocoloId IS NULL OR r.TipoProtocoloId = (SELECT TipoProtocoloId FROM ProtocoloDigital_Protocolos WHERE Id = @ProtocoloId));

-- Tratar a ação
IF @AcaoTipo IS NOT NULL
BEGIN
    -- Exemplo de inserção de etapa intermediária
    IF @AcaoTipo = 'INSERIR_ETAPA_INTERMEDIARIA'
    BEGIN
        DECLARE @AntesDaOrdem INT = TRY_CONVERT(INT, REPLACE(@Parametro1, 'ANTES_DA_ORDEM:', ''));
        DECLARE @TipoDestino NVARCHAR(20) = CASE WHEN @Parametro2 LIKE 'USUARIO:%' THEN 'USUARIO' ELSE 'SETOR' END;
        DECLARE @UsuarioId INT = NULL, @SetorId INT = NULL;

        IF @TipoDestino = 'USUARIO'
            SET @UsuarioId = TRY_CONVERT(INT, REPLACE(@Parametro2, 'USUARIO:', ''));
        ELSE
            SET @SetorId = TRY_CONVERT(INT, REPLACE(@Parametro2, 'SETOR:', ''));

        INSERT INTO ProtocoloDigital_EtapasExtras (ProtocoloId, AntesDaOrdem, TipoDestino, UsuarioId, SetorId)
        VALUES (@ProtocoloId, @AntesDaOrdem, @TipoDestino, @UsuarioId, @SetorId);

        INSERT INTO ProtocoloDigital_Historico (ProtocoloId, Evento, Detalhes)
        VALUES (@ProtocoloId, N'RegraAplicada', CONCAT(N'INSERIR_ETAPA_INTERMEDIARIA ', @Parametro1, N' ', @Parametro2));
    END
END

-- Consultar próxima parada
SELECT * FROM ProtocoloDigital_FluxosAprovacao WHERE TipoProtocoloId = (SELECT TipoProtocoloId FROM ProtocoloDigital_Protocolos WHERE Id = @ProtocoloId);
GO
