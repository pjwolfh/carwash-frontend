import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';
import { environment } from '../../environments/environment';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SettingsMenuComponent],
  templateUrl: './ventas-qr.component.html',
  styleUrls: ['./ventas-qr.component.css']
})
export class VentasQrComponent implements OnInit {

  ventas: any[] = [];
  ventasFiltradas: any[] = [];

  idServicio: string = '';
  idCliente: string = '';
  user: any = {};
  idSucursal: number = 0;
  idEmpleado: number = 0;

  fechaDesde: string = '';
  fechaHasta: string = '';

  estadoFiltro: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

ngOnInit(): void {
  const data = localStorage.getItem('usuario');
  if (data) {
    this.user = JSON.parse(data);
    this.idEmpleado = this.user.user_id || this.user.id_empleado || 0;
  }

  const routeId = this.route.snapshot.paramMap.get('idSucursal');
  if (routeId) {
    this.idSucursal = parseInt(routeId);
    localStorage.setItem('id_sucursal_activa', routeId);
  } else {
    const guardada = localStorage.getItem('id_sucursal_activa');
    this.idSucursal = guardada ? parseInt(guardada) : 0;
  }

  this.cargarHistorialVentas();

  // 🕒 Refrescar cada 10 segundos (solo si hay ventas pendientes)
  setInterval(() => {
    this.cargarHistorialVentas();
  }, 10000); // 10,000 ms = 10 segundos
}

  cargarHistorialVentas() {
    const body = {
      id_sucursal: this.idSucursal,
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta
    };

    this.http.post<any[]>(`${environment.apiUrl}/api/ventas/historial`, body).subscribe({
      next: (data) => {
        this.ventas = data;
        this.aplicarFiltroEstado();
      },
      error: (err) => {
        console.error('❌ Error al cargar historial de ventas', err);
        Swal.fire('Error', 'No se pudo cargar el historial.', 'error');
      }
    });
  }

  aplicarFiltroEstado() {
    if (this.estadoFiltro) {
      this.ventasFiltradas = this.ventas.filter(v => v.estado_confirmacion === this.estadoFiltro);
    } else {
      this.ventasFiltradas = [...this.ventas];
    }
  }

  setEstadoFiltro(estado: string) {
    this.estadoFiltro = estado;
    this.aplicarFiltroEstado();
  }

  filtrarPorFechas() {
    if (!this.fechaDesde || !this.fechaHasta) {
      Swal.fire('⚠️ Faltan fechas', 'Debes seleccionar ambas fechas.', 'warning');
      return;
    }

    const desde = new Date(this.fechaDesde);
    const hasta = new Date(this.fechaHasta + 'T23:59:59');

    this.ventasFiltradas = this.ventas.filter(v => {
      const fechaVenta = new Date(v.fecha_hora);
      return fechaVenta >= desde && fechaVenta <= hasta;
    });

    if (this.estadoFiltro) {
      this.ventasFiltradas = this.ventasFiltradas.filter(v => v.estado_confirmacion === this.estadoFiltro);
    }

    this.ventasFiltradas = this.ventasFiltradas.slice(); // Forzar actualización de Angular
  }

  registrarVentaManual() {
    if (!this.idServicio.trim() || !this.idCliente.trim()) {
      Swal.fire('Campos vacíos', 'Debes ingresar ID de servicio y cliente.', 'warning');
      return;
    }


    
const body = {
  id_cliente: Number(this.idCliente),
  servicio_id: Number(this.idServicio),
  id_usuario: this.user.id,          // 👈 este campo es clave
  id_sucursal: this.idSucursal
};


    this.http.post(`${environment.apiUrl}/api/ventas/registrar`, body).subscribe({
      next: (res: any) => {
        Swal.fire('🎉 ¡Venta registrada!', 'Puntos asignados al cliente.', 'success');
        this.idServicio = '';
        this.idCliente = '';
        this.cargarHistorialVentas();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('❌ Error', err.error?.error || 'No se pudo registrar la venta.', 'error');
      }
    });
  }

  confirmarVenta(id_venta: number) {
    const body = {
      venta_id: id_venta,
      id_usuario: this.user.id,
      id_sucursal: this.idSucursal
    };

    if (!body.venta_id || !body.id_usuario || !body.id_sucursal) {
      Swal.fire('❌ Error', 'Faltan datos para confirmar', 'error');
      return;
    }

    this.http.post(`${environment.apiUrl}/api/ventas/confirmar`, body).subscribe({
      next: (res: any) => {
        Swal.fire('✅ Confirmado', res.mensaje, 'success');
        this.cargarHistorialVentas();
      },
      error: (err) => {
        console.error('❌ Error al confirmar venta:', err);
        Swal.fire('❌ Error', err.error?.error || 'No se pudo confirmar la venta.', 'error');
      }
    });
  }

  declinarVenta(id_venta: number) {
    this.http.post(`${environment.apiUrl}/api/ventas/declinar`, { id_venta }).subscribe({
      next: (res: any) => {
        Swal.fire('⚠️ Declinado', res.mensaje, 'info');
        this.cargarHistorialVentas();
      },
      error: (err) => {
        Swal.fire('❌ Error', err.error?.error || 'No se pudo declinar la venta.', 'error');
      }
    });
  }

  exportarExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.ventasFiltradas);
    const workbook = { Sheets: { 'Ventas': worksheet }, SheetNames: ['Ventas'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_${this.idSucursal}.xlsx`;
    link.click();
  }

  exportarPDF() {
    const doc = new jsPDF();
    doc.text(`Reporte de ventas del ${this.fechaDesde} al ${this.fechaHasta}`, 10, 10);

    autoTable(doc, {
      startY: 20,
      head: [['Fecha', 'Empleado', 'Sucursal', 'Cliente', 'Servicio', 'Puntos', 'Monto']],
      body: this.ventasFiltradas.map(v => [
        new Date(v.fecha_hora).toLocaleString(),
        v.nombre_empleado || '—',
        v.nombre_sucursal || v.id_sucursal,
        v.email_cliente || '—',
        v.nombre_servicio || '—',
        v.puntos || 0,
        'Q ' + (Number(v.monto_total) || 0).toFixed(2)
      ])
    });

    doc.save(`ventas_${this.idSucursal}.pdf`);
  }



  regresar() {
    if (this.idSucursal) {
      this.router.navigate(['/app/sucursal', this.idSucursal]);
    } else {
      Swal.fire('⚠️ Error', 'ID de sucursal no definido', 'warning');
    }
  }

  registrarVentaPorQR(servicio_id: number, id_cliente: number) {
  const body = {
    id_cliente,
    servicio_id,
    id_usuario: this.user.id,      // 👈 que esté bien este valor
    id_sucursal: this.idSucursal
  };

  this.http.post(`${environment.apiUrl}/api/ventas/registrar`, body).subscribe({
    next: (res: any) => {
      Swal.fire('🎉 ¡Venta por QR registrada!', 'Puntos asignados al cliente.', 'success');
      this.cargarHistorialVentas();
    },
    error: (err) => {
      console.error('❌ Error en venta QR:', err);
      Swal.fire('❌ Error', err.error?.error || 'No se pudo registrar la venta QR.', 'error');
    }
  });
}

}
