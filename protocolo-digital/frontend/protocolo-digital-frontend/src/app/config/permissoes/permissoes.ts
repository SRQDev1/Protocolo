import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-permissoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permissoes.html'
})
export class Permissoes implements OnInit {
  permissoes: any[] = [];
  usuarios: any[] = [];
  tipos: any[] = [];
  acoes: any[] = [];
  setores: any[] = [];
  nova: any = { usuario: 0, tipoProtocolo: 0, setor: 0, valorMaximo: 0, acao: 0 };
  acaoSelecionada: any = null;
  editandoId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('/usuarios').subscribe(u => this.usuarios = u);
    this.api.get<any[]>('/tipos-protocolo').subscribe(t => this.tipos = t);
    this.api.get<any[]>('/setores').subscribe(s => this.setores = s);
    this.api.get<any[]>('/tipos-acao').subscribe(a => this.acoes = a);
    this.carregar();
  }

  verificarAcao() {
    this.acaoSelecionada = this.acoes.find(a => a.id == this.nova.acao);
  }

  carregar() {
    this.api.get<any[]>('/permissoes').subscribe(p => this.permissoes = p);
  }

  salvar() {
    const dados = {
      usuario: { id: this.nova.usuario },
      tipoProtocolo: this.nova.tipoProtocolo ? { id: this.nova.tipoProtocolo } : null,
      setor: this.nova.setor ? { id: this.nova.setor } : null,
      valorMaximo: this.nova.valorMaximo,
      acao: { id: this.nova.acao }
    };
    const req = this.editandoId
      ? this.api.put(`/permissoes/${this.editandoId}`, dados)
      : this.api.post('/permissoes', dados);
    req.subscribe(() => {
      this.carregar();
      this.editandoId = null;
    });
  }

  editar(p: any) {
    this.nova = {
      usuario: p.usuario.id,
      tipoProtocolo: p.tipoProtocolo ? p.tipoProtocolo.id : 0,
      setor: p.setor ? p.setor.id : 0,
      valorMaximo: p.valorMaximo,
      acao: p.acao.id
    };
    this.editandoId = p.id;
    this.verificarAcao();
  }

  cancelar() {
    this.editandoId = null;
    this.nova = { usuario: 0, tipoProtocolo: 0, setor: 0, valorMaximo: 0, acao: 0 };
    this.verificarAcao();
  }

  deletar(id: number) {
    this.api.delete(`/permissoes/${id}`).subscribe(() => this.carregar());
  }
}
