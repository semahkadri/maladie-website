import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../partage/sidebar/sidebar.component';
import { TraductionService } from '../../../services/traduction.service';

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
          {{ t.tr('footer.boInfo') }} &copy; {{ annee }} | {{ t.tr('footer.info') }}
        </div>
      </footer>
    </div>
  `
})
export class LayoutBackofficeComponent {
  annee = new Date().getFullYear();

  constructor(public t: TraductionService) {}
}
