import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { Router } from '@angular/router';
import { FormTitleComponent } from '../shared/form-title/form-title';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormTitleComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FlexLayoutModule
  ],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss'
})
export class UsuarioForm implements OnInit {
  setores: any[] = [];
  loading = false;
  form = {
    nome: '',
    email: '',
    senha: '',
    confirmar: '',
    ativo: true,
    perfil: '',
    setorId: 0
  };

  constructor(private api: ApiService, private router: Router, private snack: MatSnackBar) {}

  ngOnInit() {
    this.api.get<any[]>('/setores').subscribe(s => this.setores = s);
  }

  private validar(): boolean {
    if (!this.form.nome || this.form.nome.trim().length < 3) {
      this.snack.open('Nome deve ter ao menos 3 caracteres', undefined, { duration: 3000 });
      return false;
    }
    if (!this.form.email) {
      this.snack.open('E-mail é obrigatório', undefined, { duration: 3000 });
      return false;
    }
    if (!this.form.senha || this.form.senha.length < 6) {
      this.snack.open('Senha deve ter no mínimo 6 caracteres', undefined, { duration: 3000 });
      return false;
    }
    if (this.form.senha !== this.form.confirmar) {
      this.snack.open('Confirmação de senha não confere', undefined, { duration: 3000 });
      return false;
    }
    if (!this.form.perfil) {
      this.snack.open('Selecione um perfil', undefined, { duration: 3000 });
      return false;
    }
    return true;
  }

  salvar() {
    if (!this.validar()) return;
    this.loading = true;
    const body: any = {
      nome: this.form.nome,
      email: this.form.email,
      senha: this.form.senha,
      ativo: this.form.ativo,
      perfil: this.form.perfil,
      setorId: this.form.setorId || null
    };
    this.api.post<any>('/usuarios', body).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Usuário criado com sucesso!', undefined, { duration: 3000 });
        this.router.navigate(['/usuarios']);
      },
      error: err => {
        this.loading = false;
        this.snack.open(err.error?.message || 'Erro ao criar usuário', undefined, { duration: 3000 });
      }
    });
  }

  cancelar() {
    this.router.navigate(['/']);
  }
}
