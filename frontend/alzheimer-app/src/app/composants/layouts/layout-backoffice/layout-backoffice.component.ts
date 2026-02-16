import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../partage/sidebar/sidebar.component';

@Component({
  selector: 'app-layout-backoffice',
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
export class LayoutBackofficeComponent {
  annee = new Date().getFullYear();
}
