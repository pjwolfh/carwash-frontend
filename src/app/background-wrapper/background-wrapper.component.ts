import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-background-wrapper',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './background-wrapper.component.html',
  styleUrls: ['./background-wrapper.component.css']
})
export class BackgroundWrapperComponent {
  constructor(private router: Router) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    // ⛔ Desactivado temporalmente para desarrollo
    if (!usuario) {
      console.warn('⚠️ Usuario no logueado, pero continuamos en modo desarrollo');
      // this.router.navigate(['/login']); // ← Reactiva esto en producción
    }
  }
}
