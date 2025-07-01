import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';
import Swal from 'sweetalert2';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-sucursal-detalle',
  standalone: true,
  imports: [CommonModule, SettingsMenuComponent, RouterModule, HttpClientModule],
  templateUrl: './sucursal-detalle.component.html',
  styleUrls: ['./sucursal-detalle.component.css']
})
export class SucursalDetalleComponent implements OnInit {
  idSucursal: string | null = null;
  ventasPendientes: number = 0;
  nombreSucursal: string = '';

  // ✅ Rol del usuario
  idRol: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.idSucursal = this.route.snapshot.paramMap.get('idSucursal');

    if (this.idSucursal) {
      localStorage.setItem('id_sucursal_activa', this.idSucursal);

      this.obtenerNombreSucursal(this.idSucursal);
      this.cargarVentasPendientes();

      // 🔁 Verificar cada 10 segundos si hay nuevas ventas pendientes
      setInterval(() => {
        this.cargarVentasPendientes();
      }, 10000);
    }

    // ✅ Cargar rol del usuario desde localStorage
    const rolGuardado = localStorage.getItem('rol_usuario');
    if (rolGuardado) {
      this.idRol = parseInt(rolGuardado, 10);
      console.log('✅ Rol del usuario:', this.idRol);
    } else {
      console.warn('⚠️ No se encontró rol_usuario en localStorage');
    }
  }

  cargarVentasPendientes() {
    this.http.get<any>(`${environment.apiUrl}/api/ventas/pendientes/${this.idSucursal}`).subscribe({
      next: (res) => {
        const nuevoTotal = res.pendientes || 0;

        if (nuevoTotal > this.ventasPendientes) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: '📦 Nueva venta pendiente',
            showConfirmButton: false,
            timer: 3000
          });
        }

        this.ventasPendientes = nuevoTotal;
        console.log('🔔 Ventas pendientes:', this.ventasPendientes);
      },
      error: (err) => {
        console.error('❌ Error al cargar ventas pendientes:', err);
        this.ventasPendientes = 0;
      }
    });
  }

  irAEmpleados() {
    this.navegarSiSucursal(['/app/sucursal', this.idSucursal, 'empleados']);
  }

  irAInventario() {
    this.navegarSiSucursal(['/app/sucursal', this.idSucursal, 'inventario']);
  }

  irAInformes() {
    this.navegarSiSucursal(['/app/sucursal', this.idSucursal, 'reportes']);
  }

  irAMenuServicios() {
    this.navegarSiSucursal(['/app/sucursal', this.idSucursal, 'servicios']);
  }

  iniciarLectorQR() {
    this.navegarSiSucursal(['/app/sucursal', this.idSucursal, 'lector-qr']);
  }

  irAVentasQr() {
    this.navegarSiSucursal(['/app/sucursal', this.idSucursal, 'ventas-qr']);
  }

  irADellers() {
    this.router.navigate(['/app/dellers']);
  }

  irARegalos() {
    this.navegarSiSucursal(['/app/sucursal', this.idSucursal, 'regalos']);
  }

  regresarSucursales() {
    this.router.navigate(['/app/sucursales']);
  }

  abrirSettings() {
    console.log('🔧 Aquí abrirías configuración de la sucursal.');
  }

  private navegarSiSucursal(ruta: any[]) {
    if (this.idSucursal) {
      this.router.navigate(ruta);
    } else {
      this.errorSinSucursal();
    }
  }

  private errorSinSucursal() {
    Swal.fire('⚠️ Error', 'ID de sucursal no definido', 'warning');
  }

  obtenerNombreSucursal(id: string): void {
    this.http.get<any>(`${environment.apiUrl}/api/sucursales/id/${id}`).subscribe({
      next: (data) => {
        this.nombreSucursal = data.nombre_sucursal;
        console.log('🏷️ Nombre de sucursal:', this.nombreSucursal);
      },
      error: (err) => {
        console.error('❌ Error al obtener nombre de sucursal:', err);
      }
    });
  }
}
