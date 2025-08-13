-- Consulta otimizada para listagem de protocolos por usuario
-- Parametro : UsuarioId
DECLARE @UsuarioId INT = 9; -- exemplo de uso

DECLARE @AcaoAprovar INT = (SELECT TOP 1 Id FROM ProtocoloDigital_TiposAcao WHERE Nome = 'Aprovar');

WITH SetoresUsuario AS (
    SELECT SetorId FROM ProtocoloDigital_UsuarioSetores WHERE UsuarioId = @UsuarioId
),
PermUsuario AS (
    SELECT p.TipoProtocoloId, p.SetorId, p.ValorMaximo
    FROM ProtocoloDigital_Permissoes p
    WHERE p.UsuarioId = @UsuarioId AND p.AcaoId = @AcaoAprovar
)
SELECT DISTINCT P.Id, P.Descricao, P.Status, P.DataCriacao,
       P.TipoProtocoloId, P.SetorOrigemId, P.EtapaAtual
FROM ProtocoloDigital_Protocolos P
LEFT JOIN ProtocoloDigital_FluxosAprovacao FA
       ON FA.TipoProtocoloId = P.TipoProtocoloId AND FA.Ordem = P.EtapaAtual
WHERE
    -- Criador do protocolo
    P.UsuarioCriadorId = @UsuarioId
    OR EXISTS (
        -- Aprovador da etapa atual
        SELECT 1
        FROM PermUsuario prm
        JOIN SetoresUsuario su ON su.SetorId = ISNULL(prm.SetorId, FA.SetorId)
        WHERE (prm.TipoProtocoloId IS NULL OR prm.TipoProtocoloId = P.TipoProtocoloId)
          AND (prm.SetorId IS NULL OR prm.SetorId = FA.SetorId)
    )
    OR EXISTS (
        -- Participou de etapas anteriores
        SELECT 1
        FROM ProtocoloDigital_Historico H
        WHERE H.ProtocoloId = P.Id AND H.UsuarioId = @UsuarioId
          AND H.Acao IN ('Aprovacao','Recusa')
    )
ORDER BY P.DataCriacao DESC;
