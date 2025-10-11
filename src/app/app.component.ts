import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <div class="container">
        <div>
          <a routerLink="/">Certification Tests</a>
        </div>
      </div>
    </nav>
    <main class="container">
      <router-outlet />
    </main>
    <footer>
      Hecho con Angular - {{ year }}
    </footer>
  `
})
export class AppComponent {
  year = new Date().getFullYear();
}
