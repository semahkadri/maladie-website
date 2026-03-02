import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategorieService } from '../../../services/categorie.service';
import { ProduitService } from '../../../services/produit.service';
import { Categorie } from '../../../modeles/categorie.model';
import { Produit } from '../../../modeles/produit.model';
import { TraductionService } from '../../../services/traduction.service';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="fo-hero">
      <div class="fo-hero-content">
        <h1>{{ t.tr('accueil.titre') }}</h1>
        <p>{{ t.tr('accueil.sousTitre') }}</p>
        <a routerLink="/catalogue" class="fo-hero-btn">
          <i class="bi bi-grid-3x3-gap me-2"></i>{{ t.tr('accueil.btnCatalogue') }}
        </a>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="fo-section" *ngIf="categories.length > 0">
      <div class="fo-section-container">
        <h2 class="fo-section-title">{{ t.tr('accueil.sectionCat') }}</h2>
        <div class="fo-category-grid">
          <a *ngFor="let cat of categories" [routerLink]="['/categories', cat.id]" class="fo-category-card">
            <div class="fo-category-icon">
              <i class="bi bi-tag-fill"></i>
            </div>
            <h3>{{ cat.nom }}</h3>
            <p>{{ cat.description | slice:0:80 }}{{ cat.description && cat.description.length > 80 ? '...' : '' }}</p>
            <span class="fo-category-count">{{ t.tr('accueil.voirProduits') }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Recent Products Section -->
    <section class="fo-section" *ngIf="recentProducts.length > 0">
      <div class="fo-section-container">
        <div class="fo-section-header">
          <h2 class="fo-section-title">{{ t.tr('accueil.derniersProduits') }}</h2>
          <a routerLink="/catalogue" class="fo-section-link">{{ t.tr('common.voirTout') }} <i class="bi bi-arrow-right"></i></a>
        </div>
        <div class="fo-product-grid">
          <a *ngFor="let prod of recentProducts" [routerLink]="['/catalogue', prod.id]" class="fo-product-card">
            <div class="fo-product-card-img">
              <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" style="width: 100%; height: 100%; object-fit: cover;">
              <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
            </div>
            <div class="fo-product-card-body">
              <span class="fo-product-card-category">{{ prod.categorieNom }}</span>
              <h4>{{ prod.nom }}</h4>
              <p>{{ prod.description | slice:0:60 }}{{ prod.description && prod.description.length > 60 ? '...' : '' }}</p>
              <div class="fo-product-card-footer">
                <span class="fo-product-price">{{ prod.prix | number:'1.2-2' }} TND</span>
                <span class="fo-product-stock"
                      [class.in-stock]="prod.quantite > 0"
                      [class.out-of-stock]="prod.quantite === 0">
                  {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div *ngIf="loading" class="fo-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
      </div>
    </div>
  `
})
export class AccueilComponent implements OnInit {
  categories: Categorie[] = [];
  recentProducts: Produit[] = [];
  loading = true;

  constructor(
    private categorieService: CategorieService,
    private produitService: ProduitService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.categorieService.listerTout().subscribe({
      next: (cats) => this.categories = cats
    });
    this.produitService.listerTout().subscribe({
      next: (prods) => {
        this.recentProducts = prods
          .sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''))
          .slice(0, 6);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
