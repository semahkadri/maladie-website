import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../../services/produit.service';
import { PanierService } from '../../../services/panier.service';
import { Produit } from '../../../modeles/produit.model';
import { TraductionService } from '../../../services/traduction.service';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { PromoCountdownComponent } from '../../shared/promo-countdown/promo-countdown.component';

@Component({
  selector: 'app-detail-produit',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SkeletonLoaderComponent, PromoCountdownComponent],
  template: `
    <!-- Skeleton Loading -->
    <div class="fo-section" *ngIf="loading">
      <div class="fo-section-container">
        <app-skeleton-loader type="product-detail"></app-skeleton-loader>
      </div>
    </div>

    <div class="fo-section" *ngIf="!loading && produit">
      <div class="fo-section-container">
        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/"><i class="bi bi-house-door"></i></a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <a routerLink="/catalogue">{{ t.tr('detail.catalogue') }}</a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <a *ngIf="produit.categorieId" [routerLink]="['/categories', produit.categorieId]">{{ produit.categorieNom }}</a>
          <i *ngIf="produit.categorieId" class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <span class="fo-breadcrumb-current">{{ produit.nom }}</span>
        </div>

        <!-- Product Detail -->
        <div class="fo-product-detail">
          <!-- Image with Zoom -->
          <div class="fo-product-detail-img fo-zoom-container" [class.fo-zoom-active]="zoomActive"
               (mousemove)="onImageMouseMove($event)" (mouseleave)="onImageMouseLeave()">
            <img *ngIf="produit.imageUrl" [src]="produit.imageUrl" [alt]="produit.nom"
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;" #productImg>
            <i *ngIf="!produit.imageUrl" class="bi bi-box-seam"></i>
            <!-- Zoom Lens -->
            <div class="fo-zoom-lens" [ngStyle]="lensStyle" *ngIf="produit.imageUrl"></div>
            <!-- Zoom Result -->
            <div class="fo-zoom-result" [ngStyle]="zoomStyle" *ngIf="produit.imageUrl"></div>
          </div>
          <div class="fo-product-detail-info">
            <span class="fo-product-brand" style="font-size: 0.82rem;">{{ produit.categorieNom }}</span>
            <h1>{{ produit.nom }}
              <span *ngIf="produit.enPromo && produit.remise" class="fo-detail-promo-badge">-{{ produit.remise }}%</span>
            </h1>
            <p class="fo-product-detail-desc">{{ produit.description }}</p>

            <div class="fo-product-detail-meta">
              <div class="fo-product-detail-price">
                <span class="label">{{ t.tr('detail.prix') }}</span>
                <div *ngIf="produit.enPromo && produit.prixOriginal">
                  <span class="fo-price-original" style="font-size: 0.92rem;">{{ produit.prixOriginal | number:'1.2-2' }} TND</span>
                  <span class="fo-price-promo" style="font-size: 1.35rem;">{{ produit.prix | number:'1.2-2' }} TND</span>
                  <div class="fo-savings-line">
                    <i class="bi bi-piggy-bank-fill"></i>
                    {{ t.tr('promo.economie') }}: {{ produit.prixOriginal - produit.prix | number:'1.2-2' }} TND (-{{ produit.remise }}%)
                  </div>
                  <app-promo-countdown
                    *ngIf="produit.dateFinPromo"
                    [dateFinPromo]="produit.dateFinPromo"
                    size="detail"
                    [isFr]="t.isFr">
                  </app-promo-countdown>
                </div>
                <span *ngIf="!produit.enPromo || !produit.prixOriginal" class="value">{{ produit.prix | number:'1.2-2' }} TND</span>
              </div>
              <div class="fo-product-detail-stock">
                <span class="label">{{ t.tr('detail.disponibilite') }}</span>
                <span class="fo-product-stock fo-product-stock-lg"
                      [class.in-stock]="produit.quantite > 0"
                      [class.out-of-stock]="produit.quantite === 0">
                  <i class="bi" [class.bi-check-circle-fill]="produit.quantite > 0"
                     [class.bi-x-circle-fill]="produit.quantite === 0"></i>
                  {{ produit.quantite > 0 ? t.tr('common.enStock') : t.tr('detail.ruptureStock') }}
                </span>
              </div>
              <div class="fo-product-detail-category">
                <span class="label">{{ t.tr('detail.categorie') }}</span>
                <a [routerLink]="['/categories', produit.categorieId]" class="fo-category-link">
                  <i class="bi bi-tag-fill"></i> {{ produit.categorieNom }}
                </a>
              </div>
            </div>

            <!-- Pharmaceutical Info (Lot & Expiry) -->
            <div *ngIf="produit.numeroLot || produit.dateExpiration" class="fo-pharma-info">
              <div *ngIf="produit.numeroLot" class="fo-pharma-info-item">
                <i class="bi bi-upc-scan"></i>
                <span class="label">{{ t.tr('expiry.lot') }}</span>
                <span class="value">{{ produit.numeroLot }}</span>
              </div>
              <div *ngIf="produit.dateExpiration" class="fo-pharma-info-item"
                   [class.fo-expiry-danger]="produit.joursAvantExpiration !== undefined && produit.joursAvantExpiration < 0"
                   [class.fo-expiry-warning]="produit.joursAvantExpiration !== undefined && produit.joursAvantExpiration >= 0 && produit.joursAvantExpiration <= 30"
                   [class.fo-expiry-ok]="produit.joursAvantExpiration !== undefined && produit.joursAvantExpiration > 30">
                <i class="bi bi-calendar-event"></i>
                <span class="label">{{ t.tr('expiry.dateExpiration') }}</span>
                <span class="value">{{ produit.dateExpiration }}</span>
                <span *ngIf="produit.joursAvantExpiration !== undefined && produit.joursAvantExpiration >= 0"
                      class="fo-expiry-badge">
                  {{ produit.joursAvantExpiration }} {{ t.tr('expiry.joursRestants') }}
                </span>
                <span *ngIf="produit.joursAvantExpiration !== undefined && produit.joursAvantExpiration < 0"
                      class="fo-expiry-badge fo-expiry-badge-danger">
                  {{ t.tr('expiry.expire') }}
                </span>
              </div>
            </div>

            <!-- Add to Cart -->
            <div *ngIf="produit.quantite > 0" style="margin-top: 24px;">
              <div class="d-flex align-items-center gap-3 mb-3">
                <label class="fw-semibold" style="font-size: 0.88rem; white-space: nowrap;">{{ t.tr('detail.quantiteLabel') }}</label>
                <div class="fo-quantity-selector">
                  <button class="fo-quantity-btn" (click)="quantite = quantite - 1" [disabled]="quantite <= 1">
                    <i class="bi bi-dash"></i>
                  </button>
                  <input type="number" class="fo-quantity-input" [(ngModel)]="quantite" min="1" [max]="10"
                         (change)="quantite = Math.max(1, Math.min(quantite, 10))">
                  <button class="fo-quantity-btn" (click)="quantite = quantite + 1" [disabled]="quantite >= 10">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>
              <div class="fo-detail-actions">
                <button class="fo-detail-add-btn" (click)="ajouterAuPanier()" [disabled]="ajoutEnCours">
                  <span *ngIf="ajoutEnCours" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!ajoutEnCours && !ajoutOk" class="bi bi-cart-plus"></i>
                  <i *ngIf="ajoutOk" class="bi bi-check-lg"></i>
                  {{ ajoutOk ? t.tr('panier.ajouterSuccess') : t.tr('detail.ajouterPanier') }}
                </button>
                <button class="fo-detail-secondary-btn">
                  <i class="bi bi-heart"></i>
                </button>
              </div>
              <div *ngIf="ajoutErreur" class="alert alert-danger mt-2 mb-0 py-2" style="font-size: 0.85rem;">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ ajoutErreur }}
              </div>
            </div>

            <!-- Trust Guarantees -->
            <div class="fo-detail-guarantees">
              <div class="fo-detail-guarantee">
                <i class="bi bi-truck"></i>
                <span>{{ t.tr('trust.livraisonDetail') }}</span>
              </div>
              <div class="fo-detail-guarantee">
                <i class="bi bi-patch-check"></i>
                <span>{{ t.tr('trust.garantie') }}</span>
              </div>
              <div class="fo-detail-guarantee">
                <i class="bi bi-arrow-return-left"></i>
                <span>{{ t.tr('trust.retourDetail') }}</span>
              </div>
            </div>

            <a routerLink="/catalogue" class="fo-btn fo-btn-outline" style="margin-top: 16px;">
              <i class="bi bi-arrow-left me-2"></i>{{ t.tr('detail.retourCatalogue') }}
            </a>
          </div>
        </div>

        <!-- Cross-sell: Frequently Bought Together -->
        <div *ngIf="crossSellProducts.length > 0" class="fo-cross-sell-section">
          <div class="fo-cross-sell-header">
            <i class="bi bi-cart-check-fill"></i>
            <div>
              <h2>{{ t.tr('crossSell.titre') }}</h2>
              <p>{{ t.tr('crossSell.desc') }}</p>
            </div>
          </div>
          <div class="fo-product-grid">
            <a *ngFor="let p of crossSellProducts" [routerLink]="['/catalogue', p.id]" class="fo-product-card">
              <div class="fo-product-card-img">
                <span *ngIf="p.enPromo && p.remise" class="fo-product-badge fo-badge-promo">-{{ p.remise }}%</span>
                <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.nom" style="width: 100%; height: 100%; object-fit: cover;">
                <i *ngIf="!p.imageUrl" class="bi bi-box-seam"></i>
              </div>
              <div class="fo-product-card-body">
                <span class="fo-product-brand">{{ p.categorieNom }}</span>
                <h4>{{ p.nom }}</h4>
                <div class="fo-product-card-footer">
                  <div *ngIf="p.enPromo && p.prixOriginal" class="fo-price-block">
                    <span class="fo-price-original">{{ p.prixOriginal | number:'1.2-2' }} TND</span>
                    <span class="fo-price-promo">{{ p.prix | number:'1.2-2' }} TND</span>
                  </div>
                  <span *ngIf="!p.enPromo || !p.prixOriginal" class="fo-product-price">{{ p.prix | number:'1.2-2' }} TND</span>
                  <span class="fo-product-stock"
                        [class.in-stock]="p.quantite > 0"
                        [class.out-of-stock]="p.quantite === 0">
                    {{ p.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Related Products -->
        <div *ngIf="relatedProducts.length > 0" class="fo-related-section">
          <h2 class="fo-section-title">{{ t.tr('detail.similaires') }}</h2>
          <div class="fo-product-grid">
            <a *ngFor="let p of relatedProducts" [routerLink]="['/catalogue', p.id]" class="fo-product-card">
              <div class="fo-product-card-img">
                <span *ngIf="p.enPromo && p.remise" class="fo-product-badge fo-badge-promo">-{{ p.remise }}%</span>
                <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.nom" style="width: 100%; height: 100%; object-fit: cover;">
                <i *ngIf="!p.imageUrl" class="bi bi-box-seam"></i>
              </div>
              <div class="fo-product-card-body">
                <span class="fo-product-brand">{{ p.categorieNom }}</span>
                <h4>{{ p.nom }}</h4>
                <div class="fo-product-card-footer">
                  <div *ngIf="p.enPromo && p.prixOriginal" class="fo-price-block">
                    <span class="fo-price-original">{{ p.prixOriginal | number:'1.2-2' }} TND</span>
                    <span class="fo-price-promo">{{ p.prix | number:'1.2-2' }} TND</span>
                  </div>
                  <span *ngIf="!p.enPromo || !p.prixOriginal" class="fo-product-price">{{ p.prix | number:'1.2-2' }} TND</span>
                  <span class="fo-product-stock"
                        [class.in-stock]="p.quantite > 0"
                        [class.out-of-stock]="p.quantite === 0">
                    {{ p.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DetailProduitComponent implements OnInit {
  produit: Produit | null = null;
  relatedProducts: Produit[] = [];
  crossSellProducts: Produit[] = [];
  loading = true;
  quantite = 1;
  ajoutEnCours = false;
  ajoutOk = false;
  ajoutErreur = '';
  Math = Math;

  // Image Zoom
  zoomActive = false;
  zoomStyle: Record<string, string> = {};
  lensStyle: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private produitService: ProduitService,
    private panierService: PanierService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loading = true;
      this.quantite = 1;
      this.ajoutOk = false;
      this.crossSellProducts = [];
      this.produitService.obtenirParId(id).subscribe({
        next: (produit) => {
          this.produit = produit;
          this.loadRelated(produit.categorieId, produit.id!);
          this.loadCrossSell(produit.id!);
          this.loading = false;
        },
        error: () => this.loading = false
      });
    });
  }

  ajouterAuPanier(): void {
    if (!this.produit?.id || this.ajoutEnCours) return;
    this.ajoutEnCours = true;
    this.ajoutOk = false;
    this.ajoutErreur = '';
    this.panierService.ajouterProduit(this.produit.id, this.quantite).subscribe({
      next: () => {
        this.ajoutEnCours = false;
        this.ajoutOk = true;
        setTimeout(() => this.ajoutOk = false, 2500);
      },
      error: (err) => {
        this.ajoutEnCours = false;
        this.ajoutErreur = err.error?.message || this.t.tr('panier.ajouterErreur');
        setTimeout(() => this.ajoutErreur = '', 5000);
      }
    });
  }

  // Image Zoom
  onImageMouseMove(event: MouseEvent): void {
    if (!this.produit?.imageUrl) return;
    const container = event.currentTarget as HTMLElement;
    const img = container.querySelector('img');
    if (!img) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const lensSize = 150;
    const zoomLevel = 2.5;

    // Lens position
    const lensX = Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize));
    const lensY = Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize));

    this.zoomActive = true;
    this.lensStyle = {
      left: lensX + 'px',
      top: lensY + 'px',
      'background-image': `url(${this.produit.imageUrl})`,
      'background-size': `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`,
      'background-position': `-${lensX * zoomLevel}px -${lensY * zoomLevel}px`
    };

    // Zoom result
    const bgPosX = (x / rect.width) * 100;
    const bgPosY = (y / rect.height) * 100;
    this.zoomStyle = {
      'background-image': `url(${this.produit.imageUrl})`,
      'background-size': `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`,
      'background-position': `${bgPosX}% ${bgPosY}%`
    };
  }

  onImageMouseLeave(): void {
    this.zoomActive = false;
  }

  private loadCrossSell(produitId: number): void {
    this.produitService.obtenirCrossSell(produitId).subscribe({
      next: (prods) => this.crossSellProducts = prods.slice(0, 4),
      error: () => this.crossSellProducts = []
    });
  }

  private loadRelated(categorieId: number, currentId: number): void {
    this.produitService.listerParCategorie(categorieId).subscribe({
      next: (prods) => {
        this.relatedProducts = prods.filter(p => p.id !== currentId).slice(0, 4);
      }
    });
  }
}
