import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.css']
})
export class SettingsMenuComponent {
  constructor(private router: Router) {}

  cerrarSesion() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Seguro que deseas salir?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('usuario');
        this.router.navigate(['/login']);
      }
    });
  }

  cambiarIdioma() {
    Swal.fire({
      title: 'Cambiar idioma',
      text: 'Esta opción estará disponible próximamente.',
      icon: 'info',
      confirmButtonColor: '#f5c518'
    });
  }
}
