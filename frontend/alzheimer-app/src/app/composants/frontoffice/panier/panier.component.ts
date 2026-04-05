import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PanierService } from '../../../services/panier.service';
import { TraductionService } from '../../../services/traduction.service';
import { Panier, LignePanier } from '../../../modeles/panier.model';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fo-section">
      <div class="fo-section-container fade-in">

        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/"><i class="bi bi-house-door"></i></a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <span class="fo-breadcrumb-current">{{ t.tr('panier.titre') }}</span>
        </div>

        <h1 class="fo-page-title"><i class="bi bi-cart3 me-2"></i>{{ t.tr('panier.titre') }}</h1>
        <p class="fo-page-subtitle">{{ t.tr('panier.sousTitre') }}</p>

        <!-- Loading -->
        <div *ngIf="chargement" class="fo-loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
          </div>
        </div>

        <!-- Empty Cart -->
        <div *ngIf="!chargement && panier && panier.lignes.length === 0" class="fo-empty-state">
          <i class="bi bi-cart-x"></i>
          <p>{{ t.tr('panier.vide') }}</p>
          <a routerLink="/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-grid-3x3-gap me-2"></i>{{ t.tr('panier.parcourir') }}
          </a>
        </div>

        <!-- Cart Content -->
        <div *ngIf="!chargement && panier && panier.lignes.length > 0">

          <!-- Reservation Info Banner with live countdown -->
          <div class="fo-cart-reservation-banner" [class.fo-cart-expiring-soon]="minutesRestantes !== null && minutesRestantes <= 5">
            <div class="fo-cart-reservation-icon">
              <i class="bi bi-clock-history"></i>
            </div>
            <div class="fo-cart-reservation-text">
              <h4>{{ t.tr('panier.reserveInfo') }}</h4>
              <p *ngIf="minutesRestantes === null">{{ t.tr('panier.expireInfo') }}</p>
              <p *ngIf="minutesRestantes !== null && (minutesRestantes > 0 || secondesRestantes > 0)">
                {{ t.isFr ? 'Expire dans' : 'Expires in' }}
                <strong>{{ minutesRestantes }}:{{ secondesRestantes.toString().padStart(2, '0') }}</strong>
                {{ t.isFr ? 'min' : 'min' }}
              </p>
              <p *ngIf="minutesRestantes !== null && minutesRestantes === 0 && secondesRestantes === 0" class="text-danger fw-bold">
                {{ t.isFr ? 'Panier expiré — veuillez recharger la page' : 'Cart expired — please reload the page' }}
                <button class="btn btn-sm btn-outline-danger ms-2" (click)="chargerPanier()">
                  <i class="bi bi-arrow-clockwise"></i>
                </button>
              </p>
            </div>
          </div>

          <div class="row g-4">
            <!-- Cart Items -->
            <div class="col-lg-8">
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold">
                    <i class="bi bi-bag-fill me-2 text-primary"></i>
                    {{ panier.nombreArticles }} {{ panier.nombreArticles !== 1 ? t.tr('common.produits') : t.tr('common.produit') }}
                  </h6>
                  <button class="fo-wl-clear-btn" (click)="viderPanier()" [disabled]="enCours">
                    <i class="bi bi-trash3 me-1"></i>{{ t.tr('panier.viderPanier') }}
                  </button>
                </div>
                <div class="card-body p-0">
                  <div *ngFor="let ligne of panier.lignes; let last = last"
                       class="fo-cart-item-row d-flex align-items-center p-4"
                       [style.border-bottom]="!last ? '1px solid var(--border)' : 'none'">
                    <!-- Product Image -->
                    <div class="me-3" style="width: 60px; height: 60px; background: var(--primary-light); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                      <img *ngIf="ligne.produitImageUrl" [src]="ligne.produitImageUrl" [alt]="ligne.produitNom" style="width: 100%; height: 100%; object-fit: cover;">
                      <i *ngIf="!ligne.produitImageUrl" class="bi bi-box-seam" style="font-size: 1.4rem; color: var(--primary);"></i>
                    </div>
                    <!-- Product Info -->
                    <div class="flex-grow-1">
                      <div class="fw-bold">{{ ligne.produitNom }}</div>
                      <small class="text-muted">{{ ligne.categorieNom }}</small>
                      <div class="mt-1">
                        <ng-container *ngIf="ligne.produitEnPromo && ligne.produitPrixOriginal; else prixNormal">
                          <span class="text-muted text-decoration-line-through me-1" style="font-size:0.8rem;">{{ ligne.produitPrixOriginal | number:'1.2-2' }} TND</span>
                          <span class="fw-bold" style="color:#dc2626;">{{ ligne.produitPrix | number:'1.2-2' }} TND</span>
                        </ng-container>
                        <ng-template #prixNormal>
                          <span class="fw-semibold" style="color: var(--primary);">{{ ligne.produitPrix | number:'1.2-2' }} TND</span>
                        </ng-template>
                      </div>
                    </div>
                    <!-- Quantity Controls -->
                    <div class="d-flex align-items-center me-4">
                      <div class="fo-quantity-selector">
                        <button class="fo-quantity-btn"
                                (click)="modifierQuantite(ligne, ligne.quantite - 1)"
                                [disabled]="enCours || ligne.quantite <= 1">
                          <i class="bi bi-dash"></i>
                        </button>
                        <span class="fo-quantity-input" style="display: flex; align-items: center; justify-content: center;">{{ ligne.quantite }}</span>
                        <button class="fo-quantity-btn"
                                (click)="modifierQuantite(ligne, ligne.quantite + 1)"
                                [disabled]="enCours || ligne.quantite >= maxQty(ligne.produitQuantiteStock)">
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>
                    <!-- Subtotal -->
                    <div class="text-end me-3" style="min-width: 100px;">
                      <div class="fw-bold">{{ ligne.sousTotal | number:'1.2-2' }} TND</div>
                    </div>
                    <!-- Remove -->
                    <button class="btn btn-sm btn-outline-danger"
                            (click)="supprimerProduit(ligne.produitId)"
                            [disabled]="enCours"
                            style="width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center;">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="col-lg-4">
              <div class="card" style="position: sticky; top: 80px;">
                <div class="card-header">
                  <h6 class="mb-0 fw-bold"><i class="bi bi-receipt me-2 text-primary"></i>{{ t.tr('panier.resume') }}</h6>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">{{ t.tr('panier.articles') }}</span>
                    <span>{{ panier.nombreArticles }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-3">
                    <span class="text-muted">{{ t.tr('panier.sousTotal') }}</span>
                    <span>{{ panier.montantTotal | number:'1.2-2' }} TND</span>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between mb-4">
                    <span class="fw-bold fs-5">{{ t.tr('panier.total') }}</span>
                    <span class="fw-bold fs-5" style="color: var(--primary);">{{ panier.montantTotal | number:'1.2-2' }} TND</span>
                  </div>
                  <a routerLink="/commander" class="btn btn-primary w-100 py-2">
                    <i class="bi bi-credit-card me-2"></i>{{ t.tr('panier.commander') }}
                  </a>
                  <a routerLink="/catalogue" class="btn btn-secondary w-100 mt-2 py-2">
                    <i class="bi bi-arrow-left me-2"></i>{{ t.tr('panier.continuer') }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="erreur" class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ erreur }}
        </div>

      </div>
    </div>
  `
})
export class PanierComponent implements OnInit, OnDestroy {
  panier: Panier | null = null;
  chargement = true;
  enCours = false;
  erreur = '';

  minutesRestantes: number | null = null;
  secondesRestantes = 0;
  private countdownTimer: any;

  constructor(
    private panierService: PanierService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.chargerPanier();
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  maxQty(stock: number | undefined): number {
    return Math.min(10, stock ?? 10);
  }

  private demarrerCompte(expireA: string): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    const expiration = new Date(expireA).getTime();
    const tick = () => {
      const restant = Math.max(0, expiration - Date.now());
      this.minutesRestantes = Math.floor(restant / 60000);
      this.secondesRestantes = Math.floor((restant % 60000) / 1000);
      if (restant === 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
    };
    tick();
    this.countdownTimer = setInterval(tick, 1000);
  }

  chargerPanier(): void {
    this.chargement = true;
    this.panierService.chargerPanier().subscribe({
      next: (data) => {
        this.panier = data;
        this.chargement = false;
        if (data.expireA && data.lignes.length > 0) {
          this.demarrerCompte(data.expireA);
        } else if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.minutesRestantes = null;
        }
      },
      error: () => {
        this.chargement = false;
        this.erreur = this.t.tr('panier.erreurChargement');
      }
    });
  }

  modifierQuantite(ligne: LignePanier, nouvelleQuantite: number): void {
    if (nouvelleQuantite < 1) return;
    this.enCours = true;
    this.erreur = '';
    this.panierService.modifierQuantite(ligne.produitId, nouvelleQuantite).subscribe({
      next: (data) => {
        this.panier = data;
        this.enCours = false;
        if (data.expireA && data.lignes.length > 0) this.demarrerCompte(data.expireA);
      },
      error: (err) => {
        this.erreur = err.error?.message || this.t.tr('panier.erreurModif');
        this.enCours = false;
      }
    });
  }

  supprimerProduit(produitId: number): void {
    this.enCours = true;
    this.erreur = '';
    this.panierService.supprimerProduit(produitId).subscribe({
      next: (data) => {
        this.panier = data;
        this.enCours = false;
        if (data.expireA && data.lignes.length > 0) this.demarrerCompte(data.expireA);
        else { clearInterval(this.countdownTimer); this.minutesRestantes = null; }
      },
      error: () => {
        this.erreur = this.t.tr('panier.erreurSupp');
        this.enCours = false;
      }
    });
  }

  viderPanier(): void {
    this.enCours = true;
    this.erreur = '';
    this.panierService.viderPanier().subscribe({
      next: () => {
        this.panier = { sessionId: '', lignes: [], nombreArticles: 0, montantTotal: 0 };
        this.enCours = false;
        if (this.countdownTimer) { clearInterval(this.countdownTimer); this.countdownTimer = null; }
        this.minutesRestantes = null;
      },
      error: () => {
        this.erreur = this.t.tr('panier.erreurVider');
        this.enCours = false;
      }
    });
  }
}
