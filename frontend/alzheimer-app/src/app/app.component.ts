import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './composants/partage/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar></app-sidebar>
    <div class="main-content">
      <div class="main-content-inner">
        <router-outlet></router-outlet>
      </div>
      <footer class="footer">
        <div class="container">
          Alzheimer - Gestion de Stock &copy; {{ annee }} | Microservices Spring Boot + Angular
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  titre = 'Détection Alzheimer - Gestion de Stock';
  annee = new Date().getFullYear();
}
