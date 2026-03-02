import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { TraductionService } from '../../../services/traduction.service';
import { ThemeService } from '../../../services/theme.service';
import { PanierService } from '../../../services/panier.service';

@Component({
  selector: 'app-layout-frontoffice',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Navbar -->
    <nav class="fo-navbar">
      <div class="fo-navbar-container">
        <a routerLink="/" class="fo-navbar-brand">
          <div class="fo-navbar-brand-icon">
            <i class="bi bi-heart-pulse"></i>
          </div>
          <span>{{ t.tr('nav.brand') }}</span>
        </a>

        <button class="fo-navbar-toggle" (click)="menuOpen = !menuOpen">
          <i class="bi" [class.bi-list]="!menuOpen" [class.bi-x-lg]="menuOpen"></i>
        </button>

        <div class="fo-navbar-menu" [class.open]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
             class="fo-navbar-link" (click)="menuOpen = false">
            <i class="bi bi-house-door"></i> {{ t.tr('nav.accueil') }}
          </a>
          <a routerLink="/catalogue" routerLinkActive="active"
             class="fo-navbar-link" (click)="menuOpen = false">
            <i class="bi bi-grid-3x3-gap"></i> {{ t.tr('nav.catalogue') }}
          </a>
          <a routerLink="/panier" routerLinkActive="active"
             class="fo-navbar-link fo-navbar-cart" (click)="menuOpen = false">
            <i class="bi bi-cart3"></i> {{ t.tr('nav.panier') }}
            <span *ngIf="nombreArticles > 0" class="fo-cart-badge">{{ nombreArticles }}</span>
          </a>
          <a routerLink="/admin" class="fo-navbar-link fo-navbar-admin" (click)="menuOpen = false">
            <i class="bi bi-gear"></i> {{ t.tr('nav.admin') }}
          </a>

          <!-- Language Toggle -->
          <div class="lang-toggle">
            <i class="bi bi-globe2 lang-toggle-icon"></i>
            <button [class.active]="t.isFr" (click)="t.setLang('fr')">FR</button>
            <button [class.active]="t.isEn" (click)="t.setLang('en')">EN</button>
          </div>
          <!-- Theme Toggle -->
          <button class="theme-toggle theme-toggle-fo" (click)="th.toggle()" [attr.title]="th.isDark ? t.tr('theme.light') : t.tr('theme.dark')">
            <i class="bi" [class.bi-moon-fill]="th.isLight" [class.bi-sun-fill]="th.isDark"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="fo-main">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="fo-footer">
      <div class="fo-footer-container">
        <div class="fo-footer-brand">
          <i class="bi bi-heart-pulse"></i>
          <span>{{ t.tr('footer.brand') }}</span>
        </div>
        <div class="fo-footer-info">
          {{ t.tr('footer.info') }} &copy; {{ annee }}
        </div>
        <div class="fo-footer-copy">
          &copy; {{ annee }} {{ t.tr('footer.brand') }}
        </div>
      </div>
    </footer>
  `
})
export class LayoutFrontofficeComponent implements OnInit, OnDestroy {
  annee = new Date().getFullYear();
  menuOpen = false;
  nombreArticles = 0;
  private panierSub!: Subscription;

  constructor(public t: TraductionService, public th: ThemeService, private panierService: PanierService) {}

  ngOnInit(): void {
    this.panierService.chargerPanier().subscribe();
    this.panierSub = this.panierService.panier$.subscribe(panier => {
      this.nombreArticles = panier?.nombreArticles || 0;
    });
  }

  ngOnDestroy(): void {
    this.panierSub?.unsubscribe();
  }
}
