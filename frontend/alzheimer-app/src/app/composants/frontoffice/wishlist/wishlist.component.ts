import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../../services/wishlist.service';
import { PanierService } from '../../../services/panier.service';
import { CompareService } from '../../../services/compare.service';
import { TraductionService } from '../../../services/traduction.service';
import { Produit, isPromoActive } from '../../../modeles/produit.model';
import { PromoCountdownComponent } from '../../shared/promo-countdown/promo-countdown.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, PromoCountdownComponent],
  template: `
    <div class="fo-section">
      <div class="fo-section-container fade-in">

        <!-- Breadcrumb — same as panier/commander -->
        <div class="fo-breadcrumb">
          <a routerLink="/"><i class="bi bi-house-door"></i></a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <span class="fo-breadcrumb-current">
            {{ t.isFr ? 'Liste de souhaits' : 'Wishlist' }}
          </span>
        </div>

        <!-- Page title — same pattern as panier -->
        <div class="fo-wl-titlebar">
          <div>
            <h1 class="fo-page-title">
              <i class="bi bi-heart-fill me-2" style="color:var(--promo-red, #d32f2f);"></i>
              {{ t.isFr ? 'Ma Liste de Souhaits' : 'My Wishlist' }}
            </h1>
            <p class="fo-page-subtitle">
              {{ items.length > 0
                ? (t.isFr ? items.length + ' produit(s) sauvegardé(s)' : items.length + ' saved product(s)')
                : (t.isFr ? 'Sauvegardez vos produits favoris pour les retrouver facilement.' : 'Save your favourite products to find them easily.') }}
            </p>
          </div>
          <button *ngIf="items.length > 0" class="fo-wl-clear-btn" (click)="clearAll()">
            <i class="bi bi-trash3 me-1"></i>{{ t.isFr ? 'Tout vider' : 'Clear all' }}
          </button>
        </div>

        <!-- Empty state — same style as panier -->
        <div *ngIf="items.length === 0" class="fo-empty-state">
          <i class="bi bi-heart" style="color:var(--promo-red, #d32f2f);opacity:0.35;"></i>
          <p>{{ t.isFr ? 'Votre liste de souhaits est vide.' : 'Your wishlist is empty.' }}</p>
          <a routerLink="/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-grid-3x3-gap me-2"></i>{{ t.isFr ? 'Parcourir le catalogue' : 'Browse catalogue' }}
          </a>
        </div>

        <!-- Product grid — same card design as catalogue -->
        <div *ngIf="items.length > 0" class="fo-wl-grid">
          <div *ngFor="let prod of items" class="fo-product-card">

            <!-- ① Clickable zone -->
            <a [routerLink]="['/catalogue', prod.id]" class="fo-card-link">
              <div class="fo-product-card-img">
                <span *ngIf="isPromoActive(prod) && prod.remise" class="fo-product-badge fo-badge-promo">-{{ prod.remise }}%</span>
                <span *ngIf="!isPromoActive(prod) && isNouveauProduit(prod)" class="fo-product-badge fo-badge-new">{{ t.tr('badge.nouveau') }}</span>
                <!-- Heart button: filled red, click = remove from wishlist -->
                <button class="fo-product-wishlist wl-active"
                        (click)="removeItem($event, prod.id!)"
                        [title]="t.isFr ? 'Retirer de la liste' : 'Remove from wishlist'">
                  <i class="bi bi-heart-fill"></i>
                </button>
                <button class="fo-product-compare"
                        [class.fo-compare-active]="compareService.isInCompare(prod.id!)"
                        (click)="$event.preventDefault();$event.stopPropagation();compareService.toggle(prod)"
                        [title]="compareService.isInCompare(prod.id!) ? (t.isFr ? 'Retirer de la comparaison' : 'Remove from comparison') : (t.isFr ? 'Comparer' : 'Compare')">
                  <i class="bi" [class.bi-bar-chart-steps]="!compareService.isInCompare(prod.id!)" [class.bi-bar-chart-fill]="compareService.isInCompare(prod.id!)"></i>
                </button>
                <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom"
                     style="width:100%;height:100%;object-fit:cover;">
                <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
              </div>
              <div class="fo-product-card-body">
                <span class="fo-product-brand">{{ prod.categorieNom }}</span>
                <h4>{{ prod.nom }}</h4>
                <p>{{ prod.description | slice:0:60 }}{{ prod.description && prod.description.length > 60 ? '...' : '' }}</p>
              </div>
            </a>

            <!-- ② Static footer — identical to catalogue cards -->
            <div class="fo-card-bottom">
              <div class="fo-card-price-row">
                <div *ngIf="isPromoActive(prod) && prod.prixOriginal" class="fo-price-block">
                  <span class="fo-price-original">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                  <span class="fo-price-promo">{{ prod.prix | number:'1.2-2' }} TND</span>
                </div>
                <span *ngIf="!isPromoActive(prod) || !prod.prixOriginal" class="fo-product-price">
                  {{ prod.prix | number:'1.2-2' }} TND
                </span>
                <span class="fo-product-stock"
                      [class.in-stock]="prod.quantite > 0"
                      [class.out-of-stock]="prod.quantite === 0">
                  {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                </span>
              </div>
              <div class="fo-card-countdown-slot">
                <app-promo-countdown *ngIf="isPromoActive(prod) && prod.dateFinPromo"
                  [dateFinPromo]="prod.dateFinPromo" size="card" [isFr]="t.isFr">
                </app-promo-countdown>
              </div>
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

      </div>
    </div>
  `
})
export class WishlistComponent implements OnInit, OnDestroy {
  readonly isPromoActive = isPromoActive;

  items: Produit[] = [];
  ajoutEnCours: number | null = null;
  ajoutOk: number | null = null;
  private sub!: Subscription;

  constructor(
    public wishlistService: WishlistService,
    private panierService: PanierService,
    public compareService: CompareService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.sub = this.wishlistService.wishlist$.subscribe(items => this.items = items);
  }

  removeItem(event: Event, id: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.remove(id);
  }

  clearAll(): void {
    this.wishlistService.clear();
  }

  isNouveauProduit(prod: Produit): boolean {
    if (!prod.dateCreation) return false;
    return Date.now() - new Date(prod.dateCreation).getTime() <= 30 * 24 * 60 * 60 * 1000;
  }

  ajouterAuPanier(event: Event, produit: Produit): void {
    event.preventDefault();
    event.stopPropagation();
    if (!produit.id || this.ajoutEnCours === produit.id) return;
    this.ajoutEnCours = produit.id;
    this.ajoutOk = null;
    this.panierService.ajouterProduit(produit.id, 1).subscribe({
      next: () => {
        this.ajoutEnCours = null;
        this.ajoutOk = produit.id!;
        setTimeout(() => { if (this.ajoutOk === produit.id) this.ajoutOk = null; }, 2000);
      },
      error: () => { this.ajoutEnCours = null; }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
