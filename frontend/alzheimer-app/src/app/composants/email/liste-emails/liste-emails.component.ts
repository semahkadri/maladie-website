import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmailLogService } from '../../../services/email-log.service';
import { EmailLog } from '../../../modeles/email-log.model';
import { TraductionService } from '../../../services/traduction.service';

@Component({
  selector: 'app-liste-emails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header -->
    <div class="email-page-header">
      <div>
        <h2 class="email-page-title">
          <i class="bi bi-envelope-fill"></i>
          {{ t.tr('email.titre') }}
        </h2>
        <p class="email-page-subtitle">{{ t.tr('email.sousTitre') }}</p>
      </div>
      <div class="email-header-actions">
        <span class="email-badge-unread" *ngIf="unreadCount > 0">
          {{ unreadCount }} {{ t.tr('email.nonLus') }}
        </span>
        <button class="btn-mark-all-read" (click)="marquerToutLu()" *ngIf="unreadCount > 0">
          <i class="bi bi-check2-all"></i>
          {{ t.tr('email.toutMarquerLu') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="email-filters">
      <div class="email-search">
        <i class="bi bi-search"></i>
        <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="filtrer()"
               [placeholder]="t.tr('email.rechercher')">
      </div>
      <div class="email-type-filters">
        <button [class.active]="filtreType === 'TOUS'" (click)="setFiltre('TOUS')">
          {{ t.tr('email.tous') }} ({{ emails.length }})
        </button>
        <button [class.active]="filtreType === 'CONFIRMATION'" (click)="setFiltre('CONFIRMATION')">
          <i class="bi bi-check-circle"></i> {{ t.tr('email.confirmation') }}
        </button>
        <button [class.active]="filtreType === 'STATUT_CHANGE'" (click)="setFiltre('STATUT_CHANGE')">
          <i class="bi bi-arrow-repeat"></i> {{ t.tr('email.statutChange') }}
        </button>
        <button [class.active]="filtreType === 'ADMIN_NOTIFICATION'" (click)="setFiltre('ADMIN_NOTIFICATION')">
          <i class="bi bi-bell"></i> {{ t.tr('email.adminNotif') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div class="email-loading" *ngIf="loading">
      <div class="spinner"></div>
      <span>{{ t.tr('email.chargement') }}</span>
    </div>

    <!-- Empty state -->
    <div class="email-empty" *ngIf="!loading && emailsFiltres.length === 0">
      <i class="bi bi-inbox"></i>
      <p>{{ t.tr('email.aucun') }}</p>
    </div>

    <!-- Email list + preview -->
    <div class="email-layout" *ngIf="!loading && emailsFiltres.length > 0">
      <!-- List panel -->
      <div class="email-list-panel" [class.hidden-on-mobile]="selectedEmail">
        <div *ngFor="let email of emailsFiltres"
             class="email-list-item"
             [class.unread]="!email.lu"
             [class.selected]="selectedEmail?.id === email.id"
             (click)="selectEmail(email)">
          <div class="email-list-item-icon" [ngClass]="getTypeClass(email.type)">
            <i class="bi" [ngClass]="getTypeIcon(email.type)"></i>
          </div>
          <div class="email-list-item-body">
            <div class="email-list-item-top">
              <span class="email-list-item-dest">{{ email.destinataire }}</span>
              <span class="email-list-item-date">{{ formatDate(email.dateEnvoi) }}</span>
            </div>
            <div class="email-list-item-subject">{{ email.sujet }}</div>
            <div class="email-list-item-meta">
              <span class="email-type-pill" [ngClass]="getTypeClass(email.type)">
                {{ getTypeLabel(email.type) }}
              </span>
              <span class="email-ref" *ngIf="email.referenceCommande">
                {{ email.referenceCommande }}
              </span>
            </div>
          </div>
          <div class="email-list-item-unread-dot" *ngIf="!email.lu"></div>
        </div>
      </div>

      <!-- Preview panel -->
      <div class="email-preview-panel" *ngIf="selectedEmail" [class.mobile-full]="selectedEmail">
        <div class="email-preview-header">
          <button class="email-back-btn" (click)="selectedEmail = null">
            <i class="bi bi-arrow-left"></i>
            {{ t.tr('email.retour') }}
          </button>
          <div class="email-preview-actions">
            <button class="email-action-btn" (click)="supprimerEmail(selectedEmail)" title="Supprimer">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <div class="email-preview-meta">
          <h3 class="email-preview-subject">{{ selectedEmail.sujet }}</h3>
          <div class="email-preview-info">
            <span><i class="bi bi-person"></i> {{ selectedEmail.destinataire }}</span>
            <span><i class="bi bi-clock"></i> {{ formatDateFull(selectedEmail.dateEnvoi) }}</span>
            <span class="email-type-pill" [ngClass]="getTypeClass(selectedEmail.type)">
              {{ getTypeLabel(selectedEmail.type) }}
            </span>
          </div>
        </div>
        <div class="email-preview-body">
          <iframe #previewFrame
                  [srcdoc]="getSafeHtml(selectedEmail.contenuHtml)"
                  class="email-preview-iframe"
                  sandbox="allow-same-origin"
                  frameborder="0">
          </iframe>
        </div>
      </div>

      <!-- No selection placeholder -->
      <div class="email-no-selection" *ngIf="!selectedEmail">
        <i class="bi bi-envelope-open"></i>
        <p>{{ t.tr('email.selectionnez') }}</p>
      </div>
    </div>
  `
})
export class ListeEmailsComponent implements OnInit, OnDestroy {
  emails: EmailLog[] = [];
  emailsFiltres: EmailLog[] = [];
  selectedEmail: EmailLog | null = null;
  loading = true;
  searchTerm = '';
  filtreType = 'TOUS';
  unreadCount = 0;
  private refreshInterval: any;

  constructor(
    private emailService: EmailLogService,
    private sanitizer: DomSanitizer,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.refreshInterval = setInterval(() => this.charger(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  charger(): void {
    this.emailService.listerTout().subscribe({
      next: (emails) => {
        this.emails = emails;
        this.unreadCount = emails.filter(e => !e.lu).length;
        this.filtrer();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filtrer(): void {
    let result = this.emails;

    if (this.filtreType !== 'TOUS') {
      result = result.filter(e => e.type === this.filtreType);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(e =>
        e.sujet.toLowerCase().includes(term) ||
        e.destinataire.toLowerCase().includes(term) ||
        (e.referenceCommande && e.referenceCommande.toLowerCase().includes(term))
      );
    }

    this.emailsFiltres = result;
  }

  setFiltre(type: string): void {
    this.filtreType = type;
    this.filtrer();
  }

  selectEmail(email: EmailLog): void {
    this.selectedEmail = email;
    if (!email.lu) {
      this.emailService.marquerCommeLu(email.id).subscribe({
        next: (updated) => {
          email.lu = true;
          this.unreadCount = this.emails.filter(e => !e.lu).length;
        }
      });
    }
  }

  marquerToutLu(): void {
    this.emailService.marquerToutCommeLu().subscribe({
      next: () => {
        this.emails.forEach(e => e.lu = true);
        this.unreadCount = 0;
      }
    });
  }

  supprimerEmail(email: EmailLog): void {
    this.emailService.supprimer(email.id).subscribe({
      next: () => {
        this.emails = this.emails.filter(e => e.id !== email.id);
        this.selectedEmail = null;
        this.unreadCount = this.emails.filter(e => !e.lu).length;
        this.filtrer();
      }
    });
  }

  getSafeHtml(html: string): string {
    return html;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'CONFIRMATION': return 'bi-check-circle-fill';
      case 'STATUT_CHANGE': return 'bi-arrow-repeat';
      case 'ADMIN_NOTIFICATION': return 'bi-bell-fill';
      default: return 'bi-envelope-fill';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'CONFIRMATION': return 'type-confirmation';
      case 'STATUT_CHANGE': return 'type-statut';
      case 'ADMIN_NOTIFICATION': return 'type-admin';
      default: return '';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'CONFIRMATION': return this.t.tr('email.confirmation');
      case 'STATUT_CHANGE': return this.t.tr('email.statutChange');
      case 'ADMIN_NOTIFICATION': return this.t.tr('email.adminNotif');
      default: return type;
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (mins < 1) return this.t.isFr ? "A l'instant" : 'Just now';
    if (mins < 60) return `${mins}min`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString(this.t.locale, { day: 'numeric', month: 'short' });
  }

  formatDateFull(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.t.locale, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
