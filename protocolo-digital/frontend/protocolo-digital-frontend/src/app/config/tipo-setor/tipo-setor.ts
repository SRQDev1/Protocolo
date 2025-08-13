import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-tipo-setor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTabsModule
  ],
  templateUrl: './tipo-setor.html'
})
export class TipoSetor implements OnInit {
  tipos: any[] = [];
  setores: any[] = [];
  vinculos: any[] = [];

  form = {
    tipoProtocoloId: 0,
    setorIds: [] as number[],
    todosSetores: false
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.api.get<any[]>('/tipos-protocolo').subscribe(t => {
      this.tipos = t;
    });
    this.api.get<any[]>('/setores').subscribe(s => {
      this.setores = s;
    });
    this.api.get<any[]>('/tipo-setor').subscribe(v => {
      const map: {[key: number]: string[]} = {};
      v.forEach((x: any) => {
        if (!map[x.tipoProtocoloId]) map[x.tipoProtocoloId] = [];
        map[x.tipoProtocoloId].push(x.setor.nome);
      });
      this.vinculos = Object.keys(map).map(id => {
        const tipo = v.find(x => x.tipoProtocoloId == +id).tipoProtocolo.nome;
        return { tipo, setores: map[+id].join(', ') };
      });
      // adicionar tipos globais sem registros
      this.tipos.filter(t => t.todosSetores).forEach(t => {
        if (!map[t.id]) {
          this.vinculos.push({ tipo: t.nome, setores: 'Todos os setores' });
        }
      });
    });
  }

  toggleTodos() {
    if (this.form.todosSetores) {
      this.form.setorIds = [];
    }
  }

  salvar() {
    if (!this.form.tipoProtocoloId) return;
    if (!this.form.todosSetores && this.form.setorIds.length === 0) return;

    const body: any = { tipoProtocoloId: this.form.tipoProtocoloId };
    if (this.form.todosSetores) {
      this.api.put(`/tipos-protocolo/${this.form.tipoProtocoloId}`, { todosSetores: true })
        .subscribe({
          next: () => { this.carregarDados(); alert('Vínculo salvo'); },
          error: err => alert(err.error?.message || 'Erro ao salvar')
        });
    } else {
      const reqs = this.form.setorIds.map(id => this.api.post('/tipo-setor', { tipoProtocoloId: this.form.tipoProtocoloId, setorId: id }));
      Promise.all(reqs.map(r => r.toPromise())).then(() => {
        alert('Vínculo salvo');
        this.carregarDados();
      }).catch(err => alert(err.error?.message || 'Erro ao salvar'));
    }
  }

  cancelar() {
    this.form = { tipoProtocoloId: 0, setorIds: [], todosSetores: false };
  }
}
