import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-setores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setores.html'
})
export class Setores implements OnInit {
  setores: any[] = [];
  novo: any = { nome: '', descricao: '' };
  editandoId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.api.get<any[]>('/setores').subscribe(s => this.setores = s);
  }

  salvar() {
    if (!this.novo.nome) return;
    const req = this.editandoId
      ? this.api.put(`/setores/${this.editandoId}`, this.novo)
      : this.api.post('/setores', this.novo);
    req.subscribe(() => {
      this.novo = { nome: '', descricao: '' };
      this.editandoId = null;
      this.carregar();
    });
  }

  editar(s: any) {
    this.novo = { nome: s.nome, descricao: s.descricao };
    this.editandoId = s.id;
  }

  cancelar() {
    this.editandoId = null;
    this.novo = { nome: '', descricao: '' };
  }

  deletar(id: number) {
    this.api.delete(`/setores/${id}`).subscribe(() => this.carregar());
  }
}
