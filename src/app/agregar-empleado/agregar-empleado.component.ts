import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { QRCodeComponent } from 'angularx-qrcode';
import { EmpleadoService } from '../empleado/empleado.service'; // ✅ IMPORTA TU SERVICIO

@Component({
  selector: 'app-agregar-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  templateUrl: './agregar-empleado.component.html',
  styleUrls: ['./agregar-empleado.component.css']
})
export class AgregarEmpleadoComponent implements OnInit {
  idSucursal: string | null = null;
  empleado: any = {};
  idGenerado: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empleadoService: EmpleadoService // ✅ INYECTA EL SERVICIO
  ) { }

  ngOnInit(): void {
    this.idSucursal = this.route.snapshot.paramMap.get('idSucursal');
    this.generarID();
  }

  generarID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.idGenerado = id;
    this.empleado.id = id;
  }

  guardarEmpleado() {
    if (!this.idSucursal) return;

    // ✅ CONSTRUYE EL OBJETO CON LOS CAMPOS QUE ESPERA EL BACKEND
    const nuevoEmpleado = {
      id_sucursal: Number(this.idSucursal),
      nombre_empleado: this.empleado.nombre,
      telefono: this.empleado.telefono,
      correo: this.empleado.email,
      pago_por_hora: this.empleado.pagoHora,
      fecha_ingreso: new Date().toISOString().slice(0, 10),
      estado: 'activo',
      puesto: this.empleado.rol,
      dia_descanso: this.empleado.dia_descanso,
      hora_entrada: this.empleado.hora_entrada,
      hora_salida: this.empleado.hora_salida,
      rol_id: this.empleado.rol_id    // 👈 AGREGA ESTO
    };



    // ✅ ENVÍA AL SERVIDOR
    this.empleadoService.crearEmpleado(nuevoEmpleado).subscribe({
      next: (res) => {
        console.log('Empleado guardado correctamente:', res);

        Swal.fire({
          icon: 'success',
          title: '¡Empleado agregado!',
          text: 'El nuevo empleado fue registrado exitosamente.',
          confirmButtonColor: '#f5c518'
        }).then(() => {
          this.router.navigate(['/app/sucursal', this.idSucursal, 'empleados']);
        });
      },
      error: (err) => {
        console.error('Error al guardar empleado:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el empleado.',
          confirmButtonColor: '#f5c518'
        });
      }
    });
  }

  regresar() {
    if (this.idSucursal) {
      this.router.navigate(['/app/sucursal', this.idSucursal, 'empleados']);
    } else {
      this.router.navigate(['/app/sucursales']);
    }
  }

  abrirSettings() {
    console.log('Aquí abrirías configuraciones adicionales del módulo.');
  }
}
