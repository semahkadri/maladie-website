import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommandeService } from '../../../services/commande.service';
import { TraductionService } from '../../../services/traduction.service';
import { Commande } from '../../../modeles/commande.model';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

@Component({
  selector: 'app-confirmation-commande',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Confetti Canvas -->
    <canvas #confettiCanvas class="fo-confetti-canvas"></canvas>

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

          <!-- Exhausted products alert -->
          <div *ngIf="produitsEpuises.length > 0" class="alert alert-warning text-start d-flex align-items-start mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
            <div>
              {{ t.tr('confirmation.produitsEpuises') }}
              <ul class="mb-0 mt-1">
                <li *ngFor="let nom of produitsEpuises" class="fw-semibold">{{ nom }}</li>
              </ul>
            </div>
          </div>

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
                  <span class="cmd-badge" [ngClass]="getStatutClass(commande.statut)">
                    <i class="bi" [ngClass]="getStatutIcon(commande.statut)"></i>
                    {{ t.tr('lcmd.' + getStatutKey(commande.statut)) }}
                  </span>
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
                   class="fo-confirm-ligne py-2"
                   [style.border-bottom]="!last ? '1px solid var(--border)' : 'none'">
                <div class="fo-confirm-ligne-left">
                  <span class="fw-semibold">{{ ligne.nomProduit }}</span>
                  <small class="text-muted ms-2">x{{ ligne.quantite }}</small>
                  <span *ngIf="ligne.prixOriginalUnitaire" class="fo-confirm-promo-label ms-2">
                    <i class="bi bi-tag-fill"></i> Promo
                  </span>
                </div>
                <div class="fo-confirm-ligne-price">
                  <span *ngIf="ligne.prixOriginalUnitaire" class="fo-confirm-original">
                    {{ (ligne.prixOriginalUnitaire * ligne.quantite) | number:'1.2-2' }} TND
                  </span>
                  <span class="fw-bold" [class.fo-confirm-promo-price]="ligne.prixOriginalUnitaire">
                    {{ ligne.sousTotal | number:'1.2-2' }} TND
                  </span>
                </div>
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
export class ConfirmationCommandeComponent implements OnInit, OnDestroy {
  @ViewChild('confettiCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  commande: Commande | null = null;
  chargement = true;
  produitsEpuises: string[] = [];
  private animationId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private commandeService: CommandeService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    // Read exhausted products from query params (passed from checkout)
    const epuisesParam = this.route.snapshot.queryParamMap.get('epuises');
    if (epuisesParam) {
      this.produitsEpuises = epuisesParam.split(',').map(decodeURIComponent).filter(n => n.trim().length > 0);
    }

    const ref = this.route.snapshot.paramMap.get('ref');
    if (ref) {
      this.commandeService.obtenirParReference(ref).subscribe({
        next: (data) => {
          this.commande = data;
          this.chargement = false;
          // Launch confetti 300ms after data loads
          setTimeout(() => this.launchConfetti(), 300);
        },
        error: () => {
          this.chargement = false;
        }
      });
    } else {
      this.chargement = false;
    }
  }

  private launchConfetti(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#1a73e8', '#1e8e3e', '#f9ab00', '#d93025', '#00897b', '#e65100', '#9c27b0'];
    const particles: ConfettiParticle[] = [];
    const particleCount = 200;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    const startTime = performance.now();
    const duration = 5000;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = elapsed / duration;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;
      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.1; // gravity
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Fade out in last 40% of duration
        if (progress > 0.6) {
          p.opacity = Math.max(0, 1 - ((progress - 0.6) / 0.4));
        }

        if (p.opacity <= 0 || p.y > canvas.height + 50) continue;
        aliveCount++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (aliveCount > 0 && progress < 1.2) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'cmd-en-attente', 'CONFIRMEE': 'cmd-confirmee',
      'EN_PREPARATION': 'cmd-en-preparation', 'EXPEDIEE': 'cmd-expediee',
      'LIVREE': 'cmd-livree', 'ANNULEE': 'cmd-annulee'
    };
    return map[statut] || 'cmd-en-attente';
  }

  getStatutIcon(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'bi-hourglass-split', 'CONFIRMEE': 'bi-check-circle',
      'EN_PREPARATION': 'bi-boxes', 'EXPEDIEE': 'bi-truck',
      'LIVREE': 'bi-bag-check-fill', 'ANNULEE': 'bi-x-circle'
    };
    return map[statut] || 'bi-hourglass-split';
  }

  getStatutKey(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'enAttente', 'CONFIRMEE': 'confirmee',
      'EN_PREPARATION': 'enPreparation', 'EXPEDIEE': 'expediee',
      'LIVREE': 'livree', 'ANNULEE': 'annulee'
    };
    return map[statut] || 'enAttente';
  }
}
