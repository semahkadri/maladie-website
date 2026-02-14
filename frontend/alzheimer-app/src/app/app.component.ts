import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './composants/partage/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container mt-4 mb-4">
      <router-outlet></router-outlet>
    </div>
    <footer class="footer">
      <div class="container">
        Alzheimer - Gestion de Stock &copy; {{ annee }} | Microservices Spring Boot + Angular
      </div>
    </footer>
  `
})
export class AppComponent {
  titre = 'Détection Alzheimer - Gestion de Stock';
  annee = new Date().getFullYear();
}
