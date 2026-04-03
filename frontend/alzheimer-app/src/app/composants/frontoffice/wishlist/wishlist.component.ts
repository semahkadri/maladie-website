import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../../services/wishlist.service';
import { PanierService } from '../../../services/panier.service';
import { TraductionService } from '../../../services/traduction.service';
import { Produit } from '../../../modeles/produit.model';
import { PromoCountdownComponent } from '../../shared/promo-countdown/promo-countdown.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, PromoCountdownComponent],
  template: `
    <div class="wl-page">
      <!-- Header -->
      <div class="wl-header">
        <div class="wl-header-inner">
          <div class="wl-header-title">
            <i class="bi bi-heart-fill wl-header-icon"></i>
            <h1>{{ t.isFr ? 'Ma Liste de Souhaits' : 'My Wishlist' }}</h1>
            <span class="wl-count-badge" *ngIf="items.length > 0">{{ items.length }}</span>
          </div>
          <div class="wl-header-actions" *ngIf="items.length > 0">
            <button class="wl-clear-btn" (click)="clearAll()">
              <i class="bi bi-trash3 me-1"></i>{{ t.isFr ? 'Tout vider' : 'Clear all' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="items.length === 0" class="wl-empty">
        <div class="wl-empty-icon">
          <i class="bi bi-heart"></i>
        </div>
        <h2>{{ t.isFr ? 'Votre liste est vide' : 'Your wishlist is empty' }}</h2>
        <p>{{ t.isFr ? 'Ajoutez des produits à votre liste pour les retrouver facilement.' : 'Add products to your wishlist to find them easily.' }}</p>
        <a routerLink="/catalogue" class="wl-browse-btn">
          <i class="bi bi-grid-3x3-gap me-2"></i>{{ t.isFr ? 'Parcourir le catalogue' : 'Browse catalogue' }}
        </a>
      </div>

      <!-- Products grid -->
      <div *ngIf="items.length > 0" class="wl-grid">
        <div *ngFor="let prod of items" class="fo-product-card wl-card">

          <!-- ① Clickable zone -->
          <a [routerLink]="['/catalogue', prod.id]" class="fo-card-link">
            <div class="fo-product-card-img">
              <span *ngIf="prod.enPromo && prod.remise" class="fo-product-badge fo-badge-promo">-{{ prod.remise }}%</span>
              <span *ngIf="!prod.enPromo" class="fo-product-badge fo-badge-new">{{ t.tr('badge.nouveau') }}</span>
              <button class="fo-product-wishlist wl-active" (click)="removeItem($event, prod.id!)">
                <i class="bi bi-heart-fill"></i>
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

          <!-- ② Static footer -->
          <div class="fo-card-bottom">
            <div class="fo-card-price-row">
              <div *ngIf="prod.enPromo && prod.prixOriginal" class="fo-price-block">
                <span class="fo-price-original">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                <span class="fo-price-promo">{{ prod.prix | number:'1.2-2' }} TND</span>
              </div>
              <span *ngIf="!prod.enPromo || !prod.prixOriginal" class="fo-product-price">{{ prod.prix | number:'1.2-2' }} TND</span>
              <span class="fo-product-stock" [class.in-stock]="prod.quantite > 0" [class.out-of-stock]="prod.quantite === 0">
                {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
              </span>
            </div>
            <div class="fo-card-countdown-slot">
              <app-promo-countdown *ngIf="prod.enPromo && prod.dateFinPromo"
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
  `
})
export class WishlistComponent implements OnInit, OnDestroy {
  items: Produit[] = [];
  ajoutEnCours: number | null = null;
  ajoutOk: number | null = null;
  private sub!: Subscription;

  constructor(
    public wishlistService: WishlistService,
    private panierService: PanierService,
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

  ajouterAuPanier(event: Event, produit: Produit): void {
    event.preventDefault();
    event.stopPropagation();
    if (!produit.id || this.ajoutEnCours) return;
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
