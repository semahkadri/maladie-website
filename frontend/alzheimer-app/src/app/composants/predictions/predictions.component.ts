import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictionService } from '../../services/prediction.service';
import { TraductionService } from '../../services/traduction.service';
import { DashboardAnalytics, ExpirationResult, DemandResult } from '../../modeles/prediction.model';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h2 class="page-title">
          <i class="bi bi-graph-up-arrow me-2 text-gradient"></i>
          {{ t.isFr ? 'Prédictions IA (Python)' : 'AI Predictions (Python)' }}
        </h2>
        <p class="page-subtitle">
          {{ t.isFr ? 'Analyse prédictive — péremption, demande, anomalies (Pandas + Scikit-learn)' : 'Predictive analytics — expiration, demand, anomalies (Pandas + Scikit-learn)' }}
        </p>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="loading-container">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">{{ t.isFr ? 'Calcul des prédictions...' : 'Computing predictions...' }}</p>
      </div>

      <!-- Error -->
      <div *ngIf="erreur" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ erreur }}
        <div class="mt-2" style="font-size:0.82rem; opacity:0.8;">
          {{ t.isFr ? 'Lancez le service Python : cd python-analytics && uvicorn main:app --port 8083 --reload' : 'Start Python service: cd python-analytics && uvicorn main:app --port 8083 --reload' }}
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement && !erreur && dashboard">

        <!-- KPI Cards -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="card text-center p-3">
              <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size:1.5rem;"></i>
              <div class="fw-bold fs-3 mt-1" style="color:var(--danger, #ef4444);">{{ dashboard.kpis.produitsExpires }}</div>
              <small class="text-muted">{{ t.isFr ? 'Expirés' : 'Expired' }}</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-center p-3">
              <i class="bi bi-clock-history" style="font-size:1.5rem; color:#f59e0b;"></i>
              <div class="fw-bold fs-3 mt-1" style="color:#f59e0b;">{{ dashboard.kpis.expireDans30j }}</div>
              <small class="text-muted">{{ t.isFr ? 'Expirent dans 30j' : 'Expire in 30d' }}</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-center p-3">
              <i class="bi bi-currency-dollar text-danger" style="font-size:1.5rem;"></i>
              <div class="fw-bold fs-4 mt-1" style="color:var(--danger, #ef4444);">{{ dashboard.kpis.valeurStockRisque | number:'1.0-0' }} TND</div>
              <small class="text-muted">{{ t.isFr ? 'Valeur à risque' : 'At-risk value' }}</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-center p-3">
              <i class="bi bi-lightning-fill" style="font-size:1.5rem; color:var(--primary, #4E80EE);"></i>
              <div class="fw-bold fs-3 mt-1" style="color:var(--primary, #4E80EE);">{{ dashboard.kpis.anomaliesDetectees }}</div>
              <small class="text-muted">{{ t.isFr ? 'Anomalies' : 'Anomalies' }}</small>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="card mb-4">
          <div class="card-header d-flex gap-2 flex-wrap align-items-center">
            <button class="btn btn-sm" [ngClass]="activeTab === 'expiration' ? 'btn-primary' : 'btn-outline-primary'" (click)="activeTab='expiration'">
              <i class="bi bi-hourglass-split me-1"></i>{{ t.isFr ? 'Péremption' : 'Expiration' }}
            </button>
            <button class="btn btn-sm" [ngClass]="activeTab === 'demande' ? 'btn-primary' : 'btn-outline-primary'" (click)="activeTab='demande'; chargerDemande()">
              <i class="bi bi-graph-up me-1"></i>{{ t.isFr ? 'Prévision Demande' : 'Demand Forecast' }}
            </button>
            <button class="btn btn-sm" [ngClass]="activeTab === 'anomalies' ? 'btn-primary' : 'btn-outline-primary'" (click)="activeTab='anomalies'">
              <i class="bi bi-lightning me-1"></i>{{ t.isFr ? 'Anomalies' : 'Anomalies' }}
            </button>
            <span class="ms-auto badge bg-secondary" style="align-self:center;">
              <i class="bi bi-gear me-1"></i>Python · Pandas · Scikit-learn
            </span>
          </div>

          <!-- Expiration Tab -->
          <div class="card-body p-0" *ngIf="activeTab === 'expiration' && expiration">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>{{ t.isFr ? 'Produit' : 'Product' }}</th>
                    <th>{{ t.isFr ? 'Catégorie' : 'Category' }}</th>
                    <th>Stock</th>
                    <th>{{ t.isFr ? 'Ventes/j' : 'Sales/d' }}</th>
                    <th>{{ t.isFr ? 'Expire' : 'Expires' }}</th>
                    <th>{{ t.isFr ? 'Risque' : 'Risk' }}</th>
                    <th>{{ t.isFr ? 'Action' : 'Action' }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of expiration.produits.slice(0, 20)">
                    <td class="fw-semibold">{{ p.nom }}</td>
                    <td><small class="text-muted">{{ p.categorie }}</small></td>
                    <td><span class="badge badge-category">{{ p.stock }}</span></td>
                    <td>{{ p.ventesParJour }}</td>
                    <td>
                      <span *ngIf="p.joursAvantExpiration !== null" [class.text-danger]="p.joursAvantExpiration <= 30" [class.fw-bold]="p.joursAvantExpiration <= 7">
                        {{ p.joursAvantExpiration }}j
                      </span>
                      <span *ngIf="p.joursAvantExpiration === null" class="text-muted">—</span>
                    </td>
                    <td>
                      <div style="width:50px; height:6px; border-radius:3px; background:var(--border, #e2e8f0); overflow:hidden; display:inline-block; vertical-align:middle;">
                        <div [style.width.%]="p.risqueScore" [style.background]="p.risqueScore > 60 ? '#ef4444' : p.risqueScore > 30 ? '#f59e0b' : '#10B981'" style="height:100%;"></div>
                      </div>
                      <small class="ms-1">{{ p.risqueScore }}%</small>
                    </td>
                    <td><small>{{ p.recommandation }}</small></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Demand Tab -->
          <div class="card-body p-0" *ngIf="activeTab === 'demande'">
            <div *ngIf="demandeLoading" class="text-center p-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            <div class="table-responsive" *ngIf="!demandeLoading && demande">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>{{ t.isFr ? 'Produit' : 'Product' }}</th>
                    <th>Stock</th>
                    <th>{{ t.isFr ? 'Demande 30j' : 'Demand 30d' }}</th>
                    <th>{{ t.isFr ? 'À commander' : 'To order' }}</th>
                    <th>{{ t.isFr ? 'Tendance' : 'Trend' }}</th>
                    <th>{{ t.isFr ? 'Confiance' : 'Confidence' }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of demande.previsions.slice(0, 20)">
                    <td class="fw-semibold">{{ p.nom }}</td>
                    <td><span class="badge badge-category">{{ p.stockActuel }}</span></td>
                    <td class="fw-bold" style="color:var(--primary, #4E80EE);">{{ p.demandePrevisionnelle30j }}</td>
                    <td><span class="fw-bold" [class.text-danger]="p.quantiteRecommandee > 0">{{ p.quantiteRecommandee > 0 ? '+' + p.quantiteRecommandee : '0' }}</span></td>
                    <td>
                      <i class="bi" [ngClass]="p.tendance === 'hausse' ? 'bi-arrow-up-right text-success' : p.tendance === 'baisse' ? 'bi-arrow-down-right text-danger' : 'bi-arrow-right text-muted'"></i>
                      {{ p.tendance }}
                    </td>
                    <td>
                      <span class="cmd-badge" [ngClass]="p.confiance === 'élevée' ? 'cmd-livree' : p.confiance === 'moyenne' ? 'cmd-en-preparation' : 'cmd-en-attente'">
                        {{ p.confiance }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Anomalies Tab -->
          <div class="card-body" *ngIf="activeTab === 'anomalies'">
            <div *ngIf="dashboard.anomaliesVentes.length === 0" class="text-center text-muted p-4">
              <i class="bi bi-shield-check d-block" style="font-size:2rem; color:#10B981;"></i>
              {{ t.isFr ? 'Aucune anomalie détectée' : 'No anomalies detected' }}
            </div>
            <div *ngFor="let a of dashboard.anomaliesVentes" class="d-flex align-items-center justify-content-between p-3 mb-2" style="background:rgba(239,68,68,0.05); border-radius:10px;">
              <div><i class="bi bi-lightning-fill text-danger me-2"></i><strong>{{ a.date }}</strong></div>
              <div><span class="fw-bold">{{ a.articles }} articles</span> · <span class="fw-bold" style="color:var(--primary);">{{ a.montant | number:'1.2-2' }} TND</span></div>
            </div>

            <h6 class="fw-bold mt-4 mb-3" *ngIf="dashboard.alertesReapprovisionnement.length > 0">
              <i class="bi bi-exclamation-triangle text-warning me-2"></i>{{ t.isFr ? 'Réapprovisionnement urgent' : 'Urgent restock' }}
            </h6>
            <div *ngFor="let a of dashboard.alertesReapprovisionnement" class="d-flex align-items-center justify-content-between p-3 mb-2" style="background:rgba(245,158,11,0.05); border-radius:10px;">
              <div><strong>{{ a.nom }}</strong> <small class="text-muted ms-2">{{ a.stock }} en stock</small></div>
              <span class="cmd-badge" [ngClass]="a.urgence === 'critique' ? 'cmd-annulee' : 'cmd-en-attente'">{{ a.joursDeStock }}j</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PredictionsComponent implements OnInit {
  dashboard: DashboardAnalytics | null = null;
  expiration: ExpirationResult | null = null;
  demande: DemandResult | null = null;
  chargement = true;
  demandeLoading = false;
  erreur = '';
  activeTab = 'expiration';

  constructor(private predictionService: PredictionService, public t: TraductionService) {}

  ngOnInit(): void { this.chargerDonnees(); }

  chargerDonnees(): void {
    this.chargement = true;
    this.erreur = '';
    this.predictionService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.predictionService.getExpiration().subscribe({
          next: (exp) => { this.expiration = exp; this.chargement = false; },
          error: () => { this.chargement = false; }
        });
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err.status === 0
          ? (this.t.isFr ? 'Service Python non disponible (port 8083)' : 'Python service unavailable (port 8083)')
          : 'Erreur';
      }
    });
  }

  chargerDemande(): void {
    if (this.demande) return;
    this.demandeLoading = true;
    this.predictionService.getDemandForecast().subscribe({
      next: (data) => { this.demande = data; this.demandeLoading = false; },
      error: () => { this.demandeLoading = false; }
    });
  }
}
