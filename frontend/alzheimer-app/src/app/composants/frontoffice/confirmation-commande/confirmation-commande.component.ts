import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommandeService } from '../../../services/commande.service';
import { TraductionService } from '../../../services/traduction.service';
import { Commande } from '../../../modeles/commande.model';

@Component({
  selector: 'app-confirmation-commande',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fo-section">
      <div class="fo-section-container fade-in">

        <!-- Loading -->
        <div *ngIf="chargement" class="fo-loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
          </div>
        </div>

        <!-- Error -->
        <div *ngIf="!chargement && !commande" class="fo-empty-state">
          <i class="bi bi-exclamation-triangle"></i>
          <p>{{ t.tr('confirmation.introuvable') }}</p>
          <a routerLink="/" class="fo-btn fo-btn-outline">{{ t.tr('nav.accueil') }}</a>
        </div>

        <!-- Confirmation -->
        <div *ngIf="!chargement && commande" class="text-center" style="max-width: 700px; margin: 0 auto;">
          <!-- Success Icon -->
          <div style="width: 80px; height: 80px; background: var(--success-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
            <i class="bi bi-check-lg" style="font-size: 2.5rem; color: var(--success);"></i>
          </div>

          <h1 class="fo-page-title mb-2">{{ t.tr('confirmation.titre') }}</h1>
          <p class="text-muted mb-4">{{ t.tr('confirmation.sousTitre') }}</p>

          <!-- Reference Badge -->
          <div style="background: var(--primary-light); border-radius: 12px; padding: 16px 28px; display: inline-block; margin-bottom: 32px;">
            <span class="text-muted" style="font-size: 0.82rem;">{{ t.tr('confirmation.reference') }}</span>
            <div class="fw-bold" style="font-size: 1.4rem; color: var(--primary); letter-spacing: 1px;">{{ commande.reference }}</div>
          </div>

          <!-- Order Details Card -->
          <div class="card text-start mb-4">
            <div class="card-header">
              <h6 class="mb-0 fw-bold"><i class="bi bi-receipt me-2 text-primary"></i>{{ t.tr('confirmation.details') }}</h6>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-sm-6">
                  <small class="text-muted d-block">{{ t.tr('checkout.nom') }}</small>
                  <span class="fw-semibold">{{ commande.nomClient }}</span>
                </div>
                <div class="col-sm-6">
                  <small class="text-muted d-block">{{ t.tr('confirmation.statut') }}</small>
                  <span class="badge bg-warning text-dark">{{ t.tr('confirmation.enAttente') }}</span>
                </div>
              </div>
              <div *ngIf="commande.emailClient" class="row mb-3">
                <div class="col-sm-6">
                  <small class="text-muted d-block">{{ t.tr('checkout.email') }}</small>
                  <span>{{ commande.emailClient }}</span>
                </div>
                <div *ngIf="commande.telephoneClient" class="col-sm-6">
                  <small class="text-muted d-block">{{ t.tr('checkout.telephone') }}</small>
                  <span>{{ commande.telephoneClient }}</span>
                </div>
              </div>

              <hr>

              <!-- Order Lines -->
              <div *ngFor="let ligne of commande.lignes; let last = last"
                   class="d-flex justify-content-between align-items-center py-2"
                   [style.border-bottom]="!last ? '1px solid var(--border)' : 'none'">
                <div>
                  <span class="fw-semibold">{{ ligne.nomProduit }}</span>
                  <small class="text-muted ms-2">x{{ ligne.quantite }}</small>
                </div>
                <span class="fw-bold">{{ ligne.sousTotal | number:'1.2-2' }} TND</span>
              </div>

              <hr>

              <div class="d-flex justify-content-between">
                <span class="fw-bold fs-5">{{ t.tr('panier.total') }}</span>
                <span class="fw-bold fs-5" style="color: var(--primary);">{{ commande.montantTotal | number:'1.2-2' }} TND</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-content-center gap-3">
            <a routerLink="/catalogue" class="btn btn-primary">
              <i class="bi bi-grid-3x3-gap me-2"></i>{{ t.tr('confirmation.continuer') }}
            </a>
            <a routerLink="/" class="btn btn-secondary">
              <i class="bi bi-house me-2"></i>{{ t.tr('nav.accueil') }}
            </a>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ConfirmationCommandeComponent implements OnInit {
  commande: Commande | null = null;
  chargement = true;

  constructor(
    private route: ActivatedRoute,
    private commandeService: CommandeService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    const ref = this.route.snapshot.paramMap.get('ref');
    if (ref) {
      this.commandeService.obtenirParReference(ref).subscribe({
        next: (data) => {
          this.commande = data;
          this.chargement = false;
        },
        error: () => {
          this.chargement = false;
        }
      });
    } else {
      this.chargement = false;
    }
  }
}
