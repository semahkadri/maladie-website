import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableauDeBordService } from '../../services/tableau-de-bord.service';
import { TableauDeBord } from '../../modeles/tableau-de-bord.model';
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
        <h1><i class="bi bi-grid-1x2-fill me-2"></i>Tableau de Bord</h1>
        <p>Gestion de Stock - Plateforme Détection Maladie Alzheimer</p>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3 text-muted">Chargement du tableau de bord...</p>
      </div>

      <!-- Error -->
      <div *ngIf="erreur" class="alert alert-danger d-flex align-items-center" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <div>
          Impossible de charger les données. Vérifiez que le serveur est démarré.
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="chargerDonnees()">
            <i class="bi bi-arrow-clockwise me-1"></i>Réessayer
          </button>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement && !erreur">
        <!-- Stat Cards -->
        <div class="row g-3 mb-4">
          <div class="col-lg-3 col-md-6">
            <a routerLink="/categories" class="stat-card">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3" style="background: var(--primary-light); color: var(--primary);">
                  <i class="bi bi-tags-fill"></i>
                </div>
                <div>
                  <div class="stat-number">{{ totalCategories }}</div>
                  <div class="stat-label">Catégories</div>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-3 col-md-6">
            <a routerLink="/produits" class="stat-card">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3" style="background: var(--accent-light); color: var(--accent);">
                  <i class="bi bi-box-seam-fill"></i>
                </div>
                <div>
                  <div class="stat-number">{{ totalProduits }}</div>
                  <div class="stat-label">Produits</div>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3" style="background: var(--warning-light); color: var(--warning);">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div>
                  <div class="stat-number">{{ produitsStockBas }}</div>
                  <div class="stat-label">Stock Faible (&le; 10)</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3" style="background: #e8f5e9; color: #2e7d32;">
                  <i class="bi bi-cash-stack"></i>
                </div>
                <div>
                  <div class="stat-number" style="font-size: 1.4rem;">{{ valeurTotaleStock | number:'1.0-0' }}</div>
                  <div class="stat-label">Valeur Stock (TND)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rupture de stock -->
        <div *ngIf="produitsEnRupture > 0" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <i class="bi bi-x-circle-fill me-2 fs-5"></i>
          <div>
            <strong>Alerte :</strong> {{ produitsEnRupture }} produit{{ produitsEnRupture > 1 ? 's' : '' }} en rupture de stock !
            <a routerLink="/produits" class="ms-2 text-decoration-underline" style="color: inherit;">Voir les produits</a>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <a routerLink="/categories/ajouter" class="quick-action">
              <i class="bi bi-plus-circle-fill" style="background: var(--primary-light); color: var(--primary);"></i>
              <div>
                <span>Nouvelle Catégorie</span>
                <small>Ajouter une catégorie</small>
              </div>
            </a>
          </div>
          <div class="col-md-4">
            <a routerLink="/produits/ajouter" class="quick-action">
              <i class="bi bi-plus-circle-fill" style="background: var(--accent-light); color: var(--accent);"></i>
              <div>
                <span>Nouveau Produit</span>
                <small>Ajouter un produit au stock</small>
              </div>
            </a>
          </div>
          <div class="col-md-4">
            <a routerLink="/produits" class="quick-action">
              <i class="bi bi-list-ul" style="background: var(--warning-light); color: var(--warning);"></i>
              <div>
                <span>Voir tout le Stock</span>
                <small>Liste complète des produits</small>
              </div>
            </a>
          </div>
        </div>

        <!-- Recent data -->
        <div class="row g-4">
          <!-- Catégories récentes -->
          <div class="col-lg-6">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold"><i class="bi bi-tags-fill me-2 text-primary"></i>Dernières Catégories</h6>
                <a routerLink="/categories" class="btn btn-sm btn-outline-primary">
                  Voir tout <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              <div class="card-body p-0">
                <div *ngIf="categories.length === 0" class="empty-state">
                  <i class="bi bi-inbox d-block"></i>
                  <p>Aucune catégorie</p>
                  <a routerLink="/categories/ajouter" class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-circle me-1"></i>Ajouter
                  </a>
                </div>
                <div class="list-group list-group-flush" *ngIf="categories.length > 0">
                  <div *ngFor="let cat of categories" class="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                    <div>
                      <span class="fw-semibold">{{ cat.nom }}</span>
                      <small class="d-block text-muted">{{ cat.description | slice:0:50 }}{{ (cat.description.length || 0) > 50 ? '...' : '' }}</small>
                    </div>
                    <span class="badge badge-category">{{ cat.nombreProduits }} produit{{ cat.nombreProduits !== 1 ? 's' : '' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Produits récents -->
          <div class="col-lg-6">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold"><i class="bi bi-box-seam-fill me-2 text-primary"></i>Derniers Produits</h6>
                <a routerLink="/produits" class="btn btn-sm btn-outline-primary">
                  Voir tout <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              <div class="card-body p-0">
                <div *ngIf="produits.length === 0" class="empty-state">
                  <i class="bi bi-inbox d-block"></i>
                  <p>Aucun produit</p>
                  <a routerLink="/produits/ajouter" class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-circle me-1"></i>Ajouter
                  </a>
                </div>
                <div class="list-group list-group-flush" *ngIf="produits.length > 0">
                  <div *ngFor="let prod of produits" class="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
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
    </div>
  `
})
export class TableauDeBordComponent implements OnInit {
  categories: Categorie[] = [];
  produits: Produit[] = [];
  totalCategories = 0;
  totalProduits = 0;
  produitsStockBas = 0;
  produitsEnRupture = 0;
  valeurTotaleStock = 0;
  chargement = true;
  erreur = false;

  constructor(private tableauDeBordService: TableauDeBordService) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement = true;
    this.erreur = false;

    this.tableauDeBordService.obtenirTableauDeBord().subscribe({
      next: (data: TableauDeBord) => {
        this.totalCategories = data.totalCategories;
        this.totalProduits = data.totalProduits;
        this.produitsStockBas = data.produitsStockBas;
        this.produitsEnRupture = data.produitsEnRupture;
        this.valeurTotaleStock = data.valeurTotaleStock;
        this.categories = data.dernieresCategories;
        this.produits = data.derniersProduits;
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
        this.erreur = true;
      }
    });
  }
}
