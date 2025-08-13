import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/api.service';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormTitleComponent } from '../../shared/form-title/form-title';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    FormTitleComponent,
    FlexLayoutModule
  ],
  templateUrl: './lista.html',
  styleUrl: './lista.scss'
})
export class Lista implements OnInit {
  protocolos: any[] = [];
  filtroTipo?: number;
  filtroSetor?: number;
  filtroStatus = '';
  setores: any[] = [];
  displayedColumns = ['numero', 'tipo', 'setor', 'status', 'etapa', 'progresso'];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('/setores').subscribe(s => this.setores = s);
    this.carregar();
  }

  carregar() {
    const params: string[] = [];
    if (this.filtroTipo) params.push(`tipoProtocoloId=${this.filtroTipo}`);
    if (this.filtroSetor) params.push(`setorId=${this.filtroSetor}`);
    if (this.filtroStatus) params.push(`status=${this.filtroStatus}`);
    const query = params.length ? `?${params.join('&')}` : '';
    this.api.get<any[]>(`/protocolos${query}`).subscribe(p => this.protocolos = p);
  }
}
