import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProduitService } from '../../../services/produit.service';
import { CategorieService } from '../../../services/categorie.service';
import { PanierService } from '../../../services/panier.service';
import { Produit, isPromoActive } from '../../../modeles/produit.model';
import { Categorie } from '../../../modeles/categorie.model';
import { TraductionService } from '../../../services/traduction.service';
import { WishlistService } from '../../../services/wishlist.service';
import { CompareService } from '../../../services/compare.service';
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
    <div class="cat-page-wrap">

        <!-- Breadcrumb -->
        <div class="fo-breadcrumb" style="margin-bottom:12px;">
          <a routerLink="/"><i class="bi bi-house-door"></i></a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <span class="fo-breadcrumb-current">{{ t.tr('catalogue.titre') }}</span>
        </div>

        <!-- ═══ SIDEBAR + CONTENT LAYOUT ═══ -->
        <div class="cat-layout">

          <!-- ─── LEFT SIDEBAR ─────────────────────────────────── -->
          <aside class="cat-sidebar">

            <!-- Sidebar header -->
            <div class="cat-sidebar-head">
              <span class="cat-sidebar-title">
                <i class="bi bi-funnel-fill"></i>
                {{ t.isFr ? 'Filtres' : 'Filters' }}
              </span>
              <button *ngIf="hasActiveFilters()" class="cat-sidebar-reset" (click)="resetFilters()">
                {{ t.isFr ? 'Tout effacer' : 'Clear all' }}
              </button>
            </div>

            <!-- Search -->
            <div class="cat-filter-block">
              <button class="cat-filter-toggle" (click)="toggleSection('search')">
                <span><i class="bi bi-search"></i>{{ t.isFr ? 'Recherche' : 'Search' }}</span>
                <i class="bi cat-chevron" [class.bi-chevron-up]="sectionOpen['search']" [class.bi-chevron-down]="!sectionOpen['search']"></i>
              </button>
              <div class="cat-filter-body" [class.cat-filter-body-open]="sectionOpen['search']">
                <div class="cat-filter-body-inner">
                  <div class="cat-search-wrap">
                    <input type="text" [placeholder]="t.tr('catalogue.rechercher')"
                           [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" class="cat-search-input">
                    <button *ngIf="searchTerm" class="cat-search-clear" (click)="searchTerm=''; applyFilters()">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Categories -->
            <div class="cat-filter-block">
              <button class="cat-filter-toggle" (click)="toggleSection('categories')">
                <span>
                  <i class="bi bi-grid-1x2"></i>{{ t.isFr ? 'Catégories' : 'Categories' }}
                  <span *ngIf="selectedCategory" class="cat-filter-active-dot"></span>
                </span>
                <i class="bi cat-chevron" [class.bi-chevron-up]="sectionOpen['categories']" [class.bi-chevron-down]="!sectionOpen['categories']"></i>
              </button>
              <div class="cat-filter-body" [class.cat-filter-body-open]="sectionOpen['categories']">
                <div class="cat-filter-body-inner">
                  <div class="cat-cat-list">
                    <button class="cat-cat-item" [class.active]="selectedCategory === 0"
                            (click)="selectedCategory = 0; applyFilters()">
                      <i class="bi bi-collection"></i>
                      {{ t.tr('catalogue.toutesCat') }}
                      <span class="cat-cat-count">{{ products.length }}</span>
                    </button>
                    <button *ngFor="let cat of categories" class="cat-cat-item"
                            [class.active]="selectedCategory === cat.id"
                            (click)="selectedCategory = cat.id!; applyFilters()">
                      <i class="bi bi-tag"></i>
                      {{ cat.nom }}
                      <span class="cat-cat-count">{{ getCatCount(cat.id!) }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Price Range -->
            <div class="cat-filter-block" *ngIf="!loading && products.length > 0">
              <button class="cat-filter-toggle" (click)="toggleSection('price')">
                <span>
                  <i class="bi bi-cash-stack"></i>{{ t.isFr ? 'Prix' : 'Price' }}
                  <span *ngIf="isPriceFiltered" class="cat-filter-active-dot"></span>
                </span>
                <i class="bi cat-chevron" [class.bi-chevron-up]="sectionOpen['price']" [class.bi-chevron-down]="!sectionOpen['price']"></i>
              </button>
              <div class="cat-filter-body" [class.cat-filter-body-open]="sectionOpen['price']">
                <div class="cat-filter-body-inner">
                  <div class="cat-prs-live">
                    <span>{{ priceRangeMin | number:'1.0-0' }} TND</span>
                    <span class="cat-prs-live-sep">—</span>
                    <span>{{ priceRangeMax | number:'1.0-0' }} TND</span>
                    <button *ngIf="isPriceFiltered" class="cat-prs-clear"
                            (click)="priceRangeMin = absoluteMin; priceRangeMax = absoluteMax; applyFilters()">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                  <div class="cat-prs-wrap">
                    <div class="cat-prs-track-bg"></div>
                    <div class="cat-prs-track-fill" [style.left.%]="fillLeft" [style.right.%]="fillRight"></div>
                    <input type="range" class="cat-prs-thumb" [min]="absoluteMin" [max]="absoluteMax"
                           [(ngModel)]="priceRangeMin" (input)="onMinChange()">
                    <input type="range" class="cat-prs-thumb" [min]="absoluteMin" [max]="absoluteMax"
                           [(ngModel)]="priceRangeMax" (input)="onMaxChange()">
                  </div>
                  <div class="cat-prs-inputs">
                    <div class="cat-prs-input-wrap">
                      <span class="cat-prs-input-label">Min</span>
                      <input type="number" class="cat-prs-input" [min]="absoluteMin" [max]="priceRangeMax - 1"
                             [(ngModel)]="priceRangeMin" (change)="onMinChange()">
                      <span class="cat-prs-cur">TND</span>
                    </div>
                    <span class="cat-prs-between">—</span>
                    <div class="cat-prs-input-wrap">
                      <span class="cat-prs-input-label">Max</span>
                      <input type="number" class="cat-prs-input" [min]="priceRangeMin + 1" [max]="absoluteMax"
                             [(ngModel)]="priceRangeMax" (change)="onMaxChange()">
                      <span class="cat-prs-cur">TND</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Availability -->
            <div class="cat-filter-block">
              <button class="cat-filter-toggle" (click)="toggleSection('availability')">
                <span>
                  <i class="bi bi-box-seam"></i>{{ t.isFr ? 'Disponibilité' : 'Availability' }}
                  <span *ngIf="selectedStock !== 'tous'" class="cat-filter-active-dot"></span>
                </span>
                <i class="bi cat-chevron" [class.bi-chevron-up]="sectionOpen['availability']" [class.bi-chevron-down]="!sectionOpen['availability']"></i>
              </button>
              <div class="cat-filter-body" [class.cat-filter-body-open]="sectionOpen['availability']">
                <div class="cat-filter-body-inner">
                  <div class="cat-radio-list">
                    <label class="cat-radio-item" [class.active]="selectedStock === 'tous'">
                      <input type="radio" name="stock" value="tous" [(ngModel)]="selectedStock" (ngModelChange)="applyFilters()">
                      <span class="cat-radio-dot"></span>{{ t.tr('catalogue.toutStock') }}
                    </label>
                    <label class="cat-radio-item" [class.active]="selectedStock === 'en-stock'">
                      <input type="radio" name="stock" value="en-stock" [(ngModel)]="selectedStock" (ngModelChange)="applyFilters()">
                      <span class="cat-radio-dot"></span>
                      <i class="bi bi-check-circle-fill cat-icon-stock"></i>
                      {{ t.tr('catalogue.disponible') }}
                    </label>
                    <label class="cat-radio-item" [class.active]="selectedStock === 'en-promo'">
                      <input type="radio" name="stock" value="en-promo" [(ngModel)]="selectedStock" (ngModelChange)="applyFilters()">
                      <span class="cat-radio-dot"></span>
                      <i class="bi bi-tag-fill cat-icon-promo"></i>
                      {{ t.tr('catalogue.filtrePromo') }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </aside>

          <!-- ─── RIGHT CONTENT ─────────────────────────────────── -->
          <div class="cat-content">

            <!-- Page header -->
            <div class="cat-page-header">
              <div>
                <h1 class="cat-page-title">{{ t.tr('catalogue.titre') }}</h1>
                <p class="cat-page-sub">{{ t.tr('catalogue.sousTitre') }}</p>
              </div>
            </div>

            <!-- Toolbar -->
            <div class="cat-toolbar" *ngIf="!loading">
              <div class="cat-toolbar-right">
                <!-- View toggle -->
                <div class="fo-view-toggle-group">
                  <button class="fo-vt-btn" [class.fo-vt-active]="viewMode === 'grid'" (click)="setView('grid')" [title]="t.isFr ? 'Grille' : 'Grid'">
                    <i class="bi bi-grid-3x3-gap-fill"></i>
                  </button>
                  <button class="fo-vt-btn" [class.fo-vt-active]="viewMode === 'list'" (click)="setView('list')" [title]="t.isFr ? 'Liste' : 'List'">
                    <i class="bi bi-list-ul"></i>
                  </button>
                </div>
                <!-- Sort -->
                <div class="fo-sort-control">
                  <i class="bi bi-sort-down fo-sort-ico"></i>
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

            <!-- Active filter chips -->
            <div class="fo-filter-chips" *ngIf="hasActiveFilters()">
              <span class="fo-chip" *ngIf="searchTerm">
                <i class="bi bi-search me-1"></i>{{ searchTerm }}
                <button (click)="searchTerm = ''; applyFilters()"><i class="bi bi-x"></i></button>
              </span>
              <span class="fo-chip" *ngIf="selectedCategory">
                <i class="bi bi-tag me-1"></i>{{ getCategoryName(selectedCategory) }}
                <button (click)="selectedCategory = 0; applyFilters()"><i class="bi bi-x"></i></button>
              </span>
              <span class="fo-chip" *ngIf="selectedStock !== 'tous'">
                <i class="bi bi-funnel me-1"></i>{{ getStockLabel(selectedStock) }}
                <button (click)="selectedStock = 'tous'; applyFilters()"><i class="bi bi-x"></i></button>
              </span>
              <span class="fo-chip fo-chip-price" *ngIf="isPriceFiltered">
                <i class="bi bi-cash me-1"></i>{{ priceRangeMin | number:'1.0-0' }} — {{ priceRangeMax | number:'1.0-0' }} TND
                <button (click)="priceRangeMin = absoluteMin; priceRangeMax = absoluteMax; applyFilters()"><i class="bi bi-x"></i></button>
              </span>
              <button class="fo-chip fo-chip-clear" (click)="resetFilters()">
                <i class="bi bi-arrow-counterclockwise me-1"></i>{{ t.tr('catalogue.toutEffacer') }}
              </button>
            </div>

            <!-- Skeleton -->
            <app-skeleton-loader *ngIf="loading" type="product-grid" [count]="6"></app-skeleton-loader>

            <!-- Empty state -->
            <div *ngIf="!loading && filteredProducts.length === 0" class="cat-empty">
              <div class="cat-empty-icon-wrap">
                <div class="cat-empty-ring cat-empty-ring-1"></div>
                <div class="cat-empty-ring cat-empty-ring-2"></div>
                <div class="cat-empty-icon-circle">
                  <i class="bi bi-funnel"></i>
                </div>
              </div>
              <h3 class="cat-empty-title">{{ t.tr('catalogue.aucunProduit') }}</h3>
              <p class="cat-empty-desc">{{ t.tr('catalogue.aucunProduitDesc') }}</p>
              <button class="cat-empty-reset" (click)="resetFilters()">
                <i class="bi bi-arrow-counterclockwise"></i>
                {{ t.isFr ? 'Réinitialiser les filtres' : 'Reset filters' }}
              </button>
            </div>

            <!-- GRID VIEW -->
            <div class="fo-product-grid" *ngIf="!loading && pagedProducts.length > 0 && viewMode === 'grid'">
              <div *ngFor="let prod of pagedProducts; let i = index" class="fo-product-card"
                   appScrollAnimate="fade-up" [animateDelay]="i * 60" appTilt [tiltMax]="6">

                <!-- ① Clickable zone (image + info) -->
                <a [routerLink]="['/catalogue', prod.id]" class="fo-card-link">
                  <div class="fo-product-card-img">
                    <span *ngIf="isPromoActive(prod) && prod.remise" class="fo-product-badge fo-badge-promo">-{{ prod.remise }}%</span>
                    <span *ngIf="!isPromoActive(prod) && isNouveauProduit(prod)" class="fo-product-badge fo-badge-new">{{ t.tr('badge.nouveau') }}</span>
                    <button class="fo-product-wishlist" [class.wl-active]="wishlistService.isInWishlist(prod.id!)"
                            (click)="$event.preventDefault();$event.stopPropagation();wishlistService.toggle(prod)">
                      <i class="bi" [class.bi-heart-fill]="wishlistService.isInWishlist(prod.id!)" [class.bi-heart]="!wishlistService.isInWishlist(prod.id!)"></i>
                    </button>
                    <button class="fo-product-quickview" (click)="openQuickView($event, prod)">
                      <i class="bi bi-eye me-1"></i>{{ t.tr('catalogue.quickView') }}
                    </button>
                    <button class="fo-product-compare"
                            [class.fo-compare-active]="compareService.isInCompare(prod.id!)"
                            (click)="$event.preventDefault();$event.stopPropagation();toggleCompare(prod)"
                            [title]="compareService.isInCompare(prod.id!) ? (t.isFr ? 'Retirer de la comparaison' : 'Remove from comparison') : (t.isFr ? 'Ajouter à la comparaison' : 'Add to comparison')">
                      <i class="bi" [class.bi-bar-chart-steps]="!compareService.isInCompare(prod.id!)" [class.bi-bar-chart-fill]="compareService.isInCompare(prod.id!)"></i>
                    </button>
                    <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" style="width:100%;height:100%;object-fit:cover;">
                    <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
                  </div>
                  <div class="fo-product-card-body">
                    <span class="fo-product-brand">{{ prod.categorieNom }}</span>
                    <h4>{{ prod.nom }}</h4>
                    <p>{{ prod.description | slice:0:75 }}{{ prod.description && prod.description.length > 75 ? '...' : '' }}</p>
                  </div>
                </a>

                <!-- ② Static footer — identical height on every card -->
                <div class="fo-card-bottom">
                  <!-- Price row -->
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

                  <!-- Countdown slot — fixed height so promo/non-promo cards match -->
                  <div class="fo-card-countdown-slot">
                    <app-promo-countdown *ngIf="isPromoActive(prod) && prod.dateFinPromo"
                      [dateFinPromo]="prod.dateFinPromo" size="card" [isFr]="t.isFr">
                    </app-promo-countdown>
                  </div>

                  <!-- Action button — always same height -->
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
                  <button *ngIf="prod.quantite === 0" class="fo-add-cart-btn fo-btn-rupture" disabled>
                    <i class="bi bi-x-circle me-1"></i>{{ t.tr('common.rupture') }}
                  </button>
                </div>

              </div>
            </div>

            <!-- LIST VIEW -->
            <div class="fo-product-list" *ngIf="!loading && pagedProducts.length > 0 && viewMode === 'list'">
              <div *ngFor="let prod of pagedProducts; let i = index" class="fo-list-card"
                   [style.animation-delay]="i * 55 + 'ms'">
                <a [routerLink]="['/catalogue', prod.id]" class="fo-list-card-img-wrap">
                  <div class="fo-list-card-img">
                    <span *ngIf="isPromoActive(prod) && prod.remise" class="fo-product-badge fo-badge-promo">-{{ prod.remise }}%</span>
                    <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom">
                    <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
                  </div>
                </a>
                <div class="fo-list-card-body">
                  <div class="fo-list-card-top">
                    <span class="fo-product-brand">{{ prod.categorieNom }}</span>
                    <span class="fo-product-stock" [class.in-stock]="prod.quantite > 0" [class.out-of-stock]="prod.quantite === 0">
                      <i class="bi" [class.bi-check-circle-fill]="prod.quantite > 0" [class.bi-x-circle-fill]="prod.quantite === 0"></i>
                      {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                    </span>
                  </div>
                  <a [routerLink]="['/catalogue', prod.id]" class="fo-list-card-title-link"><h3>{{ prod.nom }}</h3></a>
                  <p class="fo-list-card-desc">{{ prod.description }}</p>
                  <div class="fo-list-card-price">
                    <div *ngIf="isPromoActive(prod) && prod.prixOriginal" class="fo-price-block">
                      <span class="fo-price-original">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                      <span class="fo-price-promo" style="font-size:1.25rem;">{{ prod.prix | number:'1.2-2' }} TND</span>
                    </div>
                    <span *ngIf="!isPromoActive(prod) || !prod.prixOriginal" class="fo-list-card-price-value">{{ prod.prix | number:'1.2-2' }} TND</span>
                  </div>
                  <app-promo-countdown *ngIf="isPromoActive(prod) && prod.dateFinPromo"
                    [dateFinPromo]="prod.dateFinPromo" size="card" [isFr]="t.isFr">
                  </app-promo-countdown>
                  <div class="fo-list-card-actions">
                    <button *ngIf="prod.quantite > 0" class="fo-add-cart-btn"
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
                <button (click)="goToPage(1)" [disabled]="page === 1"><i class="bi bi-chevron-double-left"></i></button>
                <button (click)="goToPage(page - 1)" [disabled]="page === 1"><i class="bi bi-chevron-left"></i></button>
                <button *ngFor="let p of visiblePages" (click)="goToPage(p)" [class.active]="p === page">{{ p }}</button>
                <button (click)="goToPage(page + 1)" [disabled]="page === totalPages"><i class="bi bi-chevron-right"></i></button>
                <button (click)="goToPage(totalPages)" [disabled]="page === totalPages"><i class="bi bi-chevron-double-right"></i></button>
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

            <!-- Compare Toast -->
            <div *ngIf="compareToast" class="fo-toast fo-toast-compare fade-in">
              <i class="bi bi-bar-chart-steps me-2"></i>{{ compareToast }}
            </div>

            <!-- Toast -->
            <div *ngIf="ajoutErreur" class="fo-toast fo-toast-error fade-in">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ ajoutErreur }}
              <button (click)="ajoutErreur = ''" style="background:none;border:none;color:inherit;margin-left:12px;cursor:pointer;font-size:1.1rem;"><i class="bi bi-x-lg"></i></button>
            </div>

          </div><!-- /cat-content -->
        </div><!-- /cat-layout -->

    </div><!-- /cat-page-wrap -->

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
          <app-promo-countdown
            *ngIf="isPromoActive(quickViewProduct) && quickViewProduct.dateFinPromo"
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
export class CatalogueComponent implements OnInit, OnDestroy {
  readonly isPromoActive = isPromoActive;

  // Data
  products: Produit[] = [];
  filteredProducts: Produit[] = [];
  pagedProducts: Produit[] = [];
  categories: Categorie[] = [];
  private paramSub!: Subscription;

  // Filters
  searchTerm = '';
  selectedCategory = 0;
  selectedStock = 'tous';

  // Price range filter
  absoluteMin = 0;
  absoluteMax = 1000;
  priceRangeMin = 0;
  priceRangeMax = 1000;

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

  // Sidebar collapsible sections
  sectionOpen: Record<string, boolean> = { search: true, categories: true, price: true, availability: true };
  toggleSection(key: string): void { this.sectionOpen[key] = !this.sectionOpen[key]; }

  // Quick View
  quickViewProduct: Produit | null = null;

  compareToast = '';
  private compareToastTimer: any;

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private panierService: PanierService,
    private route: ActivatedRoute,
    public t: TraductionService,
    public wishlistService: WishlistService,
    public compareService: CompareService
  ) {}

  toggleCompare(prod: Produit): void {
    const result = this.compareService.toggle(prod);
    clearTimeout(this.compareToastTimer);
    if (result === 'full') {
      this.compareToast = this.t.isFr ? 'Maximum 4 produits en comparaison' : 'Maximum 4 products in comparison';
      this.compareToastTimer = setTimeout(() => this.compareToast = '', 3000);
    } else if (result === 'added') {
      this.compareToast = this.t.isFr ? `"${prod.nom}" ajouté à la comparaison` : `"${prod.nom}" added to comparison`;
      this.compareToastTimer = setTimeout(() => this.compareToast = '', 2500);
    }
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('catalogue-view-mode');
    if (saved === 'list' || saved === 'grid') this.viewMode = saved;

    // Subscribe (not snapshot) so every navigation to this route re-applies params.
    // This fixes the topbar search "works only once" bug — snapshot only reads on
    // first init; the component is reused on subsequent same-route navigations.
    this.paramSub = this.route.queryParamMap.subscribe(params => {
      const filtre = params.get('filtre');
      this.selectedStock = filtre === 'promo' ? 'en-promo' : 'tous';
      this.searchTerm = params.get('q') || '';
      // Re-filter immediately if products are already loaded; otherwise the
      // products subscription below will call applyFilters() once loaded.
      if (this.products.length > 0) this.applyFilters();
    });

    this.categorieService.listerTout().subscribe({
      next: (cats) => this.categories = cats
    });
    this.produitService.listerTout().subscribe({
      next: (prods) => {
        this.products = prods;
        if (prods.length > 0) {
          const prices = prods.map(p => p.prix);
          this.absoluteMin = Math.floor(Math.min(...prices));
          this.absoluteMax = Math.ceil(Math.max(...prices));
          this.priceRangeMin = this.absoluteMin;
          this.priceRangeMax = this.absoluteMax;
        }
        this.applyFilters();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
    if (this.compareToastTimer) clearTimeout(this.compareToastTimer);
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
      else if (this.selectedStock === 'en-promo') matchStock = isPromoActive(p);
      const matchPrice = p.prix >= this.priceRangeMin && p.prix <= this.priceRangeMax;
      return matchSearch && matchCategory && matchStock && matchPrice;
    });
    this.applySort();
  }

  onMinChange(): void {
    if (this.priceRangeMin >= this.priceRangeMax) {
      this.priceRangeMin = this.priceRangeMax - 1;
    }
    this.applyFilters();
  }

  onMaxChange(): void {
    if (this.priceRangeMax <= this.priceRangeMin) {
      this.priceRangeMax = this.priceRangeMin + 1;
    }
    this.applyFilters();
  }

  get fillLeft(): number {
    const range = this.absoluteMax - this.absoluteMin;
    if (range === 0) return 0;
    return ((this.priceRangeMin - this.absoluteMin) / range) * 100;
  }

  get fillRight(): number {
    const range = this.absoluteMax - this.absoluteMin;
    if (range === 0) return 0;
    return 100 - ((this.priceRangeMax - this.absoluteMin) / range) * 100;
  }

  get isPriceFiltered(): boolean {
    return this.priceRangeMin > this.absoluteMin || this.priceRangeMax < this.absoluteMax;
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
    return !!this.searchTerm || !!this.selectedCategory || this.selectedStock !== 'tous' || this.isPriceFiltered;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 0;
    this.selectedStock = 'tous';
    this.sortBy = 'nom-asc';
    this.priceRangeMin = this.absoluteMin;
    this.priceRangeMax = this.absoluteMax;
    this.applyFilters();
  }

  getCategoryName(id: number): string {
    return this.categories.find(c => c.id === id)?.nom || '';
  }

  getCatCount(catId: number): number {
    return this.products.filter(p => p.categorieId === catId).length;
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
    const diff = Date.now() - new Date(prod.dateCreation).getTime();
    return diff <= 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  ajouterAuPanier(event: Event, produit: Produit): void {
    event.preventDefault();
    event.stopPropagation();
    if (!produit.id || this.ajoutEnCours === produit.id) return;
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
    if (!this.quickViewProduct?.id || this.ajoutEnCours === this.quickViewProduct.id) return;
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
