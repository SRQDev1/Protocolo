import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-fluxos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fluxos.html'
})
export class Fluxos implements OnInit {
  fluxos: any[] = [];
  tipos: any[] = [];
  novo: any = { tipoProtocolo: 0, setor: 0, ordem: 1, valorMinimo: 0, valorMaximo: null, prazoHoras: 0, comportamentoRecusa: 'Anterior', enviarAlerta: false };
  setores: any[] = [];
  editandoId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('/tipos-protocolo').subscribe(t => this.tipos = t);
    this.api.get<any[]>('/setores').subscribe(s => this.setores = s);
  }

  carregar() {
    if (!this.novo.tipoProtocolo) return;
    this.api.get<any[]>(`/fluxos/${this.novo.tipoProtocolo}`).subscribe(f => this.fluxos = f);
  }

  salvar() {
    const dados = {
      tipoProtocolo: { id: this.novo.tipoProtocolo },
      setor: { id: this.novo.setor },
      ordem: this.novo.ordem,
      valorMinimo: this.novo.valorMinimo,
      valorMaximo: this.novo.valorMaximo,
      prazoHoras: this.novo.prazoHoras,
      comportamentoRecusa: this.novo.comportamentoRecusa,
      enviarAlertaAnterior: this.novo.enviarAlerta
    };
    const req = this.editandoId
      ? this.api.put(`/fluxos/${this.editandoId}`, dados)
      : this.api.post('/fluxos', dados);
    req.subscribe(() => {
      this.carregar();
      this.editandoId = null;
    });
  }

  editar(f: any) {
    this.editandoId = f.id;
    this.novo = {
      tipoProtocolo: this.novo.tipoProtocolo || f.tipoProtocolo.id,
      setor: f.setor.id,
      ordem: f.ordem,
      valorMinimo: f.valorMinimo,
      valorMaximo: f.valorMaximo,
      prazoHoras: f.prazoHoras,
      comportamentoRecusa: f.comportamentoRecusa || 'Anterior',
      enviarAlerta: f.enviarAlertaAnterior || false
    };
  }

  cancelar() {
    this.editandoId = null;
    this.novo = { tipoProtocolo: this.novo.tipoProtocolo, setor: 0, ordem: 1, valorMinimo: 0, valorMaximo: null, prazoHoras: 0, comportamentoRecusa: 'Anterior', enviarAlerta: false };
  }

  deletar(id: number) {
    this.api.delete(`/fluxos/${id}`).subscribe(() => this.carregar());
  }
}
