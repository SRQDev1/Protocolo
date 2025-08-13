
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-vinculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vinculos.html'
})
export class Vinculos implements OnInit {
  usuarios: any[] = [];
  setores: any[] = [];
  usuarioId = 0;
  setoresSelecionados: number[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('/usuarios').subscribe(u => this.usuarios = u);
    this.api.get<any[]>('/setores').subscribe(s => this.setores = s);
  }

  carregarVinculos() {
    if (!this.usuarioId) { this.setoresSelecionados = []; return; }
    this.api.get<any[]>(`/usuarios/${this.usuarioId}/setores`)
      .subscribe(v => this.setoresSelecionados = v.map(x => x.setorId));
  }

  toggleSetor(id: number, checked: boolean) {
    if (checked) {
      if (!this.setoresSelecionados.includes(id)) {
        this.setoresSelecionados.push(id);
      }
    } else {
      this.setoresSelecionados = this.setoresSelecionados.filter(x => x !== id);
    }
  }

  salvar() {
    if (!this.usuarioId) return;
    this.api.put(`/usuarios/${this.usuarioId}/setores`, { setorIds: this.setoresSelecionados })
      .subscribe(() => alert('Vínculos salvos'));
  }
}
