import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Categorie } from '../../../modeles/categorie.model';
import { CategorieService } from '../../../services/categorie.service';

@Component({
  selector: 'app-liste-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in">
      <div class="page-header d-flex justify-content-between align-items-center">
        <div>
          <h2 class="page-title">
            <i class="bi bi-tags me-2 text-gradient"></i>Gestion des Catégories
          </h2>
          <p class="page-subtitle">{{ categories.length }} catégorie{{ categories.length !== 1 ? 's' : '' }} au total</p>
        </div>
        <a routerLink="/categories/ajouter" class="btn btn-primary">
          <i class="bi bi-plus-circle me-1"></i>Nouvelle Catégorie
        </a>
      </div>

      <div *ngIf="message" class="alert" [ngClass]="messageType === 'success' ? 'alert-success' : 'alert-danger'"
           role="alert">
        <i class="bi me-2" [ngClass]="messageType === 'success' ? 'bi-check-circle' : 'bi-x-circle'"></i>
        {{ message }}
        <button type="button" class="btn-close float-end" (click)="message = ''"></button>
      </div>

      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Nb. Produits</th>
                  <th>Date Création</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="categories.length === 0">
                  <td colspan="6" class="text-center">
                    <div class="empty-state">
                      <i class="bi bi-inbox d-block"></i>
                      <p>Aucune catégorie trouvée</p>
                      <a routerLink="/categories/ajouter" class="btn btn-primary btn-sm">
                        <i class="bi bi-plus-circle me-1"></i>Ajouter une catégorie
                      </a>
                    </div>
                  </td>
                </tr>
                <tr *ngFor="let categorie of categories">
                  <td><span class="text-muted">#{{ categorie.id }}</span></td>
                  <td class="fw-semibold">{{ categorie.nom }}</td>
                  <td class="text-muted">{{ categorie.description }}</td>
                  <td>
                    <span class="badge badge-category badge-stock">{{ categorie.nombreProduits }}</span>
                  </td>
                  <td>{{ categorie.dateCreation | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="text-center">
                    <div class="btn-action-group">
                      <a [routerLink]="['/categories/modifier', categorie.id]"
                         class="btn btn-sm btn-warning">
                        <i class="bi bi-pencil"></i> Modifier
                      </a>
                      <button class="btn btn-sm btn-danger"
                              (click)="confirmerSuppression(categorie)">
                        <i class="bi bi-trash"></i> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal de confirmation -->
      <div *ngIf="categorieASupprimer" class="modal fade show d-block" tabindex="-1"
           style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle me-2"></i>Confirmation de suppression
              </h5>
            </div>
            <div class="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer la catégorie
                <strong>{{ categorieASupprimer.nom }}</strong> ?</p>
              <div class="alert alert-danger py-2 mb-0">
                <small><i class="bi bi-info-circle me-1"></i>Cette action est irréversible et supprimera tous les produits associés.</small>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="categorieASupprimer = null">Annuler</button>
              <button class="btn btn-danger" (click)="supprimer()">
                <i class="bi bi-trash me-1"></i>Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ListeCategoriesComponent implements OnInit {
  categories: Categorie[] = [];
  message = '';
  messageType = '';
  categorieASupprimer: Categorie | null = null;

  constructor(private categorieService: CategorieService) {}

  ngOnInit(): void {
    this.chargerCategories();
  }

  chargerCategories(): void {
    this.categorieService.listerTout().subscribe({
      next: (data) => this.categories = data,
      error: (err) => {
        this.message = 'Erreur lors du chargement des catégories';
        this.messageType = 'error';
        console.error(err);
      }
    });
  }

  confirmerSuppression(categorie: Categorie): void {
    this.categorieASupprimer = categorie;
  }

  supprimer(): void {
    if (this.categorieASupprimer?.id) {
      this.categorieService.supprimer(this.categorieASupprimer.id).subscribe({
        next: () => {
          this.message = `Catégorie "${this.categorieASupprimer?.nom}" supprimée avec succès`;
          this.messageType = 'success';
          this.categorieASupprimer = null;
          this.chargerCategories();
        },
        error: (err) => {
          this.message = 'Erreur lors de la suppression';
          this.messageType = 'error';
          this.categorieASupprimer = null;
          console.error(err);
        }
      });
    }
  }
}
