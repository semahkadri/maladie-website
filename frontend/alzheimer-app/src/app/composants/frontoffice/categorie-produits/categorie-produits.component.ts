import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { CategorieService } from '../../../services/categorie.service';
import { ProduitService } from '../../../services/produit.service';
import { PanierService } from '../../../services/panier.service';
import { WishlistService } from '../../../services/wishlist.service';
import { CompareService } from '../../../services/compare.service';
import { Categorie } from '../../../modeles/categorie.model';
import { Produit, isPromoActive } from '../../../modeles/produit.model';
import { TraductionService } from '../../../services/traduction.service';
import { ScrollAnimateDirective } from '../../../directives/scroll-animate.directive';
import { TiltDirective } from '../../../directives/tilt.directive';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { PromoCountdownComponent } from '../../shared/promo-countdown/promo-countdown.component';

@Component({
  selector: 'app-categorie-produits',
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
    <!-- Skeleton -->
    <div class="fo-section" *ngIf="loading">
      <div class="fo-section-container">
        <app-skeleton-loader type="product-grid" [count]="6"></app-skeleton-loader>
      </div>
    </div>

    <div class="fo-section" *ngIf="!loading">
      <div class="fo-section-container">

        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/"><i class="bi bi-house-door"></i></a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <a routerLink="/catalogue">{{ t.tr('nav.catalogue') }}</a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <span class="fo-breadcrumb-current">{{ categorie?.nom }}</span>
        </div>

        <!-- Category Header -->
        <div class="fo-category-header" *ngIf="categorie" appScrollAnimate="fade-up">
          <div class="fo-category-header-icon">
            <i class="bi bi-tag-fill"></i>
          </div>
          <div>
            <h1>{{ categorie.nom }}</h1>
            <p>{{ categorie.description }}</p>
          </div>
        </div>

        <!-- Filters Row -->
        <div class="fo-filter-bar">
          <div class="fo-search-box">
            <i class="bi bi-search"></i>
            <input type="text" [placeholder]="t.tr('catProd.rechercherDans')"
                   [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()">
            <button *ngIf="searchTerm" class="fo-search-box-clear" (click)="searchTerm=''; applyFilters()">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <select class="fo-filter-select fo-filter-stock" [(ngModel)]="selectedStock" (ngModelChange)="applyFilters()">
            <option value="tous">{{ t.tr('catalogue.toutStock') }}</option>
            <option value="en-stock">{{ t.tr('catalogue.disponible') }}</option>
            <option value="en-promo">{{ t.tr('catalogue.filtrePromo') }}</option>
          </select>
          <div class="fo-sort-control">
            <i class="bi bi-sort-down fo-sort-ico"></i>
            <select [(ngModel)]="sortBy" (ngModelChange)="applySort()">
              <option value="nom-asc">{{ t.tr('catalogue.nomAZ') }}</option>
              <option value="nom-desc">{{ t.tr('catalogue.nomZA') }}</option>
              <option value="prix-asc">{{ t.tr('catalogue.prixAsc') }}</option>
              <option value="prix-desc">{{ t.tr('catalogue.prixDesc') }}</option>
              <option value="date-desc">{{ t.tr('catalogue.dateDesc') }}</option>
            </select>
          </div>
          <a routerLink="/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-grid-3x3-gap me-1"></i>{{ t.tr('catalogue.toutParcourir') }}
          </a>
        </div>

        <!-- Active filter chips -->
        <div class="fo-filter-chips" *ngIf="hasActiveFilters()">
          <span class="fo-chip" *ngIf="searchTerm">
            <i class="bi bi-search me-1"></i>{{ searchTerm }}
            <button (click)="searchTerm = ''; applyFilters()"><i class="bi bi-x"></i></button>
          </span>
          <span class="fo-chip" *ngIf="selectedStock !== 'tous'">
            <i class="bi bi-funnel me-1"></i>{{ getStockLabel(selectedStock) }}
            <button (click)="selectedStock = 'tous'; applyFilters()"><i class="bi bi-x"></i></button>
          </span>
          <button class="fo-chip fo-chip-clear" (click)="resetFilters()">
            <i class="bi bi-arrow-counterclockwise me-1"></i>{{ t.tr('catalogue.toutEffacer') }}
          </button>
        </div>

        <!-- Product Grid -->
        <div class="fo-product-grid" *ngIf="pagedProducts.length > 0">
          <div *ngFor="let prod of pagedProducts; let i = index" class="fo-product-card"
               appScrollAnimate="fade-up" [animateDelay]="i * 60" appTilt [tiltMax]="6">

            <a [routerLink]="['/catalogue', prod.id]" class="fo-card-link">
              <div class="fo-product-card-img">
                <span *ngIf="isPromoActive(prod) && prod.remise" class="fo-product-badge fo-badge-promo">-{{ prod.remise }}%</span>
                <span *ngIf="!isPromoActive(prod) && isNouveauProduit(prod)" class="fo-product-badge fo-badge-new">{{ t.tr('badge.nouveau') }}</span>
                <button class="fo-product-wishlist" [class.wl-active]="wishlistService.isInWishlist(prod.id!)"
                        (click)="$event.preventDefault();$event.stopPropagation();wishlistService.toggle(prod)"
                        [title]="wishlistService.isInWishlist(prod.id!) ? (t.isFr ? 'Retirer' : 'Remove') : (t.isFr ? 'Sauvegarder' : 'Save')">
                  <i class="bi" [class.bi-heart-fill]="wishlistService.isInWishlist(prod.id!)" [class.bi-heart]="!wishlistService.isInWishlist(prod.id!)"></i>
                </button>
                <button class="fo-product-compare"
                        [class.fo-compare-active]="compareService.isInCompare(prod.id!)"
                        (click)="$event.preventDefault();$event.stopPropagation();compareService.toggle(prod)"
                        [title]="compareService.isInCompare(prod.id!) ? (t.isFr ? 'Retirer de la comparaison' : 'Remove from comparison') : (t.isFr ? 'Comparer' : 'Compare')">
                  <i class="bi" [class.bi-bar-chart-steps]="!compareService.isInCompare(prod.id!)" [class.bi-bar-chart-fill]="compareService.isInCompare(prod.id!)"></i>
                </button>
                <button class="fo-product-quickview" (click)="openQuickView($event, prod)">
                  <i class="bi bi-eye me-1"></i>{{ t.tr('catalogue.quickView') }}
                </button>
                <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" style="width:100%;height:100%;object-fit:cover;">
                <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
              </div>
              <div class="fo-product-card-body">
                <span class="fo-product-brand">{{ prod.categorieNom }}</span>
                <h4>{{ prod.nom }}</h4>
                <p>{{ prod.description | slice:0:60 }}{{ prod.description && prod.description.length > 60 ? '...' : '' }}</p>
              </div>
            </a>

            <div class="fo-card-bottom">
              <div class="fo-card-price-row">
                <div *ngIf="isPromoActive(prod) && prod.prixOriginal" class="fo-price-block">
                  <span class="fo-price-original">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                  <span class="fo-price-promo">{{ prod.prix | number:'1.2-2' }} TND</span>
                </div>
                <span *ngIf="!isPromoActive(prod) || !prod.prixOriginal" class="fo-product-price">{{ prod.prix | number:'1.2-2' }} TND</span>
                <span class="fo-product-stock" [class.in-stock]="prod.quantite > 0" [class.out-of-stock]="prod.quantite === 0">
                  {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                </span>
              </div>
              <div class="fo-card-countdown-slot">
                <app-promo-countdown *ngIf="isPromoActive(prod) && prod.dateFinPromo"
                  [dateFinPromo]="prod.dateFinPromo" size="card" [isFr]="t.isFr">
                </app-promo-countdown>
              </div>
              <button *ngIf="prod.quantite > 0" class="fo-add-cart-btn"
                      [class.success]="ajoutOk === prod.id"
                      (click)="ajouterAuPanier($event, prod)"
                      [disabled]="ajoutEnCours === prod.id">
                <span *ngIf="ajoutEnCours === prod.id" class="spinner-border spinner-border-sm me-1"></span>
                <i *ngIf="ajoutEnCours !== prod.id && ajoutOk !== prod.id" class="bi bi-cart-plus me-1"></i>
                <i *ngIf="ajoutOk === prod.id" class="bi bi-check-lg me-1"></i>
                {{ ajoutOk === prod.id ? t.tr('panier.ajouterSuccess') : t.tr('catalogue.ajouterPanier') }}
              </button>
              <button *ngIf="prod.quantite === 0" class="fo-add-cart-btn fo-btn-rupture" disabled>
                <i class="bi bi-x-circle me-1"></i>{{ t.tr('common.rupture') }}
              </button>
            </div>

          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="filteredProducts.length === 0" class="cat-empty">
          <div class="cat-empty-icon-wrap">
            <div class="cat-empty-ring cat-empty-ring-1"></div>
            <div class="cat-empty-ring cat-empty-ring-2"></div>
            <div class="cat-empty-icon-circle">
              <i class="bi" [class.bi-funnel]="hasActiveFilters()" [class.bi-inbox]="!hasActiveFilters()"></i>
            </div>
          </div>
          <h3 class="cat-empty-title">{{ t.tr('catalogue.aucunProduit') }}</h3>
          <p class="cat-empty-desc">{{ hasActiveFilters() ? t.tr('catalogue.aucunProduitDesc') : t.tr('catProd.aucunProduit') }}</p>
          <button *ngIf="hasActiveFilters()" class="cat-empty-reset" (click)="resetFilters()">
            <i class="bi bi-arrow-counterclockwise"></i>{{ t.tr('catalogue.reinitialiser') }}
          </button>
          <a *ngIf="!hasActiveFilters()" routerLink="/catalogue" class="cat-empty-reset">
            <i class="bi bi-grid-3x3-gap"></i>{{ t.tr('catProd.parcourirCatalogue') }}
          </a>
        </div>

        <!-- Pagination -->
        <div class="fo-pagination" *ngIf="totalPages > 1">
          <div class="fo-pagination-info">
            {{ t.tr('catalogue.affichage') }} {{ startIndex + 1 }}–{{ endIndex }} {{ t.tr('catalogue.sur') }} {{ filteredProducts.length }}
          </div>
          <div class="fo-pagination-controls">
            <button (click)="goToPage(1)" [disabled]="page === 1"><i class="bi bi-chevron-double-left"></i></button>
            <button (click)="goToPage(page - 1)" [disabled]="page === 1"><i class="bi bi-chevron-left"></i></button>
            <button *ngFor="let p of visiblePages" (click)="goToPage(p)" [class.active]="p === page">{{ p }}</button>
            <button (click)="goToPage(page + 1)" [disabled]="page === totalPages"><i class="bi bi-chevron-right"></i></button>
            <button (click)="goToPage(totalPages)" [disabled]="page === totalPages"><i class="bi bi-chevron-double-right"></i></button>
          </div>
          <div class="fo-pagination-size">
            <select [(ngModel)]="perPage" (ngModelChange)="onPerPageChange()">
              <option [ngValue]="6">6</option>
              <option [ngValue]="12">12</option>
              <option [ngValue]="24">24</option>
              <option [ngValue]="48">48</option>
            </select>
          </div>
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
            <span *ngIf="isPromoActive(quickViewProduct) && quickViewProduct.remise" class="fo-detail-promo-badge">-{{ quickViewProduct.remise }}%</span>
          </h2>
          <p class="fo-quickview-desc">{{ quickViewProduct.description }}</p>
          <div *ngIf="isPromoActive(quickViewProduct) && quickViewProduct.prixOriginal" class="fo-price-block">
            <span class="fo-price-original">{{ quickViewProduct.prixOriginal | number:'1.2-2' }} TND</span>
            <span class="fo-price-promo">{{ quickViewProduct.prix | number:'1.2-2' }} TND</span>
          </div>
          <span *ngIf="!isPromoActive(quickViewProduct) || !quickViewProduct.prixOriginal" class="fo-product-price">{{ quickViewProduct.prix | number:'1.2-2' }} TND</span>
          <app-promo-countdown *ngIf="isPromoActive(quickViewProduct) && quickViewProduct.dateFinPromo"
            [dateFinPromo]="quickViewProduct.dateFinPromo" size="card" [isFr]="t.isFr">
          </app-promo-countdown>
          <span class="fo-product-stock"
                [class.in-stock]="quickViewProduct.quantite > 0"
                [class.out-of-stock]="quickViewProduct.quantite === 0">
            <i class="bi" [class.bi-check-circle-fill]="quickViewProduct.quantite > 0"
               [class.bi-x-circle-fill]="quickViewProduct.quantite === 0"></i>
            {{ quickViewProduct.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
          </span>
          <div class="fo-quickview-actions">
            <button *ngIf="quickViewProduct.quantite > 0" class="fo-add-cart-btn"
                    (click)="quickViewAjouterPanier()" [disabled]="ajoutEnCours === quickViewProduct.id">
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
export class CategorieProduitsComponent implements OnInit, OnDestroy {
  readonly isPromoActive = isPromoActive;

  categorie: Categorie | null = null;
  products: Produit[] = [];
  filteredProducts: Produit[] = [];
  pagedProducts: Produit[] = [];

  searchTerm = '';
  selectedStock = 'tous';
  sortBy = 'nom-asc';

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

  quickViewProduct: Produit | null = null;
  private routeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private categorieService: CategorieService,
    private produitService: ProduitService,
    private panierService: PanierService,
    public wishlistService: WishlistService,
    public compareService: CompareService,
    public t: TraductionService
  ) {}

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loading = true;
      this.searchTerm = '';
      this.selectedStock = 'tous';
      this.categorieService.obtenirParId(id).subscribe({ next: (cat) => this.categorie = cat });
      this.produitService.listerParCategorie(id).subscribe({
        next: (prods) => { this.products = prods; this.applyFilters(); this.loading = false; },
        error: () => this.loading = false
      });
    });
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      let matchStock = true;
      if (this.selectedStock === 'en-stock') matchStock = p.quantite > 0;
      else if (this.selectedStock === 'en-promo') matchStock = isPromoActive(p);
      return matchSearch && matchStock;
    });
    this.applySort();
  }

  applySort(): void {
    const [field, direction] = this.sortBy.split('-');
    this.filteredProducts.sort((a, b) => {
      let cmp = 0;
      if (field === 'nom') cmp = a.nom.localeCompare(b.nom, 'fr');
      else if (field === 'prix') cmp = a.prix - b.prix;
      else if (field === 'date') cmp = (a.dateCreation || '').localeCompare(b.dateCreation || '');
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
    if (end > this.totalPages) { end = this.totalPages; start = Math.max(1, end - maxVisible + 1); }
    this.visiblePages = [];
    for (let i = start; i <= end; i++) this.visiblePages.push(i);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p; this.paginate();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPerPageChange(): void { this.page = 1; this.paginate(); }
  hasActiveFilters(): boolean { return !!this.searchTerm || this.selectedStock !== 'tous'; }

  resetFilters(): void {
    this.searchTerm = ''; this.selectedStock = 'tous'; this.sortBy = 'nom-asc'; this.applyFilters();
  }

  getStockLabel(value: string): string {
    const labels: Record<string, string> = {
      'en-stock': this.t.tr('catalogue.disponible'),
      'en-promo': this.t.tr('catalogue.filtrePromo')
    };
    return labels[value] || value;
  }

  isNouveauProduit(prod: Produit): boolean {
    if (!prod.dateCreation) return false;
    return Date.now() - new Date(prod.dateCreation).getTime() <= 30 * 24 * 60 * 60 * 1000;
  }

  ajouterAuPanier(event: Event, produit: Produit): void {
    event.preventDefault(); event.stopPropagation();
    if (!produit.id || this.ajoutEnCours === produit.id) return;
    this.ajoutEnCours = produit.id; this.ajoutOk = null;
    this.panierService.ajouterProduit(produit.id, 1).subscribe({
      next: () => {
        this.ajoutEnCours = null; this.ajoutOk = produit.id!;
        setTimeout(() => { if (this.ajoutOk === produit.id) this.ajoutOk = null; }, 2000);
      },
      error: (err) => { this.ajoutEnCours = null; this.ajoutErreur = err.error?.message || this.t.tr('panier.ajouterErreur'); setTimeout(() => this.ajoutErreur = '', 5000); }
    });
  }

  openQuickView(event: Event, prod: Produit): void { event.preventDefault(); event.stopPropagation(); this.quickViewProduct = prod; }
  closeQuickView(): void { this.quickViewProduct = null; }

  quickViewAjouterPanier(): void {
    if (!this.quickViewProduct?.id || this.ajoutEnCours === this.quickViewProduct.id) return;
    this.ajoutEnCours = this.quickViewProduct.id;
    this.panierService.ajouterProduit(this.quickViewProduct.id, 1).subscribe({
      next: () => { this.ajoutEnCours = null; this.closeQuickView(); },
      error: (err) => { this.ajoutEnCours = null; this.ajoutErreur = err.error?.message || this.t.tr('panier.ajouterErreur'); setTimeout(() => this.ajoutErreur = '', 5000); }
    });
  }
}
