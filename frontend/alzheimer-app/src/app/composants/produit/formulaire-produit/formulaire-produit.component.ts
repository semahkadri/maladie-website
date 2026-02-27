import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Produit } from '../../../modeles/produit.model';
import { Categorie } from '../../../modeles/categorie.model';
import { ProduitService } from '../../../services/produit.service';
import { CategorieService } from '../../../services/categorie.service';
import { TraductionService } from '../../../services/traduction.service';

@Component({
  selector: 'app-formulaire-produit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h2 class="page-title">
          <i class="bi me-2 text-gradient" [ngClass]="estModification ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
          {{ estModification ? t.tr('fp.modifierTitre') : t.tr('fp.nouveauTitre') }}
        </h2>
        <p class="page-subtitle">{{ estModification ? t.tr('fp.modifierSousTitre') : t.tr('fp.nouveauSousTitre') }}</p>
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
            <div class="card-header" style="background: linear-gradient(135deg, #1a73e8, #1557b0); color: white;">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>{{ t.tr('fp.infos') }}
              </h5>
            </div>
            <div class="card-body">
              <form #formulaire="ngForm" (ngSubmit)="sauvegarder()">

                <div class="mb-3">
                  <label for="nom" class="form-label">{{ t.tr('common.nom') }} <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="nom" name="nom"
                         [(ngModel)]="produit.nom" required minlength="2" maxlength="100"
                         #nom="ngModel" [placeholder]="t.tr('fp.placeholderNom')"
                         [ngClass]="{'is-invalid': nom.invalid && nom.touched}">
                  <div class="invalid-feedback" *ngIf="nom.errors?.['required']">
                    {{ t.tr('fp.nomObligatoire') }}
                  </div>
                  <div class="invalid-feedback" *ngIf="nom.errors?.['minlength']">
                    {{ t.tr('fp.nomMin') }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">{{ t.tr('common.description') }}</label>
                  <textarea class="form-control" id="description" name="description"
                            rows="3" [(ngModel)]="produit.description"
                            maxlength="500" [placeholder]="t.tr('fp.placeholderDesc')"></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="prix" class="form-label">{{ t.tr('fp.prixLabel') }} <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="prix" name="prix"
                           [(ngModel)]="produit.prix" required min="0.01" step="0.01"
                           #prix="ngModel" placeholder="0.00"
                           [ngClass]="{'is-invalid': prix.invalid && prix.touched}">
                    <div class="invalid-feedback">{{ t.tr('fp.prixInvalide') }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="quantite" class="form-label">{{ t.tr('fp.quantiteLabel') }} <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="quantite" name="quantite"
                           [(ngModel)]="produit.quantite" required min="0"
                           #quantite="ngModel" placeholder="0"
                           [ngClass]="{'is-invalid': quantite.invalid && quantite.touched}">
                    <div class="invalid-feedback">{{ t.tr('fp.quantiteInvalide') }}</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">{{ t.tr('fp.imageLabel') }}</label>

                  <!-- Drop zone (no image) -->
                  <div *ngIf="!previewUrl && (!produit.imageUrl || imageSupprimee)"
                       class="upload-zone"
                       [class.drag-over]="isDragOver"
                       (click)="fileInput.click()"
                       (dragover)="onDragOver($event)"
                       (dragleave)="onDragLeave($event)"
                       (drop)="onDrop($event)">
                    <i class="bi bi-cloud-arrow-up" style="font-size: 2rem; color: var(--primary, #1a73e8);"></i>
                    <p class="mb-1 mt-2" style="font-weight: 500;">{{ t.tr('fp.placeholderImage') }}</p>
                    <small class="text-muted">{{ t.tr('fp.formatImage') }}</small>
                  </div>

                  <!-- Image preview -->
                  <div *ngIf="previewUrl || (produit.imageUrl && !imageSupprimee)" class="upload-preview">
                    <img [src]="previewUrl || produit.imageUrl" alt="Aperçu"
                         style="max-height: 160px; border-radius: 8px; object-fit: cover;">
                    <div class="mt-2 d-flex gap-2">
                      <button type="button" class="btn btn-sm btn-outline-primary" (click)="fileInput.click()">
                        <i class="bi bi-arrow-repeat me-1"></i>{{ t.tr('fp.changeImage') }}
                      </button>
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="supprimerImageLocale()">
                        <i class="bi bi-trash me-1"></i>{{ t.tr('fp.removeImage') }}
                      </button>
                    </div>
                  </div>

                  <!-- Hidden file input -->
                  <input type="file" #fileInput accept="image/jpeg,image/png,image/gif,image/webp"
                         style="display: none;" (change)="onFichierSelectionne($event)">

                  <!-- Error -->
                  <div *ngIf="erreurImage" class="text-danger mt-2" style="font-size: 0.85rem;">
                    <i class="bi bi-exclamation-circle me-1"></i>{{ erreurImage }}
                  </div>
                </div>

                <div class="mb-4">
                  <label for="categorie" class="form-label">{{ t.tr('fp.categorieLabel') }} <span class="text-danger">*</span></label>
                  <select class="form-select" id="categorie" name="categorieId"
                          [(ngModel)]="produit.categorieId" required
                          #cat="ngModel"
                          [ngClass]="{'is-invalid': cat.invalid && cat.touched}">
                    <option [ngValue]="0" disabled>{{ t.tr('fp.selectCategorie') }}</option>
                    <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.nom }}</option>
                  </select>
                  <div class="invalid-feedback">{{ t.tr('fp.categorieObligatoire') }}</div>
                </div>

                <!-- Stock preview -->
                <div *ngIf="produit.prix > 0 && produit.quantite >= 0" class="alert mb-4"
                     [ngClass]="produit.quantite > 10 ? 'alert-success' : produit.quantite > 0 ? 'alert-danger' : 'alert-danger'"
                     style="font-size: 0.85rem;">
                  <i class="bi bi-calculator me-1"></i>
                  <strong>{{ t.tr('fp.valeurStock') }}</strong> {{ produit.prix * produit.quantite | number:'1.2-2' }} TND
                  <span *ngIf="produit.quantite === 0" class="ms-2">
                    <i class="bi bi-exclamation-triangle"></i> {{ t.tr('fp.enRupture') }}
                  </span>
                  <span *ngIf="produit.quantite > 0 && produit.quantite <= 10" class="ms-2">
                    <i class="bi bi-exclamation-triangle"></i> {{ t.tr('fp.stockFaible') }}
                  </span>
                </div>

                <div class="d-flex justify-content-between">
                  <a routerLink="/admin/produits" class="btn btn-secondary">
                    <i class="bi bi-arrow-left me-1"></i>{{ t.tr('common.retour') }}
                  </a>
                  <button type="submit" class="btn btn-primary"
                          [disabled]="formulaire.invalid || enCours || produit.categorieId === 0">
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
  `,
  styles: [`
    .upload-zone {
      border: 2px dashed var(--border, #ccc);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      background: var(--bg-secondary, #f8f9fa);
    }
    .upload-zone:hover, .upload-zone.drag-over {
      border-color: var(--primary, #1a73e8);
      background: rgba(26, 115, 232, 0.05);
    }
    .upload-preview {
      text-align: center;
      padding: 1rem;
      border: 1px solid var(--border, #ddd);
      border-radius: 12px;
      background: var(--bg-secondary, #f8f9fa);
    }
  `]
})
export class FormulaireProduitComponent implements OnInit {
  produit: Produit = {
    nom: '',
    description: '',
    prix: 0,
    quantite: 0,
    imageUrl: '',
    categorieId: 0
  };
  categories: Categorie[] = [];
  estModification = false;
  enCours = false;
  chargement = false;
  erreur = '';
  produitId: number | null = null;

  // Image upload state
  fichierSelectionne: File | null = null;
  previewUrl: string | null = null;
  imageSupprimee = false;
  isDragOver = false;
  erreurImage = '';

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private router: Router,
    private route: ActivatedRoute,
    public t: TraductionService
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
          this.erreur = this.t.tr('fp.erreurChargement');
          this.chargement = false;
        }
      });
    }
  }

  chargerCategories(): void {
    this.categorieService.listerTout().subscribe({
      next: (data) => this.categories = data,
      error: () => this.erreur = this.t.tr('fp.erreurCategories')
    });
  }

  // ─── Image handling ─────────────────────────────────────

  onFichierSelectionne(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.traiterFichier(input.files[0]);
      input.value = ''; // reset so same file can be re-selected
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.traiterFichier(event.dataTransfer.files[0]);
    }
  }

  private traiterFichier(fichier: File): void {
    this.erreurImage = '';

    const typesAcceptes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!typesAcceptes.includes(fichier.type)) {
      this.erreurImage = this.t.tr('fp.erreurFormat');
      return;
    }
    if (fichier.size > 5 * 1024 * 1024) {
      this.erreurImage = this.t.tr('fp.erreurTaille');
      return;
    }

    this.fichierSelectionne = fichier;
    this.imageSupprimee = false;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(fichier);
  }

  supprimerImageLocale(): void {
    this.fichierSelectionne = null;
    this.previewUrl = null;
    this.erreurImage = '';
    this.imageSupprimee = true;
  }

  // ─── Save (two-step: JSON then image) ─────────────────

  sauvegarder(): void {
    this.enCours = true;
    this.erreur = '';

    const produitData = { ...this.produit };

    if (this.estModification && this.produitId) {
      this.produitService.modifier(this.produitId, produitData).subscribe({
        next: (saved) => this.gererImageApresSauvegarde(saved.id!),
        error: (err) => {
          this.enCours = false;
          this.erreur = err.error?.message || this.t.tr('fp.erreurModification');
        }
      });
    } else {
      this.produitService.creer(produitData).subscribe({
        next: (saved) => this.gererImageApresSauvegarde(saved.id!),
        error: (err) => {
          this.enCours = false;
          this.erreur = err.error?.message || this.t.tr('fp.erreurCreation');
        }
      });
    }
  }

  private gererImageApresSauvegarde(produitId: number): void {
    if (this.fichierSelectionne) {
      this.produitService.uploaderImage(produitId, this.fichierSelectionne).subscribe({
        next: () => this.router.navigate(['/admin/produits']),
        error: () => {
          this.erreur = this.t.tr('fp.erreurUpload');
          this.enCours = false;
        }
      });
    } else if (this.imageSupprimee) {
      this.produitService.supprimerImage(produitId).subscribe({
        next: () => this.router.navigate(['/admin/produits']),
        error: () => {
          this.erreur = this.t.tr('fp.erreurUpload');
          this.enCours = false;
        }
      });
    } else {
      this.router.navigate(['/admin/produits']);
    }
  }
}
