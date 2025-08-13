USE ProtocoloDigital;
GO

CREATE TRIGGER TR_ValidaPermissaoRegistrarAprovar
ON ProtocoloDigital_Permissoes
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN ProtocoloDigital_Permissoes p
            ON p.UsuarioId = i.UsuarioId
           AND ISNULL(p.TipoProtocoloId, 0) = ISNULL(i.TipoProtocoloId, 0)
        JOIN ProtocoloDigital_TiposAcao a1 ON a1.Id = p.AcaoId
        JOIN ProtocoloDigital_TiposAcao a2 ON a2.Id = i.AcaoId
        WHERE (a1.Nome = 'Registrar' AND a2.Nome = 'Aprovar')
           OR (a1.Nome = 'Aprovar' AND a2.Nome = 'Registrar')
    )
    BEGIN
        RAISERROR('Usuario nao pode ter permissao de registrar e aprovar para o mesmo tipo de protocolo', 16, 1);
        ROLLBACK TRANSACTION;
    END
END
GO
