import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableauDeBordService } from '../../services/tableau-de-bord.service';
import { TableauDeBord } from '../../modeles/tableau-de-bord.model';
import { Categorie } from '../../modeles/categorie.model';
import { Commande } from '../../modeles/commande.model';
import { Produit } from '../../modeles/produit.model';
import { TraductionService } from '../../services/traduction.service';

@Component({
  selector: 'app-tableau-de-bord',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="dashboard-header">
        <h1><i class="bi bi-grid-1x2-fill me-2"></i>{{ t.tr('tdb.titre') }}</h1>
        <p>{{ t.tr('tdb.sousTitre') }}</p>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
        </div>
        <p class="mt-3 text-muted">{{ t.tr('tdb.chargement') }}</p>
      </div>

      <!-- Error -->
      <div *ngIf="erreur" class="alert alert-danger d-flex align-items-center" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <div>
          {{ t.tr('tdb.erreurChargement') }}
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="chargerDonnees()">
            <i class="bi bi-arrow-clockwise me-1"></i>{{ t.tr('tdb.reessayer') }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement && !erreur">
        <!-- Stat Cards -->
        <div class="row g-3 mb-4">
          <div class="col-lg-3 col-md-6">
            <a routerLink="/admin/categories" class="stat-card">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3" style="background: var(--primary-light); color: var(--primary);">
                  <i class="bi bi-tags-fill"></i>
                </div>
                <div>
                  <div class="stat-number">{{ totalCategories }}</div>
                  <div class="stat-label">{{ t.tr('tdb.categories') }}</div>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-3 col-md-6">
            <a routerLink="/admin/produits" class="stat-card">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3" style="background: var(--accent-light); color: var(--accent);">
                  <i class="bi bi-box-seam-fill"></i>
                </div>
                <div>
                  <div class="stat-number">{{ totalProduits }}</div>
                  <div class="stat-label">{{ t.tr('tdb.produits') }}</div>
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
                  <div class="stat-label">{{ t.tr('tdb.stockFaible') }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3" style="background: var(--success-light); color: var(--success);">
                  <i class="bi bi-cash-stack"></i>
                </div>
                <div>
                  <div class="stat-number" style="font-size: 1.4rem;">{{ valeurTotaleStock | number:'1.0-0' }}</div>
                  <div class="stat-label">{{ t.tr('tdb.valeurStock') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Stat Cards -->
        <div class="row g-3 mb-4">
          <div class="col-lg-4 col-md-6">
            <a routerLink="/admin/commandes" class="stat-card">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3" style="background: var(--primary-light); color: var(--primary);">
                  <i class="bi bi-receipt-cutoff"></i>
                </div>
                <div>
                  <div class="stat-number">{{ totalCommandes }}</div>
                  <div class="stat-label">{{ t.tr('tdb.commandes') }}</div>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-4 col-md-6">
            <a routerLink="/admin/commandes" class="stat-card">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3" style="background: var(--warning-light); color: var(--warning);">
                  <i class="bi bi-hourglass-split"></i>
                </div>
                <div>
                  <div class="stat-number">{{ commandesEnAttente }}</div>
                  <div class="stat-label">{{ t.tr('tdb.enAttente') }}</div>
                </div>
              </div>
            </a>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="stat-card">
              <div class="d-flex align-items-center">
                <div class="stat-icon me-3" style="background: var(--success-light); color: var(--success);">
                  <i class="bi bi-currency-dollar"></i>
                </div>
                <div>
                  <div class="stat-number" style="font-size: 1.4rem;">{{ chiffreAffaires | number:'1.0-0' }}</div>
                  <div class="stat-label">{{ t.tr('tdb.chiffreAffaires') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rupture de stock -->
        <div *ngIf="produitsEnRupture > 0" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <i class="bi bi-x-circle-fill me-2 fs-5"></i>
          <div>
            <strong>{{ t.tr('tdb.alerteRupture') }}</strong> {{ produitsEnRupture }} {{ produitsEnRupture !== 1 ? t.tr('common.produits') : t.tr('common.produit') }} {{ t.tr('tdb.enRuptureMsg') }}
            <a routerLink="/admin/produits" class="ms-2 text-decoration-underline" style="color: inherit;">{{ t.tr('tdb.voirProduits') }}</a>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <a routerLink="/admin/categories/ajouter" class="quick-action">
              <i class="bi bi-plus-circle-fill" style="background: var(--primary-light); color: var(--primary);"></i>
              <div>
                <span>{{ t.tr('tdb.nouvelleCat') }}</span>
                <small>{{ t.tr('tdb.ajouterCat') }}</small>
              </div>
            </a>
          </div>
          <div class="col-md-3">
            <a routerLink="/admin/produits/ajouter" class="quick-action">
              <i class="bi bi-plus-circle-fill" style="background: var(--accent-light); color: var(--accent);"></i>
              <div>
                <span>{{ t.tr('tdb.nouveauProd') }}</span>
                <small>{{ t.tr('tdb.ajouterProd') }}</small>
              </div>
            </a>
          </div>
          <div class="col-md-3">
            <a routerLink="/admin/produits" class="quick-action">
              <i class="bi bi-list-ul" style="background: var(--warning-light); color: var(--warning);"></i>
              <div>
                <span>{{ t.tr('tdb.voirStock') }}</span>
                <small>{{ t.tr('tdb.listeComplete') }}</small>
              </div>
            </a>
          </div>
          <div class="col-md-3">
            <a routerLink="/admin/commandes" class="quick-action">
              <i class="bi bi-receipt-cutoff" style="background: var(--primary-light); color: var(--primary);"></i>
              <div>
                <span>{{ t.tr('tdb.voirCommandes') }}</span>
                <small>{{ t.tr('tdb.gererCommandes') }}</small>
              </div>
            </a>
          </div>
        </div>

        <!-- Smart Alerts Panel -->
        <div *ngIf="alertesExpiration.length > 0 || alertesReapprovisionnement.length > 0" class="row g-3 mb-4">
          <!-- Expiry Alerts -->
          <div class="col-lg-6" *ngIf="alertesExpiration.length > 0">
            <div class="card fo-alert-card fo-alert-card-expiry">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">
                  <i class="bi bi-calendar-x-fill me-2" style="color: var(--danger, #dc3545);"></i>{{ t.tr('tdb.alerteExpiration') }}
                </h6>
                <div class="d-flex gap-2">
                  <span *ngIf="produitsExpires > 0" class="badge bg-danger">{{ produitsExpires }} {{ t.tr('tdb.produitsExpires') | lowercase }}</span>
                  <span *ngIf="produitsExpirantBientot > 0" class="badge bg-warning text-dark">{{ produitsExpirantBientot }} {{ t.tr('tdb.expirantBientot') | lowercase }}</span>
                </div>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <div *ngFor="let prod of alertesExpiration" class="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                    <div>
                      <span class="fw-semibold">{{ prod.nom }}</span>
                      <small class="d-block text-muted">{{ prod.categorieNom }}
                        <span *ngIf="prod.numeroLot"> &middot; {{ t.tr('tdb.lotLabel') }} {{ prod.numeroLot }}</span>
                      </small>
                    </div>
                    <div class="text-end">
                      <span *ngIf="prod.joursAvantExpiration !== undefined && prod.joursAvantExpiration < 0"
                            class="badge bg-danger">{{ t.tr('tdb.dejExpire') }}</span>
                      <span *ngIf="prod.joursAvantExpiration !== undefined && prod.joursAvantExpiration >= 0"
                            class="badge" [ngClass]="prod.joursAvantExpiration <= 7 ? 'bg-danger' : 'bg-warning text-dark'">
                        {{ prod.joursAvantExpiration }}{{ t.tr('tdb.joursRestants') }}
                      </span>
                      <small class="d-block text-muted">{{ prod.dateExpiration }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reorder Alerts -->
          <div [class.col-lg-6]="alertesExpiration.length > 0" [class.col-lg-12]="alertesExpiration.length === 0"
               *ngIf="alertesReapprovisionnement.length > 0">
            <div class="card fo-alert-card fo-alert-card-reorder">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">
                  <i class="bi bi-arrow-repeat me-2" style="color: var(--warning, #f59e0b);"></i>{{ t.tr('tdb.alerteReappro') }}
                </h6>
                <span class="badge bg-warning text-dark">{{ alertesReapprovisionnement.length }} {{ t.isFr ? 'produits' : 'products' }}</span>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <a *ngFor="let prod of alertesReapprovisionnement" [routerLink]="['/admin/produits/modifier', prod.id]"
                     class="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-4 py-3">
                    <div>
                      <span class="fw-semibold">{{ prod.nom }}</span>
                      <small class="d-block text-muted">{{ prod.categorieNom }}</small>
                    </div>
                    <div class="text-end">
                      <span class="badge" [ngClass]="prod.quantite <= 2 ? 'bg-danger' : 'bg-warning text-dark'">
                        {{ prod.quantite }} {{ t.tr('tdb.stockUrgent') }}
                      </span>
                      <small class="d-block text-muted">{{ prod.prix | number:'1.2-2' }} TND</small>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent data -->
        <div class="row g-4">
          <!-- Catégories récentes -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold"><i class="bi bi-tags-fill me-2 text-primary"></i>{{ t.tr('tdb.dernieresCat') }}</h6>
                <a routerLink="/admin/categories" class="btn btn-sm btn-outline-primary">
                  {{ t.tr('common.voirTout') }} <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              <div class="card-body p-0">
                <div *ngIf="categories.length === 0" class="empty-state">
                  <i class="bi bi-inbox d-block"></i>
                  <p>{{ t.tr('tdb.aucuneCat') }}</p>
                  <a routerLink="/admin/categories/ajouter" class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-circle me-1"></i>{{ t.tr('common.ajouter') }}
                  </a>
                </div>
                <div class="list-group list-group-flush" *ngIf="categories.length > 0">
                  <div *ngFor="let cat of categories" class="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                    <div>
                      <span class="fw-semibold">{{ cat.nom }}</span>
                      <small class="d-block text-muted">{{ (cat.description || '') | slice:0:50 }}{{ (cat.description?.length || 0) > 50 ? '...' : '' }}</small>
                    </div>
                    <span class="badge badge-category">{{ cat.nombreProduits }} {{ cat.nombreProduits !== 1 ? t.tr('common.produits') : t.tr('common.produit') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Produits récents -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold"><i class="bi bi-box-seam-fill me-2 text-primary"></i>{{ t.tr('tdb.derniersProd') }}</h6>
                <a routerLink="/admin/produits" class="btn btn-sm btn-outline-primary">
                  {{ t.tr('common.voirTout') }} <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              <div class="card-body p-0">
                <div *ngIf="produits.length === 0" class="empty-state">
                  <i class="bi bi-inbox d-block"></i>
                  <p>{{ t.tr('tdb.aucunProd') }}</p>
                  <a routerLink="/admin/produits/ajouter" class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-circle me-1"></i>{{ t.tr('common.ajouter') }}
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
                          {{ t.tr('tdb.qte') }} {{ prod.quantite }}
                        </span>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Dernières Commandes -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold"><i class="bi bi-receipt-cutoff me-2 text-primary"></i>{{ t.tr('tdb.dernieresCmd') }}</h6>
                <a routerLink="/admin/commandes" class="btn btn-sm btn-outline-primary">
                  {{ t.tr('common.voirTout') }} <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              <div class="card-body p-0">
                <div *ngIf="commandes.length === 0" class="empty-state">
                  <i class="bi bi-inbox d-block"></i>
                  <p>{{ t.tr('tdb.aucuneCmd') }}</p>
                </div>
                <div class="list-group list-group-flush" *ngIf="commandes.length > 0">
                  <a *ngFor="let cmd of commandes" [routerLink]="['/admin/commandes', cmd.id]"
                     class="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-4 py-3">
                    <div>
                      <span class="fw-semibold" style="font-size: 0.88rem;">{{ cmd.reference }}</span>
                      <small class="d-block text-muted">{{ cmd.nomClient }}</small>
                    </div>
                    <div class="text-end">
                      <span class="fw-bold" style="font-size: 0.88rem;">{{ cmd.montantTotal | number:'1.2-2' }} TND</span>
                      <small class="d-block">
                        <span class="cmd-badge" [ngClass]="{
                          'cmd-en-attente': cmd.statut === 'EN_ATTENTE',
                          'cmd-confirmee': cmd.statut === 'CONFIRMEE',
                          'cmd-en-preparation': cmd.statut === 'EN_PREPARATION',
                          'cmd-expediee': cmd.statut === 'EXPEDIEE',
                          'cmd-livree': cmd.statut === 'LIVREE',
                          'cmd-annulee': cmd.statut === 'ANNULEE'
                        }">{{ t.tr('lcmd.' + getStatutKey(cmd.statut)) }}</span>
                      </small>
                    </div>
                  </a>
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
  commandes: Commande[] = [];
  totalCategories = 0;
  totalProduits = 0;
  produitsStockBas = 0;
  produitsEnRupture = 0;
  valeurTotaleStock = 0;
  totalCommandes = 0;
  commandesEnAttente = 0;
  chiffreAffaires = 0;
  produitsExpires = 0;
  produitsExpirantBientot = 0;
  alertesExpiration: Produit[] = [];
  alertesReapprovisionnement: Produit[] = [];
  chargement = true;
  erreur = false;

  constructor(
    private tableauDeBordService: TableauDeBordService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  getStatutKey(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'enAttente', 'CONFIRMEE': 'confirmee', 'EN_PREPARATION': 'enPreparation',
      'EXPEDIEE': 'expediee', 'LIVREE': 'livree', 'ANNULEE': 'annulee'
    };
    return map[statut] || 'enAttente';
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
        this.totalCommandes = data.totalCommandes;
        this.commandesEnAttente = data.commandesEnAttente;
        this.chiffreAffaires = data.chiffreAffaires;
        this.commandes = data.dernieresCommandes || [];
        this.produitsExpires = data.produitsExpires || 0;
        this.produitsExpirantBientot = data.produitsExpirantBientot || 0;
        this.alertesExpiration = data.alertesExpiration || [];
        this.alertesReapprovisionnement = data.alertesReapprovisionnement || [];
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
        this.erreur = true;
      }
    });
  }
}
