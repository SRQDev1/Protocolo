import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/database';
import * as dotenv from 'dotenv';
import path from 'path';
import usuarioRoutes from './controllers/UsuarioController';
import setorRoutes from './controllers/SetorController';
import tipoRoutes from './controllers/TipoProtocoloController';
import protocoloRoutes from './controllers/ProtocoloController';
import anexoRoutes from './controllers/AnexoController';
import authRoutes from './controllers/AuthController';
import dashboardRoutes from './controllers/DashboardController';
import permissaoRoutes from './controllers/PermissaoController';
import fluxoConfigRoutes from './controllers/FluxoConfigController';
import tipoAcaoRoutes from './controllers/TipoAcaoController';
import tipoSetorRoutes from './controllers/TipoProtocoloSetorController';
import { carregarUsuario } from './middlewares/usuario';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(carregarUsuario);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/auth', authRoutes as any);
app.use('/usuarios', usuarioRoutes as any);
app.use('/setores', setorRoutes as any);
app.use('/tipos-protocolo', tipoRoutes as any);
app.use('/protocolos', protocoloRoutes as any);
app.use('/protocolos', anexoRoutes as any);
app.use('/dashboard', dashboardRoutes as any);
app.use('/permissoes', permissaoRoutes as any);
app.use('/fluxos', fluxoConfigRoutes as any);
app.use('/tipos-acao', tipoAcaoRoutes as any);
app.use('/tipo-setor', tipoSetorRoutes as any);

app.get('/health', (_req, res) => {
  res.send('OK');
});

const port = process.env.PORT || 3000;

AppDataSource.initialize()
  .catch((error) => {
    console.error('Error during Data Source initialization', error);
  })
  .finally(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  });
