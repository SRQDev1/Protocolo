import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/api.service';
import { UploadComponent } from '../../shared/upload/upload';

@Component({
  selector: 'app-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule, UploadComponent],
  templateUrl: './detalhe.html',
  styleUrl: './detalhe.scss'
})
export class Detalhe implements OnInit, OnDestroy {
  protocolo: any;
  fluxos: any[] = [];
  justificativa = '';
  mostrarModal = false;
  acao = '';
  loading = false;
  editando = false;
  edicao: any = {};
  arquivos: File[] = [];
  podeAprovar = false;
  motivoBloqueio = '';
  podeExecutarAcao = false;
  historico: any[] = [];
  recusaOrdem: number | null = null;
  usuarioId: number | null = null;

  private interval?: any;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const u = localStorage.getItem('usuario');
    this.usuarioId = u ? JSON.parse(u).id : null;
    this.carregar(id);
    this.api.get<any>(`/protocolos/${id}/pode-aprovar`).subscribe(r => {
      this.podeAprovar = r.pode;
      this.motivoBloqueio = r.motivo;
      this.verificarAcao();
    });
    this.interval = setInterval(() => this.carregar(id), 5000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  carregar(id: number) {
    this.api.get<any>(`/protocolos/${id}`).subscribe(p => { this.protocolo = p; this.verificarAcao(); });
    this.api.get<any>(`/protocolos/${id}/fluxos`).subscribe(d => {
      this.fluxos = d.fluxos;
      if (this.protocolo) this.protocolo.etapaAtual = d.etapaAtual;
      this.verificarAcao();
    });
    this.api.get<any[]>(`/protocolos/${id}/historico`).subscribe(h => {
      this.historico = h;
      const rec = h.find(x => x.acao === 'Recusa');
      if (rec && rec.usuario && rec.usuario.setores) {
        const ids = rec.usuario.setores.map((s: any) => s.setor?.id);
        const fluxo = this.fluxos.find(f => ids.includes(f.setor.id));
        this.recusaOrdem = fluxo ? fluxo.ordem : null;
      } else {
        this.recusaOrdem = null;
      }
      this.verificarAcao();
    });
    this.api.get<any>(`/protocolos/${id}/pode-aprovar`).subscribe(r => {
      this.podeAprovar = r.pode;
      this.motivoBloqueio = r.motivo;
      this.verificarAcao();
    });
  }

  editar() {
    this.edicao = { descricao: this.protocolo.descricao, valorTotal: this.protocolo.valorTotal };
    this.editando = true;
  }

  salvarEdicao() {
    this.api.put(`/protocolos/${this.protocolo.id}`, this.edicao).subscribe(p => {
      this.protocolo = p;
      if (this.arquivos.length) {
        const fd = new FormData();
        this.arquivos.forEach(f => fd.append('files', f));
        this.api.post(`/protocolos/${this.protocolo.id}/anexos`, fd).subscribe(() => {
          this.carregar(this.protocolo.id);
          this.editando = false;
          this.arquivos = [];
        });
      } else {
        this.editando = false;
      }
    });
  }

  arquivosSelecionados(files: File[]) {
    this.arquivos = files;
  }

  abrir(acao: string) {
    this.acao = acao;
    this.mostrarModal = true;
  }

  executar() {
    const id = this.protocolo.id;
    const user = localStorage.getItem('usuario');
    if (!user) {
      alert('Usuário não autenticado. Faça login novamente.');
      return;
    }
    const usuarioId = JSON.parse(user).id;
    this.loading = true;
    this.api.post(`/protocolos/${id}/${this.acao}`, { usuarioId, observacao: this.justificativa })
      .subscribe(p => {
        this.protocolo = p;
        this.justificativa = '';
        this.mostrarModal = false;
        this.carregar(id);
        this.loading = false;
        alert('Protocolo atualizado com sucesso!');
      }, () => this.loading = false);
  }

  remover(anexoId: number) {
    this.api.delete(`/protocolos/${this.protocolo.id}/anexos/${anexoId}`).subscribe(() => {
      this.carregar(this.protocolo.id);
    });
  }

  private verificarAcao() {
    if (this.usuarioId === null || !this.protocolo) {
      this.podeExecutarAcao = false;
      return;
    }
    const statusOk = ['Pendente', 'EmCorrecao', 'EmAnalise', 'Recusado'].includes(this.protocolo.status);
    this.podeExecutarAcao = statusOk && this.protocolo.usuarioCriador.id !== this.usuarioId && this.podeAprovar;

    if (this.protocolo.status === 'Recusado' && this.recusaOrdem !== null) {
      const fluxo = this.fluxos.find(f => f.ordem === this.recusaOrdem);
      if (fluxo && fluxo.comportamentoRecusa === 'Inicio') {
        this.podeExecutarAcao = false;
      }
    }
  }
}
