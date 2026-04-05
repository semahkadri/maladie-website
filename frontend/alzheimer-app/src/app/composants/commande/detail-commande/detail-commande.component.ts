import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Commande, LigneCommande } from '../../../modeles/commande.model';
import { CommandeService } from '../../../services/commande.service';
import { TraductionService } from '../../../services/traduction.service';
import { EmailLogService } from '../../../services/email-log.service';

@Component({
  selector: 'app-detail-commande',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h2 class="page-title">
          <i class="bi bi-receipt-cutoff me-2 text-gradient"></i>{{ t.tr('dcmd.titre') }}
        </h2>
        <p *ngIf="commande" class="page-subtitle">{{ t.tr('dcmd.reference') }} {{ commande.reference }}</p>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
        </div>
      </div>

      <!-- Messages -->
      <div *ngIf="message" class="alert" [ngClass]="messageType === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i class="bi me-2" [ngClass]="messageType === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
        {{ message }}
        <button type="button" class="btn-close float-end" (click)="message = ''"></button>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement && commande">
        <div class="row g-4">
          <!-- Order Info -->
          <div class="col-lg-8">
            <!-- Status Card -->
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold"><i class="bi bi-info-circle me-2 text-primary"></i>{{ t.tr('dcmd.infos') }}</h6>
                <span class="cmd-badge" [ngClass]="getStatutClass(commande.statut)">
                  <i class="bi" [ngClass]="getStatutIcon(commande.statut)"></i>
                  {{ t.tr('lcmd.' + getStatutKey(commande.statut)) }}
                </span>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <small class="text-muted d-block fw-semibold">{{ t.tr('dcmd.client') }}</small>
                    <span>{{ commande.nomClient }}</span>
                  </div>
                  <div class="col-md-6">
                    <small class="text-muted d-block fw-semibold">{{ t.tr('dcmd.dateCommande') }}</small>
                    <span>{{ commande.dateCommande | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <div *ngIf="commande.emailClient" class="col-md-6">
                    <small class="text-muted d-block fw-semibold">{{ t.tr('checkout.email') }}</small>
                    <span>{{ commande.emailClient }}</span>
                  </div>
                  <div *ngIf="commande.telephoneClient" class="col-md-6">
                    <small class="text-muted d-block fw-semibold">{{ t.tr('checkout.telephone') }}</small>
                    <span>{{ commande.telephoneClient }}</span>
                  </div>
                  <div *ngIf="commande.adresseLivraison" class="col-12">
                    <small class="text-muted d-block fw-semibold">{{ t.tr('dcmd.adresse') }}</small>
                    <span>{{ commande.adresseLivraison }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Lines -->
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0 fw-bold"><i class="bi bi-bag-fill me-2 text-primary"></i>{{ t.tr('dcmd.articles') }} ({{ commande.nombreArticles }})</h6>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>{{ t.tr('common.nom') }}</th>
                        <th>{{ t.tr('dcmd.prixUnit') }}</th>
                        <th>{{ t.tr('lp.quantite') }}</th>
                        <th>{{ t.tr('dcmd.sousTotal') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ligne of commande.lignes">
                        <td>
                          <span class="fw-semibold">{{ ligne.nomProduit }}</span>
                          <span *ngIf="ligne.prixOriginalUnitaire && ligne.prixOriginalUnitaire > ligne.prixUnitaire"
                                class="lc-promo-badge ms-2">
                            -{{ getRemiseLigne(ligne) }}%
                          </span>
                        </td>
                        <td>
                          <div *ngIf="ligne.prixOriginalUnitaire && ligne.prixOriginalUnitaire > ligne.prixUnitaire">
                            <span class="text-muted text-decoration-line-through" style="font-size:0.8rem;">{{ ligne.prixOriginalUnitaire | number:'1.2-2' }} TND</span>
                            <span class="text-danger fw-bold ms-1">{{ ligne.prixUnitaire | number:'1.2-2' }} TND</span>
                          </div>
                          <span *ngIf="!ligne.prixOriginalUnitaire || ligne.prixOriginalUnitaire <= ligne.prixUnitaire">
                            {{ ligne.prixUnitaire | number:'1.2-2' }} TND
                          </span>
                        </td>
                        <td><span class="badge badge-category">{{ ligne.quantite }}</span></td>
                        <td class="fw-bold">{{ ligne.sousTotal | number:'1.2-2' }} TND</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" class="text-end fw-bold fs-5">{{ t.tr('panier.total') }}</td>
                        <td class="fw-bold fs-5" style="color: var(--primary);">{{ commande.montantTotal | number:'1.2-2' }} TND</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Management -->
          <div class="col-lg-4">
            <div class="dc-sidebar-sticky">

              <!-- Change Status Card -->
              <div class="card mb-3">
                <div class="card-header card-header-gradient">
                  <h6 class="mb-0"><i class="bi bi-arrow-repeat me-2"></i>{{ t.tr('dcmd.changerStatut') }}</h6>
                </div>
                <div class="card-body">
                  <select class="form-select mb-3" [(ngModel)]="nouveauStatut">
                    <option value="EN_ATTENTE">{{ t.tr('lcmd.enAttente') }}</option>
                    <option value="CONFIRMEE">{{ t.tr('lcmd.confirmee') }}</option>
                    <option value="EN_PREPARATION">{{ t.tr('lcmd.enPreparation') }}</option>
                    <option value="EXPEDIEE">{{ t.tr('lcmd.expediee') }}</option>
                    <option value="LIVREE">{{ t.tr('lcmd.livree') }}</option>
                    <option value="ANNULEE" [disabled]="commande.statut === 'LIVREE'">{{ t.tr('lcmd.annulee') }}</option>
                  </select>
                  <div *ngIf="commande.statut === 'LIVREE'" class="alert alert-warning py-2 mb-2" style="font-size:0.82rem;">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i>
                    {{ t.isFr ? 'Une commande livrée ne peut pas être annulée.' : 'A delivered order cannot be cancelled.' }}
                  </div>
                  <button class="btn btn-primary w-100"
                          (click)="changerStatut()"
                          [disabled]="enCours || nouveauStatut === commande.statut">
                    <span *ngIf="enCours" class="spinner-border spinner-border-sm me-1"></span>
                    <i *ngIf="!enCours" class="bi bi-check-lg me-1"></i>
                    {{ t.tr('dcmd.appliquer') }}
                  </button>
                </div>
              </div>

              <!-- Back Button — ghost style: invisible until hover -->
              <a routerLink="/admin/commandes" class="btn-ghost-nav w-100">
                <i class="bi bi-arrow-left"></i>{{ t.tr('dcmd.retourListe') }}
              </a>

            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DetailCommandeComponent implements OnInit {
  commande: Commande | null = null;
  nouveauStatut = '';
  chargement = true;
  enCours = false;
  message = '';
  messageType = '';

  constructor(
    private route: ActivatedRoute,
    private commandeService: CommandeService,
    public t: TraductionService,
    private emailService: EmailLogService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.commandeService.obtenirParId(+id).subscribe({
        next: (data) => {
          this.commande = data;
          this.nouveauStatut = data.statut;
          this.chargement = false;
        },
        error: () => {
          this.chargement = false;
          this.message = this.t.tr('dcmd.erreurChargement');
          this.messageType = 'error';
        }
      });
    }
  }

  changerStatut(): void {
    if (!this.commande?.id) return;
    this.enCours = true;
    this.message = '';
    this.commandeService.modifierStatut(this.commande.id, this.nouveauStatut).subscribe({
      next: (data) => {
        this.commande = data;
        this.nouveauStatut = data.statut;
        this.enCours = false;
        this.message = this.t.tr('dcmd.statutModifie');
        this.messageType = 'success';
        // Refresh email count immediately (in case email was synchronous)
        // then again after 1.5s to catch @Async email processing
        this.emailService.refreshUnreadCount();
        setTimeout(() => this.emailService.refreshUnreadCount(), 1500);
      },
      error: (err) => {
        this.enCours = false;
        this.message = err.error?.message || this.t.tr('dcmd.erreurStatut');
        this.messageType = 'error';
      }
    });
  }

  getRemiseLigne(ligne: LigneCommande): number {
    if (!ligne.prixOriginalUnitaire || !ligne.prixUnitaire || ligne.prixOriginalUnitaire <= ligne.prixUnitaire) return 0;
    return Math.round(((ligne.prixOriginalUnitaire - ligne.prixUnitaire) / ligne.prixOriginalUnitaire) * 100);
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'cmd-en-attente',
      'CONFIRMEE': 'cmd-confirmee',
      'EN_PREPARATION': 'cmd-en-preparation',
      'EXPEDIEE': 'cmd-expediee',
      'LIVREE': 'cmd-livree',
      'ANNULEE': 'cmd-annulee'
    };
    return map[statut] || 'cmd-en-attente';
  }

  getStatutIcon(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'bi-hourglass-split',
      'CONFIRMEE': 'bi-check-circle',
      'EN_PREPARATION': 'bi-boxes',
      'EXPEDIEE': 'bi-truck',
      'LIVREE': 'bi-bag-check-fill',
      'ANNULEE': 'bi-x-circle'
    };
    return map[statut] || 'bi-circle';
  }

  getStatutKey(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'enAttente',
      'CONFIRMEE': 'confirmee',
      'EN_PREPARATION': 'enPreparation',
      'EXPEDIEE': 'expediee',
      'LIVREE': 'livree',
      'ANNULEE': 'annulee'
    };
    return map[statut] || 'enAttente';
  }
}
