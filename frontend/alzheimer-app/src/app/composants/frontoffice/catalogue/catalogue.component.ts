import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../../services/produit.service';
import { CategorieService } from '../../../services/categorie.service';
import { Produit } from '../../../modeles/produit.model';
import { Categorie } from '../../../modeles/categorie.model';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fo-section">
      <div class="fo-section-container">
        <h1 class="fo-page-title">Catalogue des Produits</h1>
        <p class="fo-page-subtitle">Parcourez l'ensemble de nos produits disponibles en stock.</p>

        <!-- Filters -->
        <div class="fo-filter-bar">
          <div class="fo-search-box">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Rechercher un produit..."
                   [(ngModel)]="searchTerm" (ngModel)="filterProducts()">
          </div>
          <select class="fo-filter-select" [(ngModel)]="selectedCategory" (ngModelChange)="filterProducts()">
            <option [ngValue]="0">Toutes les catégories</option>
            <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.nom }}</option>
          </select>
        </div>

        <!-- Product Grid -->
        <div class="fo-product-grid" *ngIf="!loading && filteredProducts.length > 0">
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
        <div *ngIf="!loading && filteredProducts.length === 0" class="fo-empty-state">
          <i class="bi bi-search"></i>
          <p>Aucun produit trouvé pour votre recherche.</p>
          <button class="fo-btn fo-btn-outline" (click)="resetFilters()">Réinitialiser les filtres</button>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="fo-loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CatalogueComponent implements OnInit {
  products: Produit[] = [];
  filteredProducts: Produit[] = [];
  categories: Categorie[] = [];
  searchTerm = '';
  selectedCategory = 0;
  loading = true;

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    this.categorieService.listerTout().subscribe({
      next: (cats) => this.categories = cats
    });
    this.produitService.listerTout().subscribe({
      next: (prods) => {
        this.products = prods;
        this.filteredProducts = prods;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCategory = !this.selectedCategory ||
        p.categorieId === this.selectedCategory;
      return matchSearch && matchCategory;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 0;
    this.filteredProducts = this.products;
  }
}
