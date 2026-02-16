import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

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
          <span>Gestion de Stock</span>
        </a>

        <button class="fo-navbar-toggle" (click)="menuOpen = !menuOpen">
          <i class="bi" [class.bi-list]="!menuOpen" [class.bi-x-lg]="menuOpen"></i>
        </button>

        <div class="fo-navbar-menu" [class.open]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
             class="fo-navbar-link" (click)="menuOpen = false">
            <i class="bi bi-house-door"></i> Accueil
          </a>
          <a routerLink="/catalogue" routerLinkActive="active"
             class="fo-navbar-link" (click)="menuOpen = false">
            <i class="bi bi-grid-3x3-gap"></i> Catalogue
          </a>
          <a routerLink="/admin" class="fo-navbar-link fo-navbar-admin" (click)="menuOpen = false">
            <i class="bi bi-gear"></i> Administration
          </a>
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
          <span>Alzheimer - Gestion de Stock</span>
        </div>
        <div class="fo-footer-info">
          Microservices Spring Boot + Angular &copy; {{ annee }}
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
}
