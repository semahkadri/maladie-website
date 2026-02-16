import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Produit } from '../../../modeles/produit.model';
import { Categorie } from '../../../modeles/categorie.model';
import { ProduitService } from '../../../services/produit.service';
import { CategorieService } from '../../../services/categorie.service';

@Component({
  selector: 'app-formulaire-produit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h2 class="page-title">
          <i class="bi me-2 text-gradient" [ngClass]="estModification ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
          {{ estModification ? 'Modifier le Produit' : 'Nouveau Produit' }}
        </h2>
        <p class="page-subtitle">{{ estModification ? 'Modifier les informations du produit' : 'Ajouter un nouveau produit au stock' }}</p>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3 text-muted">Chargement...</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="erreur" class="alert alert-danger mb-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ erreur }}
      </div>

      <div *ngIf="!chargement" class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header" style="background: linear-gradient(135deg, #1a73e8, #1557b0); color: white;">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>Informations du Produit
              </h5>
            </div>
            <div class="card-body">
              <form #formulaire="ngForm" (ngSubmit)="sauvegarder()">

                <div class="mb-3">
                  <label for="nom" class="form-label">Nom <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="nom" name="nom"
                         [(ngModel)]="produit.nom" required minlength="2" maxlength="100"
                         #nom="ngModel" placeholder="Ex: Donépézil 10mg"
                         [ngClass]="{'is-invalid': nom.invalid && nom.touched}">
                  <div class="invalid-feedback" *ngIf="nom.errors?.['required']">
                    Le nom est obligatoire
                  </div>
                  <div class="invalid-feedback" *ngIf="nom.errors?.['minlength']">
                    Le nom doit contenir au moins 2 caractères
                  </div>
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea class="form-control" id="description" name="description"
                            rows="3" [(ngModel)]="produit.description"
                            maxlength="500" placeholder="Décrivez le produit..."></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="prix" class="form-label">Prix (TND) <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="prix" name="prix"
                           [(ngModel)]="produit.prix" required min="0.01" step="0.01"
                           #prix="ngModel" placeholder="0.00"
                           [ngClass]="{'is-invalid': prix.invalid && prix.touched}">
                    <div class="invalid-feedback">Le prix doit être supérieur à 0</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="quantite" class="form-label">Quantité <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="quantite" name="quantite"
                           [(ngModel)]="produit.quantite" required min="0"
                           #quantite="ngModel" placeholder="0"
                           [ngClass]="{'is-invalid': quantite.invalid && quantite.touched}">
                    <div class="invalid-feedback">La quantité ne peut pas être négative</div>
                  </div>
                </div>

                <div class="mb-4">
                  <label for="categorie" class="form-label">Catégorie <span class="text-danger">*</span></label>
                  <select class="form-select" id="categorie" name="categorieId"
                          [(ngModel)]="produit.categorieId" required
                          #cat="ngModel"
                          [ngClass]="{'is-invalid': cat.invalid && cat.touched}">
                    <option [ngValue]="0" disabled>-- Sélectionner une catégorie --</option>
                    <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.nom }}</option>
                  </select>
                  <div class="invalid-feedback">La catégorie est obligatoire</div>
                </div>

                <!-- Stock preview -->
                <div *ngIf="produit.prix > 0 && produit.quantite >= 0" class="alert mb-4"
                     [ngClass]="produit.quantite > 10 ? 'alert-success' : produit.quantite > 0 ? 'alert-danger' : 'alert-danger'"
                     style="font-size: 0.85rem;">
                  <i class="bi bi-calculator me-1"></i>
                  <strong>Valeur en stock :</strong> {{ produit.prix * produit.quantite | number:'1.2-2' }} TND
                  <span *ngIf="produit.quantite === 0" class="ms-2">
                    <i class="bi bi-exclamation-triangle"></i> Produit en rupture de stock
                  </span>
                  <span *ngIf="produit.quantite > 0 && produit.quantite <= 10" class="ms-2">
                    <i class="bi bi-exclamation-triangle"></i> Stock faible
                  </span>
                </div>

                <div class="d-flex justify-content-between">
                  <a routerLink="/admin/produits" class="btn btn-secondary">
                    <i class="bi bi-arrow-left me-1"></i>Retour
                  </a>
                  <button type="submit" class="btn btn-primary"
                          [disabled]="formulaire.invalid || enCours || produit.categorieId === 0">
                    <span *ngIf="enCours" class="spinner-border spinner-border-sm me-1"></span>
                    <i *ngIf="!enCours" class="bi bi-check-lg me-1"></i>
                    {{ estModification ? 'Modifier' : 'Créer' }}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FormulaireProduitComponent implements OnInit {
  produit: Produit = {
    nom: '',
    description: '',
    prix: 0,
    quantite: 0,
    categorieId: 0
  };
  categories: Categorie[] = [];
  estModification = false;
  enCours = false;
  chargement = false;
  erreur = '';
  produitId: number | null = null;

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.chargerCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.estModification = true;
      this.produitId = +id;
      this.chargement = true;
      this.produitService.obtenirParId(this.produitId).subscribe({
        next: (data) => {
          this.produit = data;
          this.chargement = false;
        },
        error: () => {
          this.erreur = 'Impossible de charger le produit';
          this.chargement = false;
        }
      });
    }
  }

  chargerCategories(): void {
    this.categorieService.listerTout().subscribe({
      next: (data) => this.categories = data,
      error: () => this.erreur = 'Impossible de charger les catégories'
    });
  }

  sauvegarder(): void {
    this.enCours = true;
    this.erreur = '';

    if (this.estModification && this.produitId) {
      this.produitService.modifier(this.produitId, this.produit).subscribe({
        next: () => this.router.navigate(['/admin/produits']),
        error: (err) => {
          this.enCours = false;
          this.erreur = err.error?.message || 'Erreur lors de la modification';
        }
      });
    } else {
      this.produitService.creer(this.produit).subscribe({
        next: () => this.router.navigate(['/admin/produits']),
        error: (err) => {
          this.enCours = false;
          this.erreur = err.error?.message || 'Erreur lors de la création';
        }
      });
    }
  }
}
