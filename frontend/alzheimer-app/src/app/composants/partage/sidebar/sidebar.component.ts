import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { TraductionService } from '../../../services/traduction.service';
import { ThemeService } from '../../../services/theme.service';
import { EmailLogService } from '../../../services/email-log.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Overlay mobile -->
    <div *ngIf="mobileOpen" class="sidebar-overlay" (click)="mobileOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" [class.open]="mobileOpen">
      <a routerLink="/admin" class="sidebar-brand" (click)="mobileOpen = false">
        <div class="sidebar-brand-icon">
          <i class="bi bi-heart-pulse"></i>
        </div>
        <div class="sidebar-brand-text">
          {{ t.tr('sidebar.brand') }}
          <small>{{ t.tr('sidebar.brandSub') }}</small>
        </div>
      </a>

      <nav class="sidebar-nav">
        <div class="sidebar-nav-label">{{ t.tr('sidebar.principal') }}</div>

        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-grid-1x2-fill"></i>
          {{ t.tr('sidebar.tdb') }}
        </a>

        <div class="sidebar-nav-label">{{ t.tr('sidebar.gestion') }}</div>

        <a routerLink="/admin/categories" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-tags-fill"></i>
          {{ t.tr('sidebar.categories') }}
        </a>

        <a routerLink="/admin/produits" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-box-seam-fill"></i>
          {{ t.tr('sidebar.produits') }}
        </a>

        <a routerLink="/admin/commandes" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-receipt-cutoff"></i>
          {{ t.tr('sidebar.commandes') }}
        </a>

        <div class="sidebar-nav-label">{{ t.tr('sidebar.analyse') }}</div>

        <a routerLink="/admin/analyse-stock" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-graph-up"></i>
          {{ t.tr('sidebar.analyseStock') }}
        </a>

        <a routerLink="/admin/emails" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-envelope-fill"></i>
          {{ t.tr('sidebar.emails') }}
          <span class="sidebar-badge" *ngIf="unreadEmailCount > 0">{{ unreadEmailCount }}</span>
        </a>

        <div class="sidebar-nav-label">{{ t.tr('sidebar.actionsRapides') }}</div>

        <a routerLink="/admin/categories/ajouter" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-plus-circle"></i>
          {{ t.tr('sidebar.nouvelleCat') }}
        </a>

        <a routerLink="/admin/produits/ajouter" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-plus-circle"></i>
          {{ t.tr('sidebar.nouveauProd') }}
        </a>
      </nav>

      <div class="sidebar-footer">
        <a routerLink="/" class="sidebar-footer-site-link">
          <i class="bi bi-box-arrow-up-right"></i>
          <span>{{ t.tr('sidebar.voirSite') }}</span>
        </a>
        <div class="sidebar-footer-info">
          <i class="bi bi-database-fill"></i>
          <span>{{ t.tr('sidebar.tech') }}</span>
        </div>
      </div>
    </aside>

    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-left">
        <button class="topbar-toggle" (click)="mobileOpen = !mobileOpen">
          <i class="bi bi-list"></i>
        </button>
        <nav class="breadcrumb-nav">
          <a routerLink="/admin">{{ t.tr('breadcrumb.accueil') }}</a>
          <span *ngIf="currentPage" class="separator">/</span>
          <span *ngIf="currentPage" class="current">{{ currentPage }}</span>
        </nav>
      </div>
      <div class="topbar-right">
        <!-- Language Toggle -->
        <div class="lang-toggle lang-toggle-bo">
          <i class="bi bi-globe2 lang-toggle-icon"></i>
          <button [class.active]="t.isFr" (click)="t.setLang('fr')">FR</button>
          <button [class.active]="t.isEn" (click)="t.setLang('en')">EN</button>
        </div>
        <!-- Theme Toggle -->
        <button class="theme-toggle" (click)="th.toggle()" [attr.title]="th.isDark ? t.tr('theme.light') : t.tr('theme.dark')">
          <i class="bi" [class.bi-moon-fill]="th.isLight" [class.bi-sun-fill]="th.isDark"></i>
        </button>
        <span class="topbar-clock">
          <i class="bi bi-clock me-1"></i>{{ currentTime }}
        </span>
      </div>
    </header>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  mobileOpen = false;
  currentPage = '';
  currentTime = '';
  unreadEmailCount = 0;
  private routerSub!: Subscription;
  private timerInterval: any;
  private emailInterval: any;

  constructor(private router: Router, public t: TraductionService, public th: ThemeService, private emailService: EmailLogService) {}

  ngOnInit(): void {
    this.updateBreadcrumb(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updateBreadcrumb(e.urlAfterRedirects || e.url));

    this.updateTime();
    this.timerInterval = setInterval(() => this.updateTime(), 60000);

    this.loadUnreadCount();
    this.emailInterval = setInterval(() => this.loadUnreadCount(), 30000);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.emailInterval) clearInterval(this.emailInterval);
  }

  private loadUnreadCount(): void {
    this.emailService.compterNonLus().subscribe({
      next: (res) => this.unreadEmailCount = res.count,
      error: () => {}
    });
  }

  private updateBreadcrumb(url: string): void {
    const map: Record<string, string> = {
      '/admin': '',
      '/admin/categories': this.t.tr('breadcrumb.categories'),
      '/admin/categories/ajouter': this.t.tr('breadcrumb.nouvelleCat'),
      '/admin/produits': this.t.tr('breadcrumb.produits'),
      '/admin/produits/ajouter': this.t.tr('breadcrumb.nouveauProd'),
      '/admin/commandes': this.t.tr('breadcrumb.commandes'),
      '/admin/analyse-stock': this.t.tr('breadcrumb.analyseStock'),
      '/admin/emails': this.t.tr('breadcrumb.emails')
    };
    if (map[url] !== undefined) {
      this.currentPage = map[url];
    } else if (url.startsWith('/admin/categories/modifier')) {
      this.currentPage = this.t.tr('breadcrumb.modifierCat');
    } else if (url.startsWith('/admin/produits/modifier')) {
      this.currentPage = this.t.tr('breadcrumb.modifierProd');
    } else if (url.startsWith('/admin/commandes/')) {
      this.currentPage = this.t.tr('breadcrumb.detailCommande');
    } else {
      this.currentPage = '';
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleString(this.t.locale, {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }
}
