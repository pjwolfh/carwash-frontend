import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { UserHeaderComponent } from '../user-header/user-header.component';

@Component({
  selector: 'app-seleccionar-sucursal',
  standalone: true,
  imports: [
    CommonModule,
    UserHeaderComponent // ✅ Importación necesaria para usar <app-user-header>
  ],
  templateUrl: './seleccionar-sucursal.component.html',
  styleUrls: ['./seleccionar-sucursal.component.css']
})
export class SeleccionarSucursalComponent implements OnInit {
  sucursales: any[] = [];
  usuario: any;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      this.usuario = JSON.parse(userData);
      this.obtenerSucursales();
    }
  }

  obtenerSucursales(): void {
    this.http.get<any[]>(`http://localhost:3000/api/usuarios/${this.usuario.id}/sucursales`).subscribe({
      next: (data) => {
        this.sucursales = data;
      },
      error: (err) => {
        console.error('Error cargando sucursales del usuario:', err);
      }
    });
  }

  seleccionarSucursal(sucursal: any): void {
    localStorage.setItem('id_sucursal_activa', sucursal.id_sucursal);
    this.router.navigate(['/app/home']);
  }

  // ✅ Agregado para evitar error en el template
  toggleQR(): void {
    // Puedes agregar lógica para mostrar QR si es necesario
    console.log('QR toggle activado');
  }

  verUbicacion(ubicacionGps: string): void {
  const [lat, lng] = ubicacionGps.split(',').map(val => val.trim());
  if (!lat || !lng) {
    alert('Ubicación no válida');
    return;
  }

  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  window.open(url, '_blank');
}

}
