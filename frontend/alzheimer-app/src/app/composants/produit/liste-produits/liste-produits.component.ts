import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Produit } from '../../../modeles/produit.model';
import { Categorie } from '../../../modeles/categorie.model';
import { ProduitService } from '../../../services/produit.service';
import { CategorieService } from '../../../services/categorie.service';
import { TraductionService } from '../../../services/traduction.service';

@Component({
  selector: 'app-liste-produits',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header d-flex justify-content-between align-items-center">
        <div>
          <h2 class="page-title">
            <i class="bi bi-box-seam-fill me-2 text-gradient"></i>{{ t.tr('lp.titre') }}
          </h2>
          <p class="page-subtitle">{{ produitsFiltres.length }} {{ produitsFiltres.length !== 1 ? t.tr('common.produits') : t.tr('common.produit') }} {{ t.tr('lp.auTotal') }}</p>
        </div>
        <a routerLink="/admin/produits/ajouter" class="btn btn-primary">
          <i class="bi bi-plus-circle me-1"></i>{{ t.tr('lp.nouveauProd') }}
        </a>
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
        <p class="mt-3 text-muted">{{ t.tr('lp.chargement') }}</p>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement">
        <!-- Search & Filter Bar -->
        <div class="card mb-3">
          <div class="card-body py-3">
            <div class="filter-bar">
              <div class="search-input">
                <i class="bi bi-search"></i>
                <input type="text" class="form-control" [placeholder]="t.tr('lp.rechercher')"
                       [(ngModel)]="recherche" (ngModelChange)="filtrer()">
              </div>
              <select class="form-select" style="width: auto; min-width: 180px;"
                      [(ngModel)]="filtreCategorie" (ngModelChange)="filtrer()">
                <option [ngValue]="0">{{ t.tr('lp.toutesCat') }}</option>
                <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.nom }}</option>
              </select>
              <select class="form-select" style="width: auto; min-width: 150px;"
                      [(ngModel)]="filtreStock" (ngModelChange)="filtrer()">
                <option value="tous">{{ t.tr('lp.toutStock') }}</option>
                <option value="normal">{{ t.tr('lp.stockNormal') }}</option>
                <option value="faible">{{ t.tr('lp.stockFaible') }}</option>
                <option value="rupture">{{ t.tr('lp.enRupture') }}</option>
              </select>
              <span class="text-muted" style="font-size: 0.82rem; white-space: nowrap;">
                {{ produitsFiltres.length }} {{ produitsFiltres.length !== 1 ? t.tr('common.resultats') : t.tr('common.resultat') }}
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
                    <th>{{ t.tr('common.id') }}</th>
                    <th>{{ t.tr('common.nom') }}</th>
                    <th>{{ t.tr('common.description') }}</th>
                    <th>{{ t.tr('lp.prixTND') }}</th>
                    <th>{{ t.tr('lp.quantite') }}</th>
                    <th>{{ t.tr('detail.categorie') }}</th>
                    <th>{{ t.tr('lp.dateCreation') }}</th>
                    <th class="text-center">{{ t.tr('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="produitsFiltres.length === 0">
                    <td colspan="8" class="text-center">
                      <div class="empty-state">
                        <i class="bi bi-inbox d-block"></i>
                        <p *ngIf="!recherche && filtreCategorie === 0 && filtreStock === 'tous'">{{ t.tr('lp.aucunProduit') }}</p>
                        <p *ngIf="recherche || filtreCategorie !== 0 || filtreStock !== 'tous'">{{ t.tr('lp.aucunFiltre') }}</p>
                        <a *ngIf="!recherche && filtreCategorie === 0 && filtreStock === 'tous'"
                           routerLink="/admin/produits/ajouter" class="btn btn-primary btn-sm">
                          <i class="bi bi-plus-circle me-1"></i>{{ t.tr('lp.ajouterProduit') }}
                        </a>
                        <button *ngIf="recherche || filtreCategorie !== 0 || filtreStock !== 'tous'"
                                class="btn btn-secondary btn-sm" (click)="reinitialiserFiltres()">
                          <i class="bi bi-x-circle me-1"></i>{{ t.tr('lp.reinitialiser') }}
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngFor="let produit of produitsPage">
                    <td><span class="text-muted">#{{ produit.id }}</span></td>
                    <td class="fw-semibold">
                      <div class="d-flex align-items-center gap-2">
                        <img *ngIf="produit.imageUrl" [src]="produit.imageUrl" [alt]="produit.nom"
                             style="width: 36px; height: 36px; object-fit: cover; border-radius: 6px;">
                        <i *ngIf="!produit.imageUrl" class="bi bi-image text-muted" style="font-size: 1.2rem;"></i>
                        {{ produit.nom }}
                      </div>
                    </td>
                    <td class="text-muted" style="max-width: 200px;">
                      {{ produit.description | slice:0:60 }}{{ (produit.description.length || 0) > 60 ? '...' : '' }}
                    </td>
                    <td class="fw-semibold">
                      {{ produit.prix | number:'1.2-2' }}
                      <span *ngIf="produit.enPromo" class="fo-admin-promo-badge">Promo</span>
                    </td>
                    <td>
                      <span class="badge badge-stock"
                            [ngClass]="produit.quantite > 10 ? 'bg-success' : produit.quantite > 0 ? 'bg-warning' : 'bg-danger'">
                        {{ produit.quantite }}
                        <span *ngIf="produit.quantite === 0"> - {{ t.tr('lp.ruptureBadge') }}</span>
                      </span>
                    </td>
                    <td>
                      <span class="badge badge-category">{{ produit.categorieNom }}</span>
                    </td>
                    <td>{{ produit.dateCreation | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="text-center">
                      <div class="btn-action-group">
                        <a [routerLink]="['/admin/produits/modifier', produit.id]" class="btn btn-sm btn-warning">
                          <i class="bi bi-pencil"></i> {{ t.tr('common.modifier') }}
                        </a>
                        <button class="btn btn-sm btn-danger" (click)="confirmerSuppression(produit)">
                          <i class="bi bi-trash"></i> {{ t.tr('common.supprimer') }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div *ngIf="totalPages > 1" class="pagination-wrapper">
              <div class="pagination-info">
                {{ t.tr('lp.affichage') }} {{ debut + 1 }}-{{ fin }} {{ t.tr('catalogue.sur') }} {{ produitsFiltres.length }}
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

      <!-- Modal de confirmation -->
      <div *ngIf="produitASupprimer" class="modal fade show d-block" tabindex="-1"
           style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ t.tr('lp.confirmTitre') }}
              </h5>
            </div>
            <div class="modal-body">
              <p>{{ t.tr('lp.confirmMsg') }}
                <strong>{{ produitASupprimer.nom }}</strong> ?</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="produitASupprimer = null">{{ t.tr('common.annuler') }}</button>
              <button class="btn btn-danger" (click)="supprimer()">
                <i class="bi bi-trash me-1"></i>{{ t.tr('common.supprimer') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ListeProduitsComponent implements OnInit {
  tousLesProduits: Produit[] = [];
  produitsFiltres: Produit[] = [];
  produitsPage: Produit[] = [];
  categories: Categorie[] = [];
  message = '';
  messageType = '';
  produitASupprimer: Produit | null = null;
  chargement = true;
  recherche = '';
  filtreCategorie = 0;
  filtreStock = 'tous';

  // Pagination
  page = 1;
  parPage = 10;
  totalPages = 1;
  pages: number[] = [];
  debut = 0;
  fin = 0;

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement = true;
    this.categorieService.listerTout().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error(err)
    });
    this.produitService.listerTout().subscribe({
      next: (data) => {
        this.tousLesProduits = data;
        this.filtrer();
        this.chargement = false;
      },
      error: (err) => {
        this.message = this.t.tr('lp.erreurChargement');
        this.messageType = 'error';
        this.chargement = false;
        console.error(err);
      }
    });
  }

  filtrer(): void {
    const q = this.recherche.toLowerCase().trim();
    this.produitsFiltres = this.tousLesProduits.filter(p => {
      const matchRecherche = !q || p.nom.toLowerCase().includes(q)
        || (p.description || '').toLowerCase().includes(q)
        || (p.categorieNom || '').toLowerCase().includes(q);
      const matchCategorie = this.filtreCategorie === 0 || p.categorieId === this.filtreCategorie;
      let matchStock = true;
      if (this.filtreStock === 'normal') matchStock = p.quantite > 10;
      else if (this.filtreStock === 'faible') matchStock = p.quantite > 0 && p.quantite <= 10;
      else if (this.filtreStock === 'rupture') matchStock = p.quantite === 0;
      return matchRecherche && matchCategorie && matchStock;
    });
    this.page = 1;
    this.paginer();
  }

  paginer(): void {
    this.totalPages = Math.max(1, Math.ceil(this.produitsFiltres.length / this.parPage));
    if (this.page > this.totalPages) this.page = this.totalPages;
    this.debut = (this.page - 1) * this.parPage;
    this.fin = Math.min(this.debut + this.parPage, this.produitsFiltres.length);
    this.produitsPage = this.produitsFiltres.slice(this.debut, this.fin);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  reinitialiserFiltres(): void {
    this.recherche = '';
    this.filtreCategorie = 0;
    this.filtreStock = 'tous';
    this.filtrer();
  }

  confirmerSuppression(produit: Produit): void {
    this.produitASupprimer = produit;
  }

  supprimer(): void {
    if (this.produitASupprimer?.id) {
      this.produitService.supprimer(this.produitASupprimer.id).subscribe({
        next: () => {
          this.message = this.t.tr('lp.successSupp', { nom: this.produitASupprimer?.nom || '' });
          this.messageType = 'success';
          this.produitASupprimer = null;
          this.chargerDonnees();
        },
        error: (err) => {
          this.message = this.t.tr('lp.erreurSuppression');
          this.messageType = 'error';
          this.produitASupprimer = null;
          console.error(err);
        }
      });
    }
  }
}
