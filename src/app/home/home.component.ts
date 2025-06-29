import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf y *ngFor
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { UserHeaderComponent } from '../user-header/user-header.component';
import { GiftsComponent } from '../gifts/gifts.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    UserHeaderComponent,
    GiftsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  servicios: any[] = [];
  servicioSeleccionado: any = null;
  apiUrl = 'http://localhost:3000';

  // 🧾 Modal QR
  qrVisible = false;
  qrValue = '';

  // 🎁 Panel de regalos
  giftsVisible = false;

  // 👤 Usuario logueado
  user: any = {};

constructor(private http: HttpClient, private router: Router) {}


  ngOnInit(): void {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.user = JSON.parse(data);
    }
    this.cargarServicios();
  }

  // 📥 Cargar servicios desde backend
 cargarServicios(): void {
  const idSucursal = localStorage.getItem('id_sucursal_activa');
  if (!idSucursal) {
    console.warn('No hay sucursal activa');
    return;
  }

  this.http.get<any[]>(`${this.apiUrl}/api/servicios/sucursal/${idSucursal}`).subscribe({
    next: (data) => {
      this.servicios = data;
      console.log('✅ Servicios filtrados:', data);
    },
    error: (err) => {
      console.error('❌ Error al cargar servicios filtrados:', err);
    }
  });
}


  // 📦 Mostrar modal del servicio
  verServicio(servicio: any): void {
    this.servicioSeleccionado = servicio;
  }

  // ❌ Cerrar modal principal
  cerrarModal(): void {
    this.servicioSeleccionado = null;
  }

  // 🔳 Mostrar modal QR (desde botón Get It)
  mostrarModalQR(servicio: any): void {
    this.qrValue = servicio.id;
    this.servicioSeleccionado = servicio;
    this.qrVisible = true;
  }

  // 🔳 Cerrar QR
  cerrarQR(): void {
    this.qrVisible = false;
  }

  // 🎁 Mostrar regalos
  mostrarGifts(): void {
    this.giftsVisible = true;
  }

  // ↩️ Cerrar regalos
  cerrarGifts(): void {
    this.giftsVisible = false;
  }

  // ✅ Confirmar solicitud de compra (desde modal QR)
  confirmarSolicitud(): void {
    const idSucursal = Number(localStorage.getItem('id_sucursal_activa')) || 0;

    const body = {
      id_cliente: this.user.id,
      servicio_id: this.servicioSeleccionado.id,
      id_sucursal: idSucursal
    };

    if (!body.id_cliente || !body.servicio_id || !body.id_sucursal) {
      Swal.fire('❌ Error', 'Faltan datos del cliente, servicio o sucursal', 'error');
      return;
    }

    this.http.post(`${this.apiUrl}/api/ventas/solicitar`, body).subscribe({
      next: (res: any) => {
        Swal.fire('✅ Solicitud enviada', res.mensaje, 'success');
        this.cerrarQR();
        this.servicioSeleccionado = null;
      },
      error: (err) => {
        console.error('❌ Error al registrar solicitud:', err);
        Swal.fire('Error', err.error?.error || 'No se pudo registrar la solicitud.', 'error');
      }
    });
  }

  // 🔄 Alternar QR manualmente
  toggleQR(): void {
    this.qrVisible = !this.qrVisible;
  }
irASeleccionarSucursal() {
  this.router.navigate(['/app/seleccionar-sucursal']);
}

  
}
