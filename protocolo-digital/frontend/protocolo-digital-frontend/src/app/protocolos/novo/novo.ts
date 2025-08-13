import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadComponent } from '../../shared/upload/upload';
import { ApiService } from '../../shared/api.service';
import { Router } from '@angular/router';
import { FormTitleComponent } from '../../shared/form-title/form-title';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-novo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UploadComponent,
    FormTitleComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    FlexLayoutModule
  ],
  templateUrl: './novo.html',
  styleUrl: './novo.scss'
})
export class Novo implements OnInit {
  tipos: any[] = [];
  setores: any[] = [];
  anexos: string[] = [];
  files: File[] = [];
  quantidadeParcelas = 1;
  primeiroVencimento = '';
  loading = false;
  dados: any = {
    tipoProtocoloId: 0,
    setorOrigemId: 0,
    usuarioCriadorId: 0,
    descricao: '',
    valorTotal: 0
  };

  constructor(private api: ApiService, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.api.get<any[]>('/setores').subscribe(s => { this.setores = s; });
    const u = localStorage.getItem('usuario');
    if (!u) {
      this.snackBar.open('Usuário não autenticado. Faça login novamente.', undefined, { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
    this.dados.usuarioCriadorId = JSON.parse(u).id;
  }

  carregarTipos() {
    if (!this.dados.setorOrigemId) { this.tipos = []; return; }
    this.api.get<any[]>(`/tipos-protocolo?setor=${this.dados.setorOrigemId}`).subscribe(t => this.tipos = t);
  }

  atualizarAnexos() {
    const tipo = this.tipos.find(t => t.id == this.dados.tipoProtocoloId);
    this.anexos = tipo?.anexosObrigatorios ? JSON.parse(tipo.anexosObrigatorios) : [];
  }

  arquivosSelecionados(files: File[]) {
    this.files = files;
  }

  salvar() {
    if (!this.dados.descricao || !this.dados.tipoProtocoloId || !this.dados.setorOrigemId) {
      this.snackBar.open('Preencha todos os campos obrigatórios', undefined, { duration: 3000 });
      return;
    }
    this.loading = true;
    this.api.post<any>('/protocolos', this.dados).subscribe({
      next: p => {
        const fim = () => { this.loading = false; this.snackBar.open('Protocolo criado com sucesso!', undefined, { duration: 3000 }); this.router.navigate(['/protocolos']); };
        const proximo = () => {
          if (this.files.length) {
            const fd = new FormData();
            this.files.forEach(f => fd.append('files', f));
          this.api.post(`/protocolos/${p.id}/anexos`, fd).subscribe(() => fim());
          } else fim();
        };
        this.api.post(`/protocolos/${p.id}/parcelas`, {
          quantidade: this.quantidadeParcelas,
          primeiraData: this.primeiroVencimento
      }).subscribe(() => proximo());
    },
      error: err => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Erro ao criar protocolo', undefined, { duration: 3000 });
      }
    });
  }
}
