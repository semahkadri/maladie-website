import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PanierService } from '../../../services/panier.service';
import { CommandeService } from '../../../services/commande.service';
import { TraductionService } from '../../../services/traduction.service';
import { Panier } from '../../../modeles/panier.model';
import { CreerCommande } from '../../../modeles/commande.model';

@Component({
  selector: 'app-commander',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fo-section">
      <div class="fo-section-container fade-in">

        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/"><i class="bi bi-house-door"></i></a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <a routerLink="/panier">{{ t.tr('panier.titre') }}</a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <span class="fo-breadcrumb-current">{{ t.tr('checkout.titre') }}</span>
        </div>

        <h1 class="fo-page-title"><i class="bi bi-credit-card me-2"></i>{{ t.tr('checkout.titre') }}</h1>
        <p class="fo-page-subtitle">{{ t.tr('checkout.sousTitre') }}</p>

        <!-- Loading -->
        <div *ngIf="chargement" class="fo-loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
          </div>
        </div>

        <!-- Empty Cart Redirect -->
        <div *ngIf="!chargement && (!panier || panier.lignes.length === 0)" class="fo-empty-state">
          <i class="bi bi-cart-x"></i>
          <p>{{ t.tr('panier.vide') }}</p>
          <a routerLink="/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-grid-3x3-gap me-2"></i>{{ t.tr('panier.parcourir') }}
          </a>
        </div>

        <!-- Checkout Form -->
        <div *ngIf="!chargement && panier && panier.lignes.length > 0">
          <div class="row g-4">

            <!-- Client Info Form -->
            <div class="col-lg-7">
              <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark, #1557b0)); color: white;">
                  <h5 class="mb-0"><i class="bi bi-person-fill me-2"></i>{{ t.tr('checkout.infosClient') }}</h5>
                </div>
                <div class="card-body">
                  <form #formulaire="ngForm" (ngSubmit)="passerCommande()" novalidate>

                    <!-- ── Nom complet ── -->
                    <div class="mb-3">
                      <label for="nomClient" class="form-label fw-semibold">
                        {{ t.tr('checkout.nom') }} <span class="text-danger">*</span>
                      </label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-person"></i></span>
                        <input type="text" class="form-control" id="nomClient" name="nomClient"
                               [(ngModel)]="commande.nomClient"
                               required minlength="2" maxlength="100"
                               pattern="[a-zA-ZÀ-ÿ\\s\\-']+"
                               #nom="ngModel"
                               [placeholder]="t.tr('checkout.placeholderNom')"
                               [ngClass]="{'is-invalid': nom.invalid && nom.touched,
                                           'is-valid':   nom.valid  && nom.touched}">
                      </div>
                      <ng-container *ngIf="nom.touched && nom.invalid">
                        <div class="co-field-error" *ngIf="nom.errors?.['required']">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ t.tr('checkout.nomObligatoire') }}
                        </div>
                        <div class="co-field-error" *ngIf="nom.errors?.['minlength']">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ t.tr('checkout.nomTropCourt') }}
                        </div>
                        <div class="co-field-error" *ngIf="nom.errors?.['pattern']">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ t.tr('checkout.nomInvalide') }}
                        </div>
                      </ng-container>
                      <div class="co-field-valid" *ngIf="nom.valid && nom.touched">
                        <i class="bi bi-check-circle-fill me-1"></i>{{ t.isFr ? 'Nom valide' : 'Valid name' }}
                      </div>
                    </div>

                    <!-- ── Email ── -->
                    <div class="mb-3">
                      <label for="emailClient" class="form-label fw-semibold">
                        {{ t.tr('checkout.email') }} <span class="text-danger">*</span>
                      </label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                        <input type="email" class="form-control" id="emailClient" name="emailClient"
                               [(ngModel)]="commande.emailClient"
                               required email
                               #emailRef="ngModel"
                               [placeholder]="t.tr('checkout.placeholderEmail')"
                               [ngClass]="{'is-invalid': emailRef.invalid && emailRef.touched,
                                           'is-valid':   emailRef.valid  && emailRef.touched}">
                      </div>
                      <ng-container *ngIf="emailRef.touched && emailRef.invalid">
                        <div class="co-field-error" *ngIf="emailRef.errors?.['required']">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ t.tr('checkout.emailObligatoire') }}
                        </div>
                        <div class="co-field-error" *ngIf="emailRef.errors?.['email']">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ t.tr('checkout.emailInvalideFormat') }}
                        </div>
                      </ng-container>
                      <div class="co-field-valid" *ngIf="emailRef.valid && emailRef.touched">
                        <i class="bi bi-check-circle-fill me-1"></i>{{ t.isFr ? 'Email valide' : 'Valid email' }}
                      </div>
                    </div>

                    <!-- ── Téléphone TN ── -->
                    <div class="mb-3">
                      <label for="telephone" class="form-label fw-semibold">
                        {{ t.tr('checkout.telephone') }} <span class="text-danger">*</span>
                      </label>
                      <div class="input-group">
                        <span class="input-group-text co-tel-prefix">
                          <img src="https://flagcdn.com/w20/tn.png" width="20" alt="TN" class="me-1">
                          +216
                        </span>
                        <input type="tel" class="form-control" id="telephone" name="telephoneClient"
                               [(ngModel)]="commande.telephoneClient"
                               required minlength="8" maxlength="8"
                               pattern="[2-9][0-9]{7}"
                               #tel="ngModel"
                               [placeholder]="t.tr('checkout.placeholderTel')"
                               (input)="filtrerChiffres($event)"
                               [ngClass]="{'is-invalid': tel.invalid && tel.touched,
                                           'is-valid':   tel.valid  && tel.touched}">
                        <span class="input-group-text co-tel-counter"
                              [class.text-danger]="commande.telephoneClient.length > 0 && commande.telephoneClient.length < 8"
                              [class.text-success]="commande.telephoneClient.length === 8">
                          {{ commande.telephoneClient.length }}/8
                        </span>
                      </div>
                      <ng-container *ngIf="tel.touched && tel.invalid">
                        <div class="co-field-error" *ngIf="tel.errors?.['required']">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ t.tr('checkout.telephoneObligatoire') }}
                        </div>
                        <div class="co-field-error" *ngIf="tel.errors?.['minlength'] || tel.errors?.['maxlength']">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ t.tr('checkout.telephoneLongueur') }}
                        </div>
                        <div class="co-field-error" *ngIf="tel.errors?.['pattern'] && !tel.errors?.['minlength']">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ t.tr('checkout.telephoneFormat') }}
                        </div>
                      </ng-container>
                      <div class="co-field-valid" *ngIf="tel.valid && tel.touched">
                        <i class="bi bi-check-circle-fill me-1"></i>{{ t.isFr ? 'Numéro valide' : 'Valid number' }}
                      </div>
                      <small class="text-muted mt-1 d-block">
                        <i class="bi bi-info-circle me-1"></i>
                        {{ t.isFr ? 'Numéro tunisien 8 chiffres — commence par 2, 3, 4, 5, 7 ou 9' : '8-digit Tunisian number — starts with 2, 3, 4, 5, 7 or 9' }}
                      </small>
                    </div>

                    <!-- ── Adresse de livraison ── -->
                    <div class="mb-4">
                      <label for="adresse" class="form-label fw-semibold">
                        {{ t.tr('checkout.adresse') }} <span class="text-danger">*</span>
                      </label>
                      <div class="position-relative">
                        <textarea class="form-control" id="adresse" name="adresseLivraison"
                                  rows="3"
                                  [(ngModel)]="commande.adresseLivraison"
                                  required minlength="10" maxlength="300"
                                  #adresse="ngModel"
                                  [placeholder]="t.tr('checkout.placeholderAdresse')"
                                  [ngClass]="{'is-invalid': adresse.invalid && adresse.touched,
                                              'is-valid':   adresse.valid  && adresse.touched}"></textarea>
                        <small class="co-char-count"
                               [class.text-danger]="commande.adresseLivraison.length > 270">
                          {{ commande.adresseLivraison.length }}/300
                        </small>
                      </div>
                      <ng-container *ngIf="adresse.touched && adresse.invalid">
                        <div class="co-field-error" *ngIf="adresse.errors?.['required']">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ t.tr('checkout.adresseObligatoire') }}
                        </div>
                        <div class="co-field-error" *ngIf="adresse.errors?.['minlength']">
                          <i class="bi bi-exclamation-circle-fill me-1"></i>{{ t.tr('checkout.adresseTropCourte') }}
                        </div>
                      </ng-container>
                      <div class="co-field-valid" *ngIf="adresse.valid && adresse.touched">
                        <i class="bi bi-check-circle-fill me-1"></i>{{ t.isFr ? 'Adresse valide' : 'Valid address' }}
                      </div>
                    </div>

                    <!-- Error global -->
                    <div *ngIf="erreur" class="alert alert-danger mb-3">
                      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ erreur }}
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                      <a routerLink="/panier" class="btn btn-secondary">
                        <i class="bi bi-arrow-left me-1"></i>{{ t.tr('common.retour') }}
                      </a>
                      <button type="submit" class="btn btn-primary px-4"
                              [disabled]="formulaire.invalid || enCours">
                        <span *ngIf="enCours" class="spinner-border spinner-border-sm me-1"></span>
                        <i *ngIf="!enCours" class="bi bi-check-lg me-1"></i>
                        {{ t.tr('checkout.confirmer') }}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="col-lg-5">
              <div class="card" style="position: sticky; top: 80px;">
                <div class="card-header">
                  <h6 class="mb-0 fw-bold"><i class="bi bi-receipt me-2 text-primary"></i>{{ t.tr('checkout.recapitulatif') }}</h6>
                </div>
                <div class="card-body p-0">
                  <div *ngFor="let ligne of panier.lignes; let last = last"
                       class="d-flex justify-content-between align-items-center px-4 py-3"
                       [style.border-bottom]="!last ? '1px solid var(--border)' : 'none'">
                    <div>
                      <span class="fw-semibold" style="font-size: 0.88rem;">{{ ligne.produitNom }}</span>
                      <small class="d-block text-muted">x{{ ligne.quantite }}</small>
                      <small *ngIf="ligne.produitEnPromo && ligne.produitPrixOriginal" class="d-block">
                        <span class="text-muted text-decoration-line-through" style="font-size:0.75rem;">{{ (ligne.produitPrixOriginal * ligne.quantite) | number:'1.2-2' }} TND</span>
                      </small>
                    </div>
                    <span class="fw-bold" [style.color]="ligne.produitEnPromo ? '#dc2626' : ''" style="font-size: 0.88rem;">{{ ligne.sousTotal | number:'1.2-2' }} TND</span>
                  </div>
                </div>
                <div class="card-body pt-3" style="border-top: 2px solid var(--primary);">
                  <div class="d-flex justify-content: between">
                    <span class="fw-bold fs-5">{{ t.tr('panier.total') }}</span>
                    <span class="fw-bold fs-5 ms-auto" style="color: var(--primary);">{{ panier.montantTotal | number:'1.2-2' }} TND</span>
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
export class CommanderComponent implements OnInit {
  panier: Panier | null = null;
  commande: CreerCommande = {
    nomClient: '',
    emailClient: '',
    telephoneClient: '',
    adresseLivraison: '',
    sessionId: ''
  };
  chargement = true;
  enCours = false;
  erreur = '';

  constructor(
    private panierService: PanierService,
    private commandeService: CommandeService,
    private router: Router,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.commande.sessionId = this.panierService.currentSessionId;
    this.panierService.chargerPanier().subscribe({
      next: (data) => {
        this.panier = data;
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
      }
    });
  }

  /** Strip any non-digit character typed in the phone field */
  filtrerChiffres(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 8);
    input.value = digitsOnly;
    this.commande.telephoneClient = digitsOnly;
  }

  passerCommande(): void {
    this.enCours = true;
    this.erreur = '';

    this.commandeService.creerCommande(this.commande).subscribe({
      next: (commande) => {
        this.panierService.resetApresCommande();
        const extras: any = {};
        if (commande.produitsEpuises && commande.produitsEpuises.length > 0) {
          extras.queryParams = { epuises: commande.produitsEpuises.map(encodeURIComponent).join(',') };
        }
        this.router.navigate(['/commande', commande.reference], extras);
      },
      error: (err) => {
        this.enCours = false;
        this.erreur = err.error?.message || this.t.tr('checkout.erreur');
      }
    });
  }
}
