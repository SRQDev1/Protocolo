# ProtocoloDigital_HML
Sistema de Protocolo Digital Homologação

## Estrutura de Pastas

- `protocolo-digital/backend`
- `protocolo-digital/frontend`
- `protocolo-digital/scripts-banco-dados`

## Fase 1

1. **Configuração do Banco de Dados**
   - Execute os scripts em `protocolo-digital/scripts-banco-dados` em um servidor SQL Server.
   - Verifique se todas as tabelas com prefixo `ProtocoloDigital_` foram criadas.

2. **Backend**
   - Copie o arquivo `.env.example` para `.env` e ajuste as variáveis de conexão.
   - Instale as dependências e inicie o servidor:

     ```bash
     cd protocolo-digital/backend
     npm install
    npm start
    ```

3. **Frontend**
   - Instale as dependências e execute a aplicação Vue:

     ```bash
     cd protocolo-digital/frontend
     npm install
     npm run dev
     ```
   - A criação de protocolos requer que o usuário esteja autenticado. Utilize a tela `Login` para entrar antes de tentar abrir um novo protocolo.

## Fase 4

Funcionalidades avançadas implementadas nesta fase:

1. **Upload de Anexos**
   - API em `backend` utiliza Multer para receber arquivos em `/protocolos/:id/anexos`.
   - Arquivos são gravados em `uploads/` e cadastrados na tabela de anexos.

2. **Parcelamento**
   - Endpoint `/protocolos/:id/parcelas` gera parcelas automaticamente a partir do valor do protocolo.

3. **Notificações por E-mail**
   - Serviço de e-mail integrado com Nodemailer envia mensagens nas criações e nas etapas do fluxo.

## Fase 5

Novas funcionalidades de relatórios e dashboard:

1. **Endpoints de Métricas**
   - `/dashboard/tempo-medio-etapas` calcula o tempo médio entre as ações registradas no histórico.
   - `/dashboard/volume-status-setor` retorna o volume de protocolos por status e setor, com filtros de período.

2. **Tela de Dashboard**
   - Frontend possui página `dashboard` exibindo gráficos gerados com Chart.js.
   - Permite filtrar os dados por intervalo de datas.

## Fase 6

Melhorias de segurança e experiência:

1. **Auditoria de Ações**
   - Registro do IP, usuário e data em operações críticas como criação e aprovações.
   - Verificação automática para evitar protocolos duplicados.

2. **UI/UX**
   - Feedbacks visuais ao criar ou alterar protocolos.
   - Layout responsivo com foco em dispositivos móveis.

## Regras de Negócio - Permissões

- Usuários com perfil **Registrador** podem criar protocolos e editar enquanto estiverem `Pendente` ou `EmCorrecao`, mas nunca podem aprovar.
- O usuário que lançou o protocolo não pode aprová-lo, mesmo que possua a permissão de aprovação.
- Aprovações exigem permissão **Aprovar** para o tipo de protocolo e respeito ao valor máximo definido.
- O script `03-permissao-trigger.sql` impede que o mesmo usuário acumule permissões de registrar e aprovar para um mesmo tipo de protocolo.

