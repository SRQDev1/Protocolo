import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Lista } from './protocolos/lista/lista';
import { Novo } from './protocolos/novo/novo';
import { Detalhe } from './protocolos/detalhe/detalhe';
import { Dashboard } from './dashboard/dashboard';
import { Setores } from './config/setores/setores';
import { Tipos } from './config/tipos/tipos';
import { Fluxos } from './config/fluxos/fluxos';
import { Permissoes } from './config/permissoes/permissoes';
import { Vinculos } from './config/vinculos/vinculos';
import { TipoSetor } from './config/tipo-setor/tipo-setor';
import { AcessoNegado } from './acesso-negado/acesso-negado';
import { UsuarioForm } from './usuarios/usuario-form';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'protocolos', component: Lista },
  { path: 'protocolos/novo', component: Novo },
  { path: 'protocolos/:id', component: Detalhe },
  { path: 'dashboard', component: Dashboard },
  { path: 'config/setores', component: Setores },
  { path: 'config/tipos', component: Tipos },
  { path: 'config/fluxos', component: Fluxos },
  { path: 'config/permissoes', component: Permissoes },
  { path: 'config/vinculos', component: Vinculos },
  { path: 'config/tipo-setor', component: TipoSetor },
  { path: 'usuarios', component: UsuarioForm },
  { path: 'acesso-negado', component: AcessoNegado },
  { path: '', redirectTo: '/protocolos', pathMatch: 'full' }
];
