import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { QRCodeComponent } from 'angularx-qrcode';
import { EmpleadoService } from '../empleado/empleado.service';


@Component({
  selector: 'app-editar-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  templateUrl: './editar-empleado.component.html',
  styleUrls: ['./editar-empleado.component.css']
})
export class EditarEmpleadoComponent implements OnInit {
  empleado: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empleadoService: EmpleadoService
  ) {}
  

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('idEmpleado');
    if (id) {
      this.empleadoService.obtenerEmpleadoPorId(Number(id)).subscribe({
        next: (data) => {
          console.log('Empleado cargado:', data);
          this.empleado = data;
        },
        error: (err) => {
          console.error('Error al cargar empleado', err);
          Swal.fire('Error', 'No se pudo cargar la información del empleado.', 'error');
        }
      });
    }
  }
  
  
  
  

  guardarCambios() {
    this.empleadoService.actualizarEmpleado(this.empleado.id_empleado, this.empleado).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Empleado actualizado!',
          text: 'Los cambios fueron guardados correctamente.',
          confirmButtonColor: '#f5c518'
        }).then(() => {
          this.router.navigate(['/app/sucursal', this.empleado.id_sucursal, 'empleados']);
        });
      },
      error: (err) => {
        console.error('Error al actualizar empleado:', err);
        Swal.fire('Error', 'No se pudo actualizar el empleado.', 'error');
      }
    });
  }
  

  regresar() {
    this.router.navigate(['/app/sucursal', this.empleado.id_sucursal, 'empleados']);

  }
}
