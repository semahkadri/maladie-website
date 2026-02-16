import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

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
          Gestion Stock
          <small>Alzheimer Detection</small>
        </div>
      </a>

      <nav class="sidebar-nav">
        <div class="sidebar-nav-label">Principal</div>

        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-grid-1x2-fill"></i>
          Tableau de Bord
        </a>

        <div class="sidebar-nav-label">Gestion</div>

        <a routerLink="/admin/categories" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-tags-fill"></i>
          Catégories
        </a>

        <a routerLink="/admin/produits" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-box-seam-fill"></i>
          Produits
        </a>

        <div class="sidebar-nav-label">Actions Rapides</div>

        <a routerLink="/admin/categories/ajouter" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-plus-circle"></i>
          Nouvelle Catégorie
        </a>

        <a routerLink="/admin/produits/ajouter" routerLinkActive="active"
           class="sidebar-nav-item" (click)="mobileOpen = false">
          <i class="bi bi-plus-circle"></i>
          Nouveau Produit
        </a>
      </nav>

      <div class="sidebar-footer">
        <a routerLink="/" class="sidebar-footer-site-link">
          <i class="bi bi-box-arrow-up-right"></i>
          <span>Voir le site</span>
        </a>
        <div class="sidebar-footer-info">
          <i class="bi bi-database-fill"></i>
          <span>PostgreSQL | Spring Boot</span>
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
          <a routerLink="/admin">Accueil</a>
          <span *ngIf="currentPage" class="separator">/</span>
          <span *ngIf="currentPage" class="current">{{ currentPage }}</span>
        </nav>
      </div>
      <div class="topbar-right">
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
  private routerSub!: Subscription;
  private timerInterval: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateBreadcrumb(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updateBreadcrumb(e.urlAfterRedirects || e.url));

    this.updateTime();
    this.timerInterval = setInterval(() => this.updateTime(), 60000);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private updateBreadcrumb(url: string): void {
    const map: Record<string, string> = {
      '/admin': '',
      '/admin/categories': 'Catégories',
      '/admin/categories/ajouter': 'Nouvelle Catégorie',
      '/admin/produits': 'Produits',
      '/admin/produits/ajouter': 'Nouveau Produit'
    };
    if (map[url] !== undefined) {
      this.currentPage = map[url];
    } else if (url.startsWith('/admin/categories/modifier')) {
      this.currentPage = 'Modifier Catégorie';
    } else if (url.startsWith('/admin/produits/modifier')) {
      this.currentPage = 'Modifier Produit';
    } else {
      this.currentPage = '';
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }
}
