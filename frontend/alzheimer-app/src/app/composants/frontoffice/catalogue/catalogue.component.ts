import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProduitService } from '../../../services/produit.service';
import { CategorieService } from '../../../services/categorie.service';
import { PanierService } from '../../../services/panier.service';
import { Produit } from '../../../modeles/produit.model';
import { Categorie } from '../../../modeles/categorie.model';
import { TraductionService } from '../../../services/traduction.service';
import { ScrollAnimateDirective } from '../../../directives/scroll-animate.directive';
import { TiltDirective } from '../../../directives/tilt.directive';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { PromoCountdownComponent } from '../../shared/promo-countdown/promo-countdown.component';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ScrollAnimateDirective, TiltDirective, SkeletonLoaderComponent, PromoCountdownComponent],
  animations: [
    trigger('quickViewAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }),
        animate('300ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ],
  template: `
    <div class="fo-section">
      <div class="fo-section-container">
        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/"><i class="bi bi-house-door"></i></a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <span class="fo-breadcrumb-current">{{ t.tr('catalogue.titre') }}</span>
        </div>

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
            <option value="en-promo">{{ t.tr('catalogue.filtrePromo') }}</option>
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
            <!-- View toggle: Grid / List -->
            <div class="fo-view-toggle-group">
              <span class="fo-vt-label-prefix">{{ t.isFr ? 'Affichage' : 'View' }}</span>
              <button class="fo-vt-btn" [class.fo-vt-active]="viewMode === 'grid'" (click)="setView('grid')">
                <i class="bi bi-grid-3x3-gap-fill"></i>
                <span>{{ t.isFr ? 'Grille' : 'Grid' }}</span>
              </button>
              <button class="fo-vt-btn" [class.fo-vt-active]="viewMode === 'list'" (click)="setView('list')">
                <i class="bi bi-list-ul"></i>
                <span>{{ t.isFr ? 'Liste' : 'List' }}</span>
              </button>
            </div>
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

        <!-- Skeleton Loading -->
        <app-skeleton-loader *ngIf="loading" type="product-grid" [count]="6"></app-skeleton-loader>

        <!-- ═══ GRID VIEW ═══════════════════════════════════════════ -->
        <div class="fo-product-grid" *ngIf="!loading && pagedProducts.length > 0 && viewMode === 'grid'">
          <div *ngFor="let prod of pagedProducts; let i = index" class="fo-product-card"
               appScrollAnimate="fade-up" [animateDelay]="i * 80" appTilt [tiltMax]="6">
            <a [routerLink]="['/catalogue', prod.id]" style="text-decoration: none; color: inherit;">
              <div class="fo-product-card-img">
                <span *ngIf="prod.enPromo && prod.remise" class="fo-product-badge fo-badge-promo">-{{ prod.remise }}%</span>
                <button class="fo-product-wishlist" (click)="$event.preventDefault(); $event.stopPropagation()">
                  <i class="bi bi-heart"></i>
                </button>
                <button class="fo-product-quickview" (click)="openQuickView($event, prod)">
                  <i class="bi bi-eye me-1"></i>{{ t.tr('catalogue.quickView') }}
                </button>
                <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" style="width: 100%; height: 100%; object-fit: cover;">
                <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
              </div>
              <div class="fo-product-card-body">
                <span class="fo-product-brand">{{ prod.categorieNom }}</span>
                <h4>{{ prod.nom }}</h4>
                <p>{{ prod.description | slice:0:80 }}{{ prod.description && prod.description.length > 80 ? '...' : '' }}</p>
                <div class="fo-product-card-footer">
                  <div *ngIf="prod.enPromo && prod.prixOriginal" class="fo-price-block">
                    <span class="fo-price-original">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                    <span class="fo-price-promo">{{ prod.prix | number:'1.2-2' }} TND</span>
                  </div>
                  <span *ngIf="!prod.enPromo || !prod.prixOriginal" class="fo-product-price">{{ prod.prix | number:'1.2-2' }} TND</span>
                  <span class="fo-product-stock"
                        [class.in-stock]="prod.quantite > 0"
                        [class.out-of-stock]="prod.quantite === 0">
                    {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                  </span>
                </div>
                <app-promo-countdown
                  *ngIf="prod.enPromo && prod.dateFinPromo"
                  [dateFinPromo]="prod.dateFinPromo"
                  size="card"
                  [isFr]="t.isFr">
                </app-promo-countdown>
              </div>
            </a>
            <div class="fo-product-card-body" style="padding-top: 0;">
              <button *ngIf="prod.quantite > 0"
                      class="fo-add-cart-btn"
                      [class.success]="ajoutOk === prod.id"
                      (click)="ajouterAuPanier($event, prod)"
                      [disabled]="ajoutEnCours === prod.id">
                <span *ngIf="ajoutEnCours === prod.id" class="spinner-border spinner-border-sm me-1"></span>
                <i *ngIf="ajoutEnCours !== prod.id && ajoutOk !== prod.id" class="bi bi-cart-plus me-1"></i>
                <i *ngIf="ajoutOk === prod.id" class="bi bi-check-lg me-1"></i>
                {{ ajoutOk === prod.id ? t.tr('panier.ajouterSuccess') : t.tr('catalogue.ajouterPanier') }}
              </button>
              <span *ngIf="prod.quantite === 0" class="fo-product-stock out-of-stock mt-2" style="display: block; text-align: center;">
                <i class="bi bi-x-circle me-1"></i>{{ t.tr('common.rupture') }}
              </span>
            </div>
          </div>
        </div>

        <!-- ═══ LIST VIEW ════════════════════════════════════════════ -->
        <div class="fo-product-list" *ngIf="!loading && pagedProducts.length > 0 && viewMode === 'list'">
          <div *ngFor="let prod of pagedProducts; let i = index"
               class="fo-list-card"
               [style.animation-delay]="i * 55 + 'ms'">

            <!-- Left: Image -->
            <a [routerLink]="['/catalogue', prod.id]" class="fo-list-card-img-wrap">
              <div class="fo-list-card-img">
                <span *ngIf="prod.enPromo && prod.remise" class="fo-product-badge fo-badge-promo">-{{ prod.remise }}%</span>
                <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom">
                <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
              </div>
            </a>

            <!-- Right: Content -->
            <div class="fo-list-card-body">

              <!-- Top row: brand + stock -->
              <div class="fo-list-card-top">
                <span class="fo-product-brand">{{ prod.categorieNom }}</span>
                <span class="fo-product-stock"
                      [class.in-stock]="prod.quantite > 0"
                      [class.out-of-stock]="prod.quantite === 0">
                  <i class="bi" [class.bi-check-circle-fill]="prod.quantite > 0"
                               [class.bi-x-circle-fill]="prod.quantite === 0"></i>
                  {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                </span>
              </div>

              <!-- Title -->
              <a [routerLink]="['/catalogue', prod.id]" class="fo-list-card-title-link">
                <h3>{{ prod.nom }}</h3>
              </a>

              <!-- Full description -->
              <p class="fo-list-card-desc">{{ prod.description }}</p>

              <!-- Price block -->
              <div class="fo-list-card-price">
                <div *ngIf="prod.enPromo && prod.prixOriginal" class="fo-price-block">
                  <span class="fo-price-original">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                  <span class="fo-price-promo" style="font-size: 1.25rem;">{{ prod.prix | number:'1.2-2' }} TND</span>
                </div>
                <span *ngIf="!prod.enPromo || !prod.prixOriginal" class="fo-list-card-price-value">
                  {{ prod.prix | number:'1.2-2' }} TND
                </span>
                <span *ngIf="prod.enPromo && prod.remise && prod.prixOriginal" class="fo-list-savings-badge">
                  <i class="bi bi-piggy-bank-fill"></i>
                  {{ t.tr('promo.economie') }} {{ (prod.prixOriginal - prod.prix) | number:'1.2-2' }} TND
                </span>
              </div>

              <!-- Countdown -->
              <app-promo-countdown
                *ngIf="prod.enPromo && prod.dateFinPromo"
                [dateFinPromo]="prod.dateFinPromo"
                size="card"
                [isFr]="t.isFr">
              </app-promo-countdown>

              <!-- Action buttons -->
              <div class="fo-list-card-actions">
                <button *ngIf="prod.quantite > 0"
                        class="fo-add-cart-btn"
                        [class.success]="ajoutOk === prod.id"
                        (click)="ajouterAuPanier($event, prod)"
                        [disabled]="ajoutEnCours === prod.id">
                  <span *ngIf="ajoutEnCours === prod.id" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="ajoutEnCours !== prod.id && ajoutOk !== prod.id" class="bi bi-cart-plus me-1"></i>
                  <i *ngIf="ajoutOk === prod.id" class="bi bi-check-lg me-1"></i>
                  {{ ajoutOk === prod.id ? t.tr('panier.ajouterSuccess') : t.tr('catalogue.ajouterPanier') }}
                </button>
                <a [routerLink]="['/catalogue', prod.id]" class="fo-list-card-detail-btn">
                  <i class="bi bi-eye me-1"></i>{{ t.tr('catalogue.voirDetail') }}
                </a>
                <button class="fo-list-card-qv-btn" (click)="openQuickView($event, prod)">
                  <i class="bi bi-zoom-in me-1"></i>{{ t.tr('catalogue.quickView') }}
                </button>
              </div>
            </div>
          </div>
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
      </div>
    </div>

    <!-- Quick View Modal -->
    <div *ngIf="quickViewProduct" class="fo-quickview-overlay" (click)="closeQuickView()" [@quickViewAnim]>
      <div class="fo-quickview-modal" (click)="$event.stopPropagation()">
        <button class="fo-quickview-close" (click)="closeQuickView()"><i class="bi bi-x-lg"></i></button>
        <div class="fo-quickview-img">
          <img *ngIf="quickViewProduct.imageUrl" [src]="quickViewProduct.imageUrl" [alt]="quickViewProduct.nom">
          <i *ngIf="!quickViewProduct.imageUrl" class="bi bi-box-seam"></i>
        </div>
        <div class="fo-quickview-body">
          <span class="fo-product-brand">{{ quickViewProduct.categorieNom }}</span>
          <h2>{{ quickViewProduct.nom }}
            <span *ngIf="quickViewProduct.enPromo && quickViewProduct.remise" class="fo-detail-promo-badge">-{{ quickViewProduct.remise }}%</span>
          </h2>
          <p class="fo-quickview-desc">{{ quickViewProduct.description }}</p>
          <div *ngIf="quickViewProduct.enPromo && quickViewProduct.prixOriginal" class="fo-price-block">
            <span class="fo-price-original">{{ quickViewProduct.prixOriginal | number:'1.2-2' }} TND</span>
            <span class="fo-price-promo">{{ quickViewProduct.prix | number:'1.2-2' }} TND</span>
          </div>
          <span *ngIf="!quickViewProduct.enPromo || !quickViewProduct.prixOriginal" class="fo-product-price">{{ quickViewProduct.prix | number:'1.2-2' }} TND</span>
          <app-promo-countdown
            *ngIf="quickViewProduct.enPromo && quickViewProduct.dateFinPromo"
            [dateFinPromo]="quickViewProduct.dateFinPromo"
            size="card"
            [isFr]="t.isFr">
          </app-promo-countdown>
          <span class="fo-product-stock"
                [class.in-stock]="quickViewProduct.quantite > 0"
                [class.out-of-stock]="quickViewProduct.quantite === 0">
            <i class="bi" [class.bi-check-circle-fill]="quickViewProduct.quantite > 0"
               [class.bi-x-circle-fill]="quickViewProduct.quantite === 0"></i>
            {{ quickViewProduct.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
          </span>
          <div class="fo-quickview-actions">
            <button *ngIf="quickViewProduct.quantite > 0"
                    class="fo-add-cart-btn"
                    (click)="quickViewAjouterPanier()"
                    [disabled]="ajoutEnCours === quickViewProduct.id">
              <span *ngIf="ajoutEnCours === quickViewProduct.id" class="spinner-border spinner-border-sm me-1"></span>
              <i *ngIf="ajoutEnCours !== quickViewProduct.id" class="bi bi-cart-plus me-1"></i>
              {{ t.tr('catalogue.ajouterPanier') }}
            </button>
            <a [routerLink]="['/catalogue', quickViewProduct.id]" class="fo-quickview-detail-link" (click)="closeQuickView()">
              {{ t.tr('catalogue.voirDetail') }} <i class="bi bi-arrow-right ms-1"></i>
            </a>
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

  // View mode: grid | list
  viewMode: 'grid' | 'list' = 'grid';

  // Quick View
  quickViewProduct: Produit | null = null;

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private panierService: PanierService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('catalogue-view-mode');
    if (saved === 'list' || saved === 'grid') this.viewMode = saved;

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

  setView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    localStorage.setItem('catalogue-view-mode', mode);
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
      else if (this.selectedStock === 'en-promo') matchStock = !!p.enPromo;
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
      'en-stock': this.t.tr('catalogue.disponible'),
      'en-promo': this.t.tr('catalogue.filtrePromo')
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

  // Quick View
  openQuickView(event: Event, prod: Produit): void {
    event.preventDefault();
    event.stopPropagation();
    this.quickViewProduct = prod;
  }

  closeQuickView(): void {
    this.quickViewProduct = null;
  }

  quickViewAjouterPanier(): void {
    if (!this.quickViewProduct?.id || this.ajoutEnCours) return;
    this.ajoutEnCours = this.quickViewProduct.id;
    this.panierService.ajouterProduit(this.quickViewProduct.id, 1).subscribe({
      next: () => {
        this.ajoutEnCours = null;
        this.closeQuickView();
      },
      error: (err) => {
        this.ajoutEnCours = null;
        this.ajoutErreur = err.error?.message || this.t.tr('panier.ajouterErreur');
        setTimeout(() => this.ajoutErreur = '', 5000);
      }
    });
  }
}
