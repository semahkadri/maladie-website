import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableauDeBordService } from '../../../services/tableau-de-bord.service';
import { TableauDeBord } from '../../../modeles/tableau-de-bord.model';
import { Categorie } from '../../../modeles/categorie.model';
import { Produit } from '../../../modeles/produit.model';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="fo-hero">
      <div class="fo-hero-content">
        <h1>Gestion de Stock</h1>
        <p>Plateforme de gestion de stock pour le projet Alzheimer Detection.<br>
           Consultez notre catalogue de produits et explorez les catégories disponibles.</p>
        <a routerLink="/catalogue" class="fo-hero-btn">
          <i class="bi bi-grid-3x3-gap me-2"></i>Parcourir le Catalogue
        </a>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="fo-section" *ngIf="dashboard">
      <div class="fo-section-container">
        <h2 class="fo-section-title">En chiffres</h2>
        <div class="fo-stats-grid">
          <div class="fo-stat-card">
            <div class="fo-stat-icon" style="background: var(--primary-light); color: var(--primary);">
              <i class="bi bi-box-seam-fill"></i>
            </div>
            <div class="fo-stat-number">{{ dashboard.totalProduits }}</div>
            <div class="fo-stat-label">Produits</div>
          </div>
          <div class="fo-stat-card">
            <div class="fo-stat-icon" style="background: var(--accent-light); color: var(--accent);">
              <i class="bi bi-tags-fill"></i>
            </div>
            <div class="fo-stat-number">{{ dashboard.totalCategories }}</div>
            <div class="fo-stat-label">Catégories</div>
          </div>
          <div class="fo-stat-card">
            <div class="fo-stat-icon" style="background: var(--success-light); color: var(--success);">
              <i class="bi bi-currency-exchange"></i>
            </div>
            <div class="fo-stat-number">{{ dashboard.valeurTotaleStock | number:'1.0-0' }}</div>
            <div class="fo-stat-label">Valeur Stock (TND)</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="fo-section" *ngIf="categories.length > 0">
      <div class="fo-section-container">
        <h2 class="fo-section-title">Catégories</h2>
        <div class="fo-category-grid">
          <a *ngFor="let cat of categories" [routerLink]="['/categories', cat.id]" class="fo-category-card">
            <div class="fo-category-icon">
              <i class="bi bi-tag-fill"></i>
            </div>
            <h3>{{ cat.nom }}</h3>
            <p>{{ cat.description | slice:0:80 }}{{ cat.description && cat.description.length > 80 ? '...' : '' }}</p>
            <span class="fo-category-count">{{ cat.nombreProduits || 0 }} produit{{ (cat.nombreProduits || 0) > 1 ? 's' : '' }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Recent Products Section -->
    <section class="fo-section" *ngIf="recentProducts.length > 0">
      <div class="fo-section-container">
        <div class="fo-section-header">
          <h2 class="fo-section-title">Derniers Produits</h2>
          <a routerLink="/catalogue" class="fo-section-link">Voir tout <i class="bi bi-arrow-right"></i></a>
        </div>
        <div class="fo-product-grid">
          <a *ngFor="let prod of recentProducts" [routerLink]="['/catalogue', prod.id]" class="fo-product-card">
            <div class="fo-product-card-img">
              <i class="bi bi-box-seam"></i>
            </div>
            <div class="fo-product-card-body">
              <span class="fo-product-card-category">{{ prod.categorieNom }}</span>
              <h4>{{ prod.nom }}</h4>
              <p>{{ prod.description | slice:0:60 }}{{ prod.description && prod.description.length > 60 ? '...' : '' }}</p>
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
      </div>
    </section>

    <!-- Loading -->
    <div *ngIf="loading" class="fo-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
  `
})
export class AccueilComponent implements OnInit {
  dashboard: TableauDeBord | null = null;
  categories: Categorie[] = [];
  recentProducts: Produit[] = [];
  loading = true;

  constructor(private dashboardService: TableauDeBordService) {}

  ngOnInit(): void {
    this.dashboardService.obtenirTableauDeBord().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.categories = data.dernieresCategories || [];
        this.recentProducts = (data.derniersProduits || []).slice(0, 6);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
