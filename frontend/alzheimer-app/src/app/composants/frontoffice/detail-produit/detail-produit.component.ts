import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../../services/produit.service';
import { PanierService } from '../../../services/panier.service';
import { Produit } from '../../../modeles/produit.model';
import { TraductionService } from '../../../services/traduction.service';

@Component({
  selector: 'app-detail-produit',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fo-section" *ngIf="!loading && produit">
      <div class="fo-section-container">
        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/catalogue">{{ t.tr('detail.catalogue') }}</a>
          <span>/</span>
          <span>{{ produit.nom }}</span>
        </div>

        <!-- Product Detail -->
        <div class="fo-product-detail">
          <div class="fo-product-detail-img">
            <img *ngIf="produit.imageUrl" [src]="produit.imageUrl" [alt]="produit.nom" style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;">
            <i *ngIf="!produit.imageUrl" class="bi bi-box-seam"></i>
          </div>
          <div class="fo-product-detail-info">
            <span class="fo-product-card-category">{{ produit.categorieNom }}</span>
            <h1>{{ produit.nom }}</h1>
            <p class="fo-product-detail-desc">{{ produit.description }}</p>

            <div class="fo-product-detail-meta">
              <div class="fo-product-detail-price">
                <span class="label">{{ t.tr('detail.prix') }}</span>
                <span class="value">{{ produit.prix | number:'1.2-2' }} TND</span>
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

            <!-- Add to Cart -->
            <div *ngIf="produit.quantite > 0" class="fo-detail-cart-actions" style="margin-top: 24px;">
              <div class="d-flex align-items-center gap-3 mb-3">
                <label class="fw-semibold" style="font-size: 0.88rem; white-space: nowrap;">{{ t.tr('detail.quantiteLabel') }}</label>
                <div class="d-flex align-items-center gap-2">
                  <button class="btn btn-sm btn-outline-secondary"
                          (click)="quantite = quantite - 1" [disabled]="quantite <= 1"
                          style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-dash"></i>
                  </button>
                  <input type="number" [(ngModel)]="quantite" min="1" [max]="10"
                         style="width: 60px; text-align: center; border: 1.5px solid var(--border); border-radius: 8px; padding: 4px; font-weight: 600;"
                         (change)="quantite = Math.max(1, Math.min(quantite, 10))">
                  <button class="btn btn-sm btn-outline-secondary"
                          (click)="quantite = quantite + 1" [disabled]="quantite >= 10"
                          style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>
              <button class="fo-btn fo-btn-primary" (click)="ajouterAuPanier()" [disabled]="ajoutEnCours">
                <span *ngIf="ajoutEnCours" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!ajoutEnCours && !ajoutOk" class="bi bi-cart-plus me-2"></i>
                <i *ngIf="ajoutOk" class="bi bi-check-lg me-2"></i>
                {{ ajoutOk ? t.tr('panier.ajouterSuccess') : t.tr('detail.ajouterPanier') }}
              </button>
              <div *ngIf="ajoutErreur" class="alert alert-danger mt-2 mb-0 py-2" style="font-size: 0.85rem;">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ ajoutErreur }}
              </div>
            </div>

            <a routerLink="/catalogue" class="fo-btn fo-btn-outline" style="margin-top: 16px;">
              <i class="bi bi-arrow-left me-2"></i>{{ t.tr('detail.retourCatalogue') }}
            </a>
          </div>
        </div>

        <!-- Related Products -->
        <div *ngIf="relatedProducts.length > 0" class="fo-related-section">
          <h2 class="fo-section-title">{{ t.tr('detail.similaires') }}</h2>
          <div class="fo-product-grid">
            <a *ngFor="let p of relatedProducts" [routerLink]="['/catalogue', p.id]" class="fo-product-card">
              <div class="fo-product-card-img">
                <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.nom" style="width: 100%; height: 100%; object-fit: cover;">
                <i *ngIf="!p.imageUrl" class="bi bi-box-seam"></i>
              </div>
              <div class="fo-product-card-body">
                <span class="fo-product-card-category">{{ p.categorieNom }}</span>
                <h4>{{ p.nom }}</h4>
                <div class="fo-product-card-footer">
                  <span class="fo-product-price">{{ p.prix | number:'1.2-2' }} TND</span>
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

    <!-- Loading -->
    <div *ngIf="loading" class="fo-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
      </div>
    </div>
  `
})
export class DetailProduitComponent implements OnInit {
  produit: Produit | null = null;
  relatedProducts: Produit[] = [];
  loading = true;
  quantite = 1;
  ajoutEnCours = false;
  ajoutOk = false;
  ajoutErreur = '';
  Math = Math;

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
      this.produitService.obtenirParId(id).subscribe({
        next: (produit) => {
          this.produit = produit;
          this.loadRelated(produit.categorieId, produit.id!);
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

  private loadRelated(categorieId: number, currentId: number): void {
    this.produitService.listerParCategorie(categorieId).subscribe({
      next: (prods) => {
        this.relatedProducts = prods.filter(p => p.id !== currentId).slice(0, 4);
      }
    });
  }
}
