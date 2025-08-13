import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-tipos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipos.html'
})
export class Tipos implements OnInit {
  tipos: any[] = [];
  novo: any = { nome: '', anexosObrigatorios: '', todosSetores: false };
  editandoId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.api.get<any[]>('/tipos-protocolo').subscribe(t => this.tipos = t);
  }

  salvar() {
    if (!this.novo.nome) return;
    const req = this.editandoId
      ? this.api.put(`/tipos-protocolo/${this.editandoId}`, this.novo)
      : this.api.post('/tipos-protocolo', this.novo);
    req.subscribe(() => {
      this.novo = { nome: '', anexosObrigatorios: '' };
      this.editandoId = null;
      this.carregar();
    });
  }

  editar(t: any) {
    this.novo = { nome: t.nome, anexosObrigatorios: t.anexosObrigatorios, todosSetores: t.todosSetores };
    this.editandoId = t.id;
  }

  cancelar() {
    this.editandoId = null;
    this.novo = { nome: '', anexosObrigatorios: '', todosSetores: false };
  }

  deletar(id: number) {
    this.api.delete(`/tipos-protocolo/${id}`).subscribe(() => this.carregar());
  }
}
