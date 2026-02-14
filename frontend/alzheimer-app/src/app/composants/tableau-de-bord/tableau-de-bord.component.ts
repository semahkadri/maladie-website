import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategorieService } from '../../services/categorie.service';
import { ProduitService } from '../../services/produit.service';
import { Categorie } from '../../modeles/categorie.model';
import { Produit } from '../../modeles/produit.model';

@Component({
  selector: 'app-tableau-de-bord',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="container">
          <h1><i class="bi bi-heart-pulse me-2"></i>Tableau de Bord</h1>
          <p class="mb-0">Gestion de Stock - Détection Maladie Alzheimer</p>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <a routerLink="/categories" class="stat-card">
            <div class="d-flex align-items-center">
              <div class="stat-icon me-3" style="background: var(--primary-light); color: var(--primary);">
                <i class="bi bi-tags"></i>
              </div>
              <div>
                <div class="stat-number">{{ totalCategories }}</div>
                <div class="stat-label">Catégories</div>
              </div>
            </div>
          </a>
        </div>
        <div class="col-md-4">
          <a routerLink="/produits" class="stat-card">
            <div class="d-flex align-items-center">
              <div class="stat-icon me-3" style="background: var(--accent-light); color: var(--accent);">
                <i class="bi bi-box-seam"></i>
              </div>
              <div>
                <div class="stat-number">{{ totalProduits }}</div>
                <div class="stat-label">Produits</div>
              </div>
            </div>
          </a>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <div class="d-flex align-items-center">
              <div class="stat-icon me-3" style="background: var(--warning-light); color: var(--warning);">
                <i class="bi bi-exclamation-triangle"></i>
              </div>
              <div>
                <div class="stat-number">{{ produitsStockBas }}</div>
                <div class="stat-label">Stock Faible (&le; 10)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent data -->
      <div class="row g-4">
        <!-- Catégories récentes -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0 fw-bold"><i class="bi bi-tags me-2"></i>Catégories</h6>
              <a routerLink="/categories" class="btn btn-sm btn-primary">Voir tout</a>
            </div>
            <div class="card-body p-0">
              <div *ngIf="categories.length === 0" class="empty-state">
                <i class="bi bi-inbox d-block"></i>
                <p>Aucune catégorie</p>
              </div>
              <div class="list-group list-group-flush" *ngIf="categories.length > 0">
                <div *ngFor="let cat of categories.slice(0, 5)" class="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                  <div>
                    <span class="fw-semibold">{{ cat.nom }}</span>
                    <small class="d-block text-muted">{{ cat.description | slice:0:50 }}{{ (cat.description?.length || 0) > 50 ? '...' : '' }}</small>
                  </div>
                  <span class="badge badge-category">{{ cat.nombreProduits }} produit{{ cat.nombreProduits !== 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Produits récents -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0 fw-bold"><i class="bi bi-box-seam me-2"></i>Produits</h6>
              <a routerLink="/produits" class="btn btn-sm btn-primary">Voir tout</a>
            </div>
            <div class="card-body p-0">
              <div *ngIf="produits.length === 0" class="empty-state">
                <i class="bi bi-inbox d-block"></i>
                <p>Aucun produit</p>
              </div>
              <div class="list-group list-group-flush" *ngIf="produits.length > 0">
                <div *ngFor="let prod of produits.slice(0, 5)" class="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                  <div>
                    <span class="fw-semibold">{{ prod.nom }}</span>
                    <small class="d-block text-muted">{{ prod.categorieNom }}</small>
                  </div>
                  <div class="text-end">
                    <span class="fw-bold">{{ prod.prix | number:'1.2-2' }} TND</span>
                    <small class="d-block">
                      <span class="badge" [ngClass]="prod.quantite > 10 ? 'bg-success' : prod.quantite > 0 ? 'bg-warning' : 'bg-danger'">
                        Qté: {{ prod.quantite }}
                      </span>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TableauDeBordComponent implements OnInit {
  categories: Categorie[] = [];
  produits: Produit[] = [];
  totalCategories = 0;
  totalProduits = 0;
  produitsStockBas = 0;

  constructor(
    private categorieService: CategorieService,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    this.categorieService.listerTout().subscribe({
      next: (data) => {
        this.categories = data;
        this.totalCategories = data.length;
      }
    });

    this.produitService.listerTout().subscribe({
      next: (data) => {
        this.produits = data;
        this.totalProduits = data.length;
        this.produitsStockBas = data.filter(p => p.quantite <= 10).length;
      }
    });
  }
}
