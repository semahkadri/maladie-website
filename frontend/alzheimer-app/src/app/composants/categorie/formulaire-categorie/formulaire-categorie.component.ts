import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Categorie } from '../../../modeles/categorie.model';
import { CategorieService } from '../../../services/categorie.service';
import { TraductionService } from '../../../services/traduction.service';

@Component({
  selector: 'app-formulaire-categorie',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h2 class="page-title">
          <i class="bi me-2 text-gradient" [ngClass]="estModification ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
          {{ estModification ? t.tr('fc.modifierTitre') : t.tr('fc.nouveauTitre') }}
        </h2>
        <p class="page-subtitle">{{ estModification ? t.tr('fc.modifierSousTitre') : t.tr('fc.nouveauSousTitre') }}</p>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
        </div>
        <p class="mt-3 text-muted">{{ t.tr('common.chargement') }}</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="erreur" class="alert alert-danger mb-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ erreur }}
      </div>

      <div *ngIf="!chargement" class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header card-header-gradient">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>{{ t.tr('fc.infos') }}
              </h5>
            </div>
            <div class="card-body">
              <form #formulaire="ngForm" (ngSubmit)="sauvegarder()">

                <div class="mb-3">
                  <label for="nom" class="form-label">{{ t.tr('common.nom') }} <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="nom" name="nom"
                         [(ngModel)]="categorie.nom" required minlength="2" maxlength="100"
                         #nom="ngModel" [placeholder]="t.tr('fc.placeholderNom')"
                         [ngClass]="{'is-invalid': nom.invalid && nom.touched}">
                  <div class="invalid-feedback" *ngIf="nom.errors?.['required']">
                    {{ t.tr('fc.nomObligatoire') }}
                  </div>
                  <div class="invalid-feedback" *ngIf="nom.errors?.['minlength']">
                    {{ t.tr('fc.nomMin') }}
                  </div>
                </div>

                <div class="mb-4">
                  <label for="description" class="form-label">{{ t.tr('common.description') }}</label>
                  <textarea class="form-control" id="description" name="description"
                            rows="4" [(ngModel)]="categorie.description"
                            maxlength="500" #desc="ngModel"
                            [placeholder]="t.tr('fc.placeholderDesc')"></textarea>
                  <small class="text-muted mt-1 d-block">{{ categorie.description?.length || 0 }}/500 {{ t.tr('fc.caracteres') }}</small>
                </div>

                <div class="d-flex justify-content-between">
                  <a routerLink="/admin/categories" class="btn btn-secondary">
                    <i class="bi bi-arrow-left me-1"></i>{{ t.tr('common.retour') }}
                  </a>
                  <button type="submit" class="btn btn-primary"
                          [disabled]="formulaire.invalid || enCours">
                    <span *ngIf="enCours" class="spinner-border spinner-border-sm me-1"></span>
                    <i *ngIf="!enCours" class="bi bi-check-lg me-1"></i>
                    {{ estModification ? t.tr('common.modifier') : t.tr('common.creer') }}
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
export class FormulaireCategorieComponent implements OnInit {
  categorie: Categorie = { nom: '', description: '' };
  estModification = false;
  enCours = false;
  chargement = false;
  erreur = '';
  categorieId: number | null = null;

  constructor(
    private categorieService: CategorieService,
    private router: Router,
    private route: ActivatedRoute,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.estModification = true;
      this.categorieId = +id;
      this.chargement = true;
      this.categorieService.obtenirParId(this.categorieId).subscribe({
        next: (data) => {
          this.categorie = data;
          this.chargement = false;
        },
        error: () => {
          this.erreur = this.t.tr('fc.erreurChargement');
          this.chargement = false;
        }
      });
    }
  }

  sauvegarder(): void {
    this.enCours = true;
    this.erreur = '';

    if (this.estModification && this.categorieId) {
      this.categorieService.modifier(this.categorieId, this.categorie).subscribe({
        next: () => this.router.navigate(['/admin/categories']),
        error: (err) => {
          this.enCours = false;
          this.erreur = err.error?.message || this.t.tr('fc.erreurModification');
        }
      });
    } else {
      this.categorieService.creer(this.categorie).subscribe({
        next: () => this.router.navigate(['/admin/categories']),
        error: (err) => {
          this.enCours = false;
          this.erreur = err.error?.message || this.t.tr('fc.erreurCreation');
        }
      });
    }
  }
}
