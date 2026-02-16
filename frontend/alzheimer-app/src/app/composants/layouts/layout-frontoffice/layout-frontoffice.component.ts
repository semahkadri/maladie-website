import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TraductionService } from '../../../services/traduction.service';

@Component({
  selector: 'app-layout-frontoffice',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
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
          <a routerLink="/admin" class="fo-navbar-link fo-navbar-admin" (click)="menuOpen = false">
            <i class="bi bi-gear"></i> {{ t.tr('nav.admin') }}
          </a>

          <!-- Language Toggle -->
          <div class="lang-toggle">
            <i class="bi bi-globe2 lang-toggle-icon"></i>
            <button [class.active]="t.isFr" (click)="t.setLang('fr')">FR</button>
            <button [class.active]="t.isEn" (click)="t.setLang('en')">EN</button>
          </div>
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
        <div class="fo-footer-tech">
          <span class="fo-footer-badge">Angular 17</span>
          <span class="fo-footer-badge">Spring Boot</span>
          <span class="fo-footer-badge">PostgreSQL</span>
        </div>
      </div>
    </footer>
  `
})
export class LayoutFrontofficeComponent {
  annee = new Date().getFullYear();
  menuOpen = false;

  constructor(public t: TraductionService) {}
}
