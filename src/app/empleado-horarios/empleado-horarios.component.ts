import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';
import { AsistenciasService } from '../services/asistencias.service'; // ✅ Importa el servicio real
import { FormsModule } from '@angular/forms'; // 👈 Asegúrate de que esté importado

@Component({
  selector: 'app-empleado-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SettingsMenuComponent],
  templateUrl: './empleado-horarios.component.html',
  styleUrls: ['./empleado-horarios.component.css']
})
export class EmpleadoHorariosComponent implements OnInit {
  idSucursal: string | null = null;
  idEmpleado: string | null = null;
  registros: any[] = [];
  esEmpleado: boolean = false;
  nombreEmpleado: string = '';
fechaDesde: string = '';
fechaHasta: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private asistenciasService: AsistenciasService // ✅ Inyección del servicio
  ) {}

ngOnInit(): void {
  this.idSucursal = this.route.snapshot.paramMap.get('idSucursal');
this.idEmpleado = this.route.snapshot.paramMap.get('id_empleado');// ← Usa camelCase correcto

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  this.esEmpleado = usuario.rol === 'Empleado';

  if (this.idEmpleado) {
    console.log('✅ ID del empleado:', this.idEmpleado);
    this.cargarHistorialReal(this.idEmpleado);
    this.cargarNombreEmpleado(this.idEmpleado);
  } else {
    console.error('❌ ID de empleado no encontrado en la URL');
  }
}


filtrarPorFechas() {
  if (!this.fechaDesde || !this.fechaHasta || !this.idEmpleado) {
    Swal.fire({
      icon: 'warning',
      title: 'Faltan datos',
      text: 'Debes ingresar fechas válidas y tener un empleado cargado.'
    });
    return;
  }

  this.asistenciasService.filtrarAsistenciasPorFechas(this.idEmpleado, this.fechaDesde, this.fechaHasta)
    .subscribe({
      next: (data) => {
        this.registros = data.map(r => ({
          fecha: r.fecha.split('T')[0],
          horaEntrada24: r.hora_entrada || '—',
          horaSalida24: r.hora_salida || '—',
          totalHoras: r.horas || 0,
          totalDinero: r.pago || 0
        }));
      },
      error: (err) => {
        console.error('❌ Error al filtrar por fechas:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al filtrar',
          text: 'No se pudo obtener la información del servidor.'
        });
      }
    });
}


// ✅ Cargrar Nombre del Empleado
cargarNombreEmpleado(id_empleado: string) {
  this.asistenciasService.getNombreEmpleado(id_empleado).subscribe({
    next: (res) => {
      this.nombreEmpleado = res.nombre_contacto || 'Empleado';
    },
    error: (err) => {
      console.error('❌ Error al obtener nombre del empleado:', err);
      this.nombreEmpleado = 'Empleado';
    }
  });
}

// ✅ Nuevo método: cargar datos reales
cargarHistorialReal(id_empleado: string) {
  if (!id_empleado) {
    console.error('🚨 ID del empleado es undefined o null');
    Swal.fire({
      icon: 'error',
      title: 'ID inválido',
      text: 'No se puede obtener el historial sin un ID válido.'
    });
    return;
  }

  console.log('📦 ID del empleado enviado al servicio:', id_empleado);

  this.asistenciasService.getHistorialEmpleado(id_empleado).subscribe({
    next: (data) => {
      console.log('📄 Historial recibido:', data);

      this.registros = data.map(r => ({
        fecha: r.fecha?.split('T')[0] || '—',
        horaEntrada24: r.hora_entrada || '—',
        horaSalida24: r.hora_salida || '—',
        totalHoras: r.horas || 0,
        totalDinero: r.pago || 0
      }));
    },
    error: (err) => {
      console.error('❌ Error al cargar historial:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar historial',
        text: 'No se pudo obtener la información del servidor.'
      });
    }
  });
}



  // ✅ Estos métodos ya no se usan, pero los dejamos para pruebas o PDF
  mostrarSemanaActual() {
    // Puedes eliminar este método si no lo necesitas
  }

  mostrarHistorial() {
    // Puedes eliminar este método si no lo necesitas
  }

  solicitarPermiso() {
    console.log('Aquí abrirías modal para solicitar permiso.');
  }

  regresar() {
    if (this.idSucursal) {
      this.router.navigate(['/app/sucursal', this.idSucursal, 'empleados']);
    } else {
      this.router.navigate(['/app/sucursales']);
    }
  }

  exportarPDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Reporte de Horarios - Empleado #${this.idEmpleado}`, 14, 20);

    const rows = this.registros.map(registro => ([
      registro.fecha,
      registro.horaEntrada24,
      registro.horaSalida24,
      registro.totalHoras,
      `$${registro.totalDinero}`
    ]));

    autoTable(doc, {
      startY: 30,
      head: [['Fecha', 'Entrada', 'Salida', 'Total Horas', 'Total Dinero']],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [245, 197, 24],
        textColor: 0,
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        halign: 'center'
      }
    });

    doc.save(`horarios_empleado_${this.idEmpleado}.pdf`);

    Swal.fire({
      icon: 'success',
      title: '¡PDF generado!',
      text: 'El reporte se descargó exitosamente.',
      confirmButtonColor: '#f5c518',
      confirmButtonText: 'OK'
    });
  }

  abrirSettings() {
    console.log('Aquí abrirías configuración del módulo de horarios.');
  }
}
