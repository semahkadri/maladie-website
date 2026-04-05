import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Commande } from '../../../modeles/commande.model';
import { CommandeService } from '../../../services/commande.service';
import { TraductionService } from '../../../services/traduction.service';

@Component({
  selector: 'app-liste-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header d-flex justify-content-between align-items-center">
        <div>
          <h2 class="page-title">
            <i class="bi bi-receipt-cutoff me-2 text-gradient"></i>{{ t.tr('lcmd.titre') }}
          </h2>
          <p class="page-subtitle">{{ commandesFiltrees.length }} {{ commandesFiltrees.length !== 1 ? t.tr('lcmd.commandes') : t.tr('lcmd.commande') }} {{ t.tr('lc.auTotal') }}</p>
        </div>
      </div>

      <!-- Messages -->
      <div *ngIf="message" class="alert" [ngClass]="messageType === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i class="bi me-2" [ngClass]="messageType === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
        {{ message }}
        <button type="button" class="btn-close float-end" (click)="message = ''"></button>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement">
        <!-- Filter Bar -->
        <div class="card mb-3">
          <div class="card-body py-3">
            <div class="filter-bar">
              <div class="search-input">
                <i class="bi bi-search"></i>
                <input type="text" class="form-control" [placeholder]="t.tr('lcmd.rechercher')"
                       [(ngModel)]="recherche" (ngModelChange)="filtrer()">
              </div>
              <select class="form-select" style="width: auto; min-width: 180px;"
                      [(ngModel)]="filtreStatut" (ngModelChange)="filtrer()">
                <option value="">{{ t.tr('lcmd.tousStatuts') }}</option>
                <option value="EN_ATTENTE">{{ t.tr('lcmd.enAttente') }}</option>
                <option value="CONFIRMEE">{{ t.tr('lcmd.confirmee') }}</option>
                <option value="EN_PREPARATION">{{ t.tr('lcmd.enPreparation') }}</option>
                <option value="EXPEDIEE">{{ t.tr('lcmd.expediee') }}</option>
                <option value="LIVREE">{{ t.tr('lcmd.livree') }}</option>
                <option value="ANNULEE">{{ t.tr('lcmd.annulee') }}</option>
              </select>
              <span class="text-muted" style="font-size: 0.82rem; white-space: nowrap;">
                {{ commandesFiltrees.length }} {{ commandesFiltrees.length !== 1 ? t.tr('common.resultats') : t.tr('common.resultat') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="card">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>{{ t.tr('lcmd.reference') }}</th>
                    <th>{{ t.tr('lcmd.client') }}</th>
                    <th>{{ t.tr('lcmd.articles') }}</th>
                    <th>{{ t.tr('lcmd.montant') }}</th>
                    <th>{{ t.tr('lcmd.statutCol') }}</th>
                    <th>{{ t.tr('lcmd.date') }}</th>
                    <th class="text-center">{{ t.tr('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="commandesFiltrees.length === 0">
                    <td colspan="7" class="text-center">
                      <div class="empty-state">
                        <i class="bi bi-inbox d-block"></i>
                        <p>{{ t.tr('lcmd.aucune') }}</p>
                      </div>
                    </td>
                  </tr>
                  <tr *ngFor="let cmd of commandesPage">
                    <td>
                      <span class="fw-bold" style="color: var(--primary); font-size: 0.85rem;">{{ cmd.reference }}</span>
                    </td>
                    <td>
                      <span class="fw-semibold">{{ cmd.nomClient }}</span>
                      <small *ngIf="cmd.emailClient" class="d-block text-muted">{{ cmd.emailClient }}</small>
                    </td>
                    <td>
                      <span class="badge badge-category">{{ cmd.nombreArticles }}</span>
                    </td>
                    <td class="fw-bold">{{ cmd.montantTotal | number:'1.2-2' }} TND</td>
                    <td>
                      <span class="cmd-badge" [ngClass]="getStatutClass(cmd.statut)">
                        <i class="bi" [ngClass]="getStatutIcon(cmd.statut)"></i>
                        {{ t.tr('lcmd.' + getStatutKey(cmd.statut)) }}
                      </span>
                    </td>
                    <td>{{ cmd.dateCommande | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="text-center">
                      <a [routerLink]="['/admin/commandes', cmd.id]" class="btn btn-sm btn-primary">
                        <i class="bi bi-eye"></i> {{ t.tr('lcmd.voir') }}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div *ngIf="totalPages > 1" class="pagination-wrapper">
              <div class="pagination-info">
                {{ t.tr('lc.affichage') }} {{ debut + 1 }}-{{ fin }} {{ t.tr('catalogue.sur') }} {{ commandesFiltrees.length }}
              </div>
              <div class="pagination-controls">
                <button (click)="page = page - 1; paginer()" [disabled]="page === 1">
                  <i class="bi bi-chevron-left"></i>
                </button>
                <button *ngFor="let p of pages" (click)="page = p; paginer()"
                        [class.active]="p === page">{{ p }}</button>
                <button (click)="page = page + 1; paginer()" [disabled]="page === totalPages">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ListeCommandesComponent implements OnInit {
  commandes: Commande[] = [];
  commandesFiltrees: Commande[] = [];
  commandesPage: Commande[] = [];
  message = '';
  messageType = '';
  chargement = true;
  recherche = '';
  filtreStatut = '';

  page = 1;
  parPage = 10;
  totalPages = 1;
  pages: number[] = [];
  debut = 0;
  fin = 0;

  constructor(
    private commandeService: CommandeService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.chargerCommandes();
  }

  chargerCommandes(): void {
    this.chargement = true;
    this.commandeService.listerTout().subscribe({
      next: (data) => {
        this.commandes = data;
        this.filtrer();
        this.chargement = false;
      },
      error: () => {
        this.message = this.t.tr('lcmd.erreurChargement');
        this.messageType = 'error';
        this.chargement = false;
      }
    });
  }

  filtrer(): void {
    const q = this.recherche.toLowerCase().trim();
    this.commandesFiltrees = this.commandes.filter(c => {
      const matchRecherche = !q
        || c.reference.toLowerCase().includes(q)
        || c.nomClient.toLowerCase().includes(q)
        || (c.emailClient || '').toLowerCase().includes(q);
      const matchStatut = !this.filtreStatut || c.statut === this.filtreStatut;
      return matchRecherche && matchStatut;
    });
    this.page = 1;
    this.paginer();
  }

  paginer(): void {
    this.totalPages = Math.max(1, Math.ceil(this.commandesFiltrees.length / this.parPage));
    if (this.page > this.totalPages) this.page = this.totalPages;
    this.debut = (this.page - 1) * this.parPage;
    this.fin = Math.min(this.debut + this.parPage, this.commandesFiltrees.length);
    this.commandesPage = this.commandesFiltrees.slice(this.debut, this.fin);
    // Show max 5 page buttons to avoid overflow on large datasets
    const maxVisible = 5;
    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > this.totalPages) { end = this.totalPages; start = Math.max(1, end - maxVisible + 1); }
    this.pages = [];
    for (let i = start; i <= end; i++) this.pages.push(i);
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'cmd-en-attente',
      'CONFIRMEE': 'cmd-confirmee',
      'EN_PREPARATION': 'cmd-en-preparation',
      'EXPEDIEE': 'cmd-expediee',
      'LIVREE': 'cmd-livree',
      'ANNULEE': 'cmd-annulee'
    };
    return map[statut] || 'cmd-en-attente';
  }

  getStatutIcon(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'bi-hourglass-split',
      'CONFIRMEE': 'bi-check-circle',
      'EN_PREPARATION': 'bi-boxes',
      'EXPEDIEE': 'bi-truck',
      'LIVREE': 'bi-bag-check-fill',
      'ANNULEE': 'bi-x-circle'
    };
    return map[statut] || 'bi-circle';
  }

  getStatutKey(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'enAttente',
      'CONFIRMEE': 'confirmee',
      'EN_PREPARATION': 'enPreparation',
      'EXPEDIEE': 'expediee',
      'LIVREE': 'livree',
      'ANNULEE': 'annulee'
    };
    return map[statut] || 'enAttente';
  }
}
