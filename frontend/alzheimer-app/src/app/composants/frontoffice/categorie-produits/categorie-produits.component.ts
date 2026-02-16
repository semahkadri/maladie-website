import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../../services/categorie.service';
import { ProduitService } from '../../../services/produit.service';
import { Categorie } from '../../../modeles/categorie.model';
import { Produit } from '../../../modeles/produit.model';

@Component({
  selector: 'app-categorie-produits',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fo-section" *ngIf="!loading">
      <div class="fo-section-container">
        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/">Accueil</a>
          <span>/</span>
          <span>{{ categorie?.nom }}</span>
        </div>

        <!-- Category Header -->
        <div class="fo-category-header" *ngIf="categorie">
          <div class="fo-category-header-icon">
            <i class="bi bi-tag-fill"></i>
          </div>
          <div>
            <h1>{{ categorie.nom }}</h1>
            <p>{{ categorie.description }}</p>
          </div>
        </div>

        <!-- Search -->
        <div class="fo-filter-bar">
          <div class="fo-search-box">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Rechercher dans cette catégorie..."
                   [(ngModel)]="searchTerm" (ngModel)="filterProducts()">
          </div>
          <a routerLink="/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-grid-3x3-gap me-1"></i>Tout parcourir
          </a>
        </div>

        <!-- Product Grid -->
        <div class="fo-product-grid" *ngIf="filteredProducts.length > 0">
          <a *ngFor="let prod of filteredProducts" [routerLink]="['/catalogue', prod.id]" class="fo-product-card">
            <div class="fo-product-card-img">
              <i class="bi bi-box-seam"></i>
            </div>
            <div class="fo-product-card-body">
              <span class="fo-product-card-category">{{ prod.categorieNom }}</span>
              <h4>{{ prod.nom }}</h4>
              <p>{{ prod.description | slice:0:80 }}{{ prod.description && prod.description.length > 80 ? '...' : '' }}</p>
              <div class="fo-product-card-footer">
                <span class="fo-product-price">{{ prod.prix | number:'1.2-2' }} TND</span>
                <span class="fo-product-stock"
                      [class.in-stock]="prod.quantite > 10"
                      [class.low-stock]="prod.quantite > 0 && prod.quantite <= 10"
                      [class.out-of-stock]="prod.quantite === 0">
                  {{ prod.quantite > 10 ? 'En stock' : prod.quantite > 0 ? 'Stock faible' : 'Rupture' }}
                </span>
              </div>
            </div>
          </a>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredProducts.length === 0 && !loading" class="fo-empty-state">
          <i class="bi bi-inbox"></i>
          <p>Aucun produit dans cette catégorie.</p>
          <a routerLink="/catalogue" class="fo-btn fo-btn-outline">Parcourir le catalogue</a>
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
export class CategorieProduitsComponent implements OnInit {
  categorie: Categorie | null = null;
  products: Produit[] = [];
  filteredProducts: Produit[] = [];
  searchTerm = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private categorieService: CategorieService,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loading = true;
      this.categorieService.obtenirParId(id).subscribe({
        next: (cat) => this.categorie = cat
      });
      this.produitService.listerParCategorie(id).subscribe({
        next: (prods) => {
          this.products = prods;
          this.filteredProducts = prods;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(p =>
      !this.searchTerm || p.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
