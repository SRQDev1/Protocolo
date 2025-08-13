import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  @ViewChild('statusChart') statusChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tempoChart') tempoChart!: ElementRef<HTMLCanvasElement>;

  dataInicio = '';
  dataFim = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    const params: string[] = [];
    if (this.dataInicio) params.push(`inicio=${this.dataInicio}`);
    if (this.dataFim) params.push(`fim=${this.dataFim}`);
    const query = params.length ? `?${params.join('&')}` : '';
    this.api.get<any[]>(`/dashboard/volume-status-setor${query}`).subscribe(d => this.desenharStatus(d));
    this.api.get<any[]>(`/dashboard/tempo-medio-etapas`).subscribe(d => this.desenharTempo(d));
  }

  desenharStatus(dados: any[]) {
    const ctx = this.statusChart.nativeElement.getContext('2d');
    if (!ctx) return;
    const labels = dados.map(r => `${r.setor} - ${r.status}`);
    const data = dados.map(r => r.total);
    new Chart(ctx, { type: 'bar', data: { labels, datasets: [{ label: 'Protocolos', data }] } });
  }

  desenharTempo(dados: any[]) {
    const ctx = this.tempoChart.nativeElement.getContext('2d');
    if (!ctx) return;
    const labels = dados.map(r => r.acao);
    const data = dados.map(r => r.tempoMedioMinutos);
    new Chart(ctx, { type: 'bar', data: { labels, datasets: [{ label: 'Tempo médio (min)', data }] } });
  }
}
