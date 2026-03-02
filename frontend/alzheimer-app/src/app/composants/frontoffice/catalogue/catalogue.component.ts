import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../../services/produit.service';
import { CategorieService } from '../../../services/categorie.service';
import { PanierService } from '../../../services/panier.service';
import { Produit } from '../../../modeles/produit.model';
import { Categorie } from '../../../modeles/categorie.model';
import { TraductionService } from '../../../services/traduction.service';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fo-section">
      <div class="fo-section-container">
        <h1 class="fo-page-title">{{ t.tr('catalogue.titre') }}</h1>
        <p class="fo-page-subtitle">{{ t.tr('catalogue.sousTitre') }}</p>

        <!-- Filters Row -->
        <div class="fo-filter-bar">
          <div class="fo-search-box">
            <i class="bi bi-search"></i>
            <input type="text" [placeholder]="t.tr('catalogue.rechercher')"
                   [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()">
          </div>
          <select class="fo-filter-select" [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()">
            <option [ngValue]="0">{{ t.tr('catalogue.toutesCat') }}</option>
            <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.nom }}</option>
          </select>
          <select class="fo-filter-select fo-filter-stock" [(ngModel)]="selectedStock" (ngModelChange)="applyFilters()">
            <option value="tous">{{ t.tr('catalogue.toutStock') }}</option>
            <option value="en-stock">{{ t.tr('catalogue.disponible') }}</option>
          </select>
        </div>

        <!-- Toolbar: Sort + Results Count -->
        <div class="fo-toolbar" *ngIf="!loading">
          <div class="fo-toolbar-left">
            <span class="fo-results-count">
              <strong>{{ filteredProducts.length }}</strong> {{ filteredProducts.length !== 1 ? t.tr('common.produits') : t.tr('common.produit') }} {{ t.tr('catalogue.trouves') }}{{ filteredProducts.length !== 1 ? 's' : '' }}
              <span *ngIf="hasActiveFilters()" class="fo-results-filtered">
                ({{ t.tr('catalogue.filtres') }}{{ filteredProducts.length !== 1 ? 's' : '' }})
                <button class="fo-clear-filters" (click)="resetFilters()">
                  <i class="bi bi-x-circle"></i> {{ t.tr('catalogue.toutEffacer') }}
                </button>
              </span>
            </span>
          </div>
          <div class="fo-toolbar-right">
            <div class="fo-sort-control">
              <label><i class="bi bi-sort-down me-1"></i>{{ t.tr('catalogue.trierPar') }}</label>
              <select [(ngModel)]="sortBy" (ngModelChange)="applySort()">
                <option value="nom-asc">{{ t.tr('catalogue.nomAZ') }}</option>
                <option value="nom-desc">{{ t.tr('catalogue.nomZA') }}</option>
                <option value="prix-asc">{{ t.tr('catalogue.prixAsc') }}</option>
                <option value="prix-desc">{{ t.tr('catalogue.prixDesc') }}</option>
                <option value="date-desc">{{ t.tr('catalogue.dateDesc') }}</option>
                <option value="date-asc">{{ t.tr('catalogue.dateAsc') }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Active Filters Chips -->
        <div class="fo-filter-chips" *ngIf="hasActiveFilters()">
          <span class="fo-chip" *ngIf="searchTerm">
            {{ t.tr('catalogue.chipRecherche') }} : &laquo; {{ searchTerm }} &raquo;
            <button (click)="searchTerm = ''; applyFilters()"><i class="bi bi-x"></i></button>
          </span>
          <span class="fo-chip" *ngIf="selectedCategory">
            {{ t.tr('catalogue.chipCategorie') }} : {{ getCategoryName(selectedCategory) }}
            <button (click)="selectedCategory = 0; applyFilters()"><i class="bi bi-x"></i></button>
          </span>
          <span class="fo-chip" *ngIf="selectedStock !== 'tous'">
            {{ t.tr('catalogue.chipStock') }} : {{ getStockLabel(selectedStock) }}
            <button (click)="selectedStock = 'tous'; applyFilters()"><i class="bi bi-x"></i></button>
          </span>
        </div>

        <!-- Product Grid (paginated) -->
        <div class="fo-product-grid" *ngIf="!loading && pagedProducts.length > 0">
          <a *ngFor="let prod of pagedProducts" [routerLink]="['/catalogue', prod.id]" class="fo-product-card">
            <div class="fo-product-card-img">
              <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" style="width: 100%; height: 100%; object-fit: cover;">
              <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
            </div>
            <div class="fo-product-card-body">
              <span class="fo-product-card-category">{{ prod.categorieNom }}</span>
              <h4>{{ prod.nom }}</h4>
              <p>{{ prod.description | slice:0:80 }}{{ prod.description && prod.description.length > 80 ? '...' : '' }}</p>
              <div class="fo-product-card-footer">
                <span class="fo-product-price">{{ prod.prix | number:'1.2-2' }} TND</span>
                <span class="fo-product-stock"
                      [class.in-stock]="prod.quantite > 0"
                      [class.out-of-stock]="prod.quantite === 0">
                  {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                </span>
              </div>
              <button *ngIf="prod.quantite > 0" class="fo-add-cart-btn mt-2"
                      (click)="ajouterAuPanier($event, prod)"
                      [disabled]="ajoutEnCours === prod.id">
                <span *ngIf="ajoutEnCours === prod.id" class="spinner-border spinner-border-sm me-1"></span>
                <i *ngIf="ajoutEnCours !== prod.id && ajoutOk !== prod.id" class="bi bi-cart-plus me-1"></i>
                <i *ngIf="ajoutOk === prod.id" class="bi bi-check-lg me-1"></i>
                {{ ajoutOk === prod.id ? t.tr('panier.ajouterSuccess') : t.tr('catalogue.ajouterPanier') }}
              </button>
              <span *ngIf="prod.quantite === 0" class="fo-out-of-stock-label mt-2" style="color: var(--danger, #dc3545); font-weight: 600; font-size: 0.85rem;">
                <i class="bi bi-x-circle me-1"></i>{{ t.tr('common.rupture') }}
              </span>
            </div>
          </a>
        </div>

        <!-- Pagination -->
        <div class="fo-pagination" *ngIf="!loading && totalPages > 1">
          <div class="fo-pagination-info">
            {{ t.tr('catalogue.affichage') }} {{ startIndex + 1 }}–{{ endIndex }} {{ t.tr('catalogue.sur') }} {{ filteredProducts.length }}
          </div>
          <div class="fo-pagination-controls">
            <button (click)="goToPage(1)" [disabled]="page === 1" [title]="t.tr('catalogue.premierePage')">
              <i class="bi bi-chevron-double-left"></i>
            </button>
            <button (click)="goToPage(page - 1)" [disabled]="page === 1" [title]="t.tr('catalogue.precedente')">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button *ngFor="let p of visiblePages" (click)="goToPage(p)"
                    [class.active]="p === page">{{ p }}</button>
            <button (click)="goToPage(page + 1)" [disabled]="page === totalPages" [title]="t.tr('catalogue.suivante')">
              <i class="bi bi-chevron-right"></i>
            </button>
            <button (click)="goToPage(totalPages)" [disabled]="page === totalPages" [title]="t.tr('catalogue.dernierePage')">
              <i class="bi bi-chevron-double-right"></i>
            </button>
          </div>
          <div class="fo-pagination-size">
            <label>{{ t.tr('catalogue.parPage') }}</label>
            <select [(ngModel)]="perPage" (ngModelChange)="onPerPageChange()">
              <option [ngValue]="6">6</option>
              <option [ngValue]="12">12</option>
              <option [ngValue]="24">24</option>
              <option [ngValue]="48">48</option>
            </select>
          </div>
        </div>

        <!-- Cart Error Toast -->
        <div *ngIf="ajoutErreur" class="fo-toast fo-toast-error fade-in">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ ajoutErreur }}
          <button (click)="ajoutErreur = ''" style="background: none; border: none; color: inherit; margin-left: 12px; cursor: pointer; font-size: 1.1rem;"><i class="bi bi-x-lg"></i></button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredProducts.length === 0" class="fo-empty-state">
          <i class="bi bi-search"></i>
          <p>{{ t.tr('catalogue.aucunProduit') }}</p>
          <button class="fo-btn fo-btn-outline" (click)="resetFilters()">
            <i class="bi bi-arrow-counterclockwise me-1"></i>{{ t.tr('catalogue.reinitialiser') }}
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="fo-loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CatalogueComponent implements OnInit {
  // Data
  products: Produit[] = [];
  filteredProducts: Produit[] = [];
  pagedProducts: Produit[] = [];
  categories: Categorie[] = [];

  // Filters
  searchTerm = '';
  selectedCategory = 0;
  selectedStock = 'tous';

  // Sort
  sortBy = 'nom-asc';

  // Pagination
  page = 1;
  perPage = 12;
  totalPages = 1;
  visiblePages: number[] = [];
  startIndex = 0;
  endIndex = 0;

  loading = true;
  ajoutEnCours: number | null = null;
  ajoutOk: number | null = null;
  ajoutErreur = '';

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private panierService: PanierService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.categorieService.listerTout().subscribe({
      next: (cats) => this.categories = cats
    });
    this.produitService.listerTout().subscribe({
      next: (prods) => {
        this.products = prods;
        this.applyFilters();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCategory = !this.selectedCategory ||
        p.categorieId === this.selectedCategory;
      let matchStock = true;
      if (this.selectedStock === 'en-stock') matchStock = p.quantite > 0;
      return matchSearch && matchCategory && matchStock;
    });
    this.applySort();
  }

  applySort(): void {
    const [field, direction] = this.sortBy.split('-');
    this.filteredProducts.sort((a, b) => {
      let cmp = 0;
      switch (field) {
        case 'nom':
          cmp = a.nom.localeCompare(b.nom, 'fr');
          break;
        case 'prix':
          cmp = a.prix - b.prix;
          break;
        case 'date':
          cmp = (a.dateCreation || '').localeCompare(b.dateCreation || '');
          break;
      }
      return direction === 'desc' ? -cmp : cmp;
    });
    this.page = 1;
    this.paginate();
  }

  paginate(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.perPage));
    if (this.page > this.totalPages) this.page = this.totalPages;
    this.startIndex = (this.page - 1) * this.perPage;
    this.endIndex = Math.min(this.startIndex + this.perPage, this.filteredProducts.length);
    this.pagedProducts = this.filteredProducts.slice(this.startIndex, this.endIndex);
    this.computeVisiblePages();
  }

  computeVisiblePages(): void {
    const maxVisible = 5;
    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.paginate();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPerPageChange(): void {
    this.page = 1;
    this.paginate();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.selectedCategory || this.selectedStock !== 'tous';
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 0;
    this.selectedStock = 'tous';
    this.sortBy = 'nom-asc';
    this.applyFilters();
  }

  getCategoryName(id: number): string {
    return this.categories.find(c => c.id === id)?.nom || '';
  }

  getStockLabel(value: string): string {
    const labels: Record<string, string> = {
      'en-stock': this.t.tr('catalogue.disponible')
    };
    return labels[value] || value;
  }

  ajouterAuPanier(event: Event, produit: Produit): void {
    event.preventDefault();
    event.stopPropagation();
    if (!produit.id || this.ajoutEnCours) return;
    this.ajoutEnCours = produit.id;
    this.ajoutOk = null;
    this.ajoutErreur = '';
    this.panierService.ajouterProduit(produit.id, 1).subscribe({
      next: () => {
        this.ajoutEnCours = null;
        this.ajoutOk = produit.id!;
        setTimeout(() => { if (this.ajoutOk === produit.id) this.ajoutOk = null; }, 2000);
      },
      error: (err) => {
        this.ajoutEnCours = null;
        this.ajoutErreur = err.error?.message || this.t.tr('panier.ajouterErreur');
        setTimeout(() => this.ajoutErreur = '', 5000);
      }
    });
  }
}
