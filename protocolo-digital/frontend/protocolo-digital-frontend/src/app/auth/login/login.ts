import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email = '';
  senha = '';

  constructor(private api: ApiService, private router: Router) {}

  entrar() {
    this.api.post<any>('/auth/login', { email: this.email, senha: this.senha })
      .subscribe(u => {
        localStorage.setItem('usuario', JSON.stringify(u));
        this.router.navigate(['/protocolos']);
      });
  }
}
