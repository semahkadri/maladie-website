import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProduitService } from '../../../services/produit.service';
import { Produit } from '../../../modeles/produit.model';

@Component({
  selector: 'app-detail-produit',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fo-section" *ngIf="!loading && produit">
      <div class="fo-section-container">
        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/catalogue">Catalogue</a>
          <span>/</span>
          <span>{{ produit.nom }}</span>
        </div>

        <!-- Product Detail -->
        <div class="fo-product-detail">
          <div class="fo-product-detail-img">
            <i class="bi bi-box-seam"></i>
          </div>
          <div class="fo-product-detail-info">
            <span class="fo-product-card-category">{{ produit.categorieNom }}</span>
            <h1>{{ produit.nom }}</h1>
            <p class="fo-product-detail-desc">{{ produit.description }}</p>

            <div class="fo-product-detail-meta">
              <div class="fo-product-detail-price">
                <span class="label">Prix</span>
                <span class="value">{{ produit.prix | number:'1.2-2' }} TND</span>
              </div>
              <div class="fo-product-detail-stock">
                <span class="label">Disponibilité</span>
                <span class="fo-product-stock fo-product-stock-lg"
                      [class.in-stock]="produit.quantite > 10"
                      [class.low-stock]="produit.quantite > 0 && produit.quantite <= 10"
                      [class.out-of-stock]="produit.quantite === 0">
                  <i class="bi" [class.bi-check-circle-fill]="produit.quantite > 10"
                     [class.bi-exclamation-triangle-fill]="produit.quantite > 0 && produit.quantite <= 10"
                     [class.bi-x-circle-fill]="produit.quantite === 0"></i>
                  {{ produit.quantite > 10 ? 'En stock (' + produit.quantite + ' unités)' :
                     produit.quantite > 0 ? 'Stock faible (' + produit.quantite + ' unités)' :
                     'Rupture de stock' }}
                </span>
              </div>
              <div class="fo-product-detail-category">
                <span class="label">Catégorie</span>
                <a [routerLink]="['/categories', produit.categorieId]" class="fo-category-link">
                  <i class="bi bi-tag-fill"></i> {{ produit.categorieNom }}
                </a>
              </div>
            </div>

            <a routerLink="/catalogue" class="fo-btn fo-btn-outline" style="margin-top: 24px;">
              <i class="bi bi-arrow-left me-2"></i>Retour au catalogue
            </a>
          </div>
        </div>

        <!-- Related Products -->
        <div *ngIf="relatedProducts.length > 0" class="fo-related-section">
          <h2 class="fo-section-title">Produits similaires</h2>
          <div class="fo-product-grid">
            <a *ngFor="let p of relatedProducts" [routerLink]="['/catalogue', p.id]" class="fo-product-card">
              <div class="fo-product-card-img">
                <i class="bi bi-box-seam"></i>
              </div>
              <div class="fo-product-card-body">
                <span class="fo-product-card-category">{{ p.categorieNom }}</span>
                <h4>{{ p.nom }}</h4>
                <div class="fo-product-card-footer">
                  <span class="fo-product-price">{{ p.prix | number:'1.2-2' }} TND</span>
                  <span class="fo-product-stock"
                        [class.in-stock]="p.quantite > 10"
                        [class.low-stock]="p.quantite > 0 && p.quantite <= 10"
                        [class.out-of-stock]="p.quantite === 0">
                    {{ p.quantite > 10 ? 'En stock' : p.quantite > 0 ? 'Stock faible' : 'Rupture' }}
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
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  `
})
export class DetailProduitComponent implements OnInit {
  produit: Produit | null = null;
  relatedProducts: Produit[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loading = true;
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

  private loadRelated(categorieId: number, currentId: number): void {
    this.produitService.listerParCategorie(categorieId).subscribe({
      next: (prods) => {
        this.relatedProducts = prods.filter(p => p.id !== currentId).slice(0, 4);
      }
    });
  }
}
