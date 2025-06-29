import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component'; // Ajusta ruta si está en otra carpeta
import { EmpleadoService } from './empleado.service'; // Ajusta ruta si es necesario
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule, SettingsMenuComponent],
  templateUrl: './empleado.component.html',
  styleUrls: ['./empleado.component.css']
})
export class EmpleadoComponent implements OnInit {
  empleados: any[] = [];
  empleadosEliminados: any[] = [];
  idSucursal: string | null = null;
  terminoBusqueda: string = '';
empleadosFiltrados: any[] = [];


  constructor(private router: Router, private route: ActivatedRoute, private empleadoService: EmpleadoService) {}


  ngOnInit(): void {
    this.idSucursal = this.route.snapshot.paramMap.get('idSucursal');
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    if (this.idSucursal) {
      this.empleadoService.obtenerEmpleados(Number(this.idSucursal)).subscribe({
        next: (data) => {
          this.empleados = data;
          this.empleadosFiltrados = [...this.empleados]; // ← importante para el buscador
        },
        error: (err) => console.error('Error al cargar empleados:', err)
      });
    }
  }
  
  

  agregarEmpleado() {
    if (this.idSucursal) {
      this.router.navigate(['/app/sucursal', this.idSucursal, 'empleados', 'agregar']);
    }
  }

  verHorarios(empleado: any) {
    if (this.idSucursal) {
      this.router.navigate(['/app/sucursal', this.idSucursal, 'empleados', 'horarios', empleado.id_empleado]);
    }
  }

  editarEmpleado(empleado: any) {
    console.log('Editar empleado', empleado.nombre_empleado);
    if (this.idSucursal) {
      this.router.navigate(['/app/sucursal', this.idSucursal, 'empleados', 'editar', empleado.id_empleado]);
    }
  }

  filtrarEmpleados() {
    const termino = this.terminoBusqueda.toLowerCase();
  
    this.empleadosFiltrados = this.empleados.filter(e =>
      e.nombre_empleado.toLowerCase().includes(termino) ||
      e.id_empleado.toString().includes(termino)
    );
  }
  
  

  eliminarEmpleado(empleado: any) {
    Swal.fire({
      title: 'Confirmar eliminación',
      text: 'Ingrese el código de seguridad para eliminar:',
      input: 'password',
      inputPlaceholder: 'Ingrese el código',
      inputAttributes: {
        maxlength: '6',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      confirmButtonText: 'Confirmar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === '123456') {
          // Mover a empleadosEliminados
          this.empleadosEliminados.push(empleado);

          // Eliminar de empleados activos
          this.empleados = this.empleados.filter(e => e.id !== empleado.id_empleado);

          Swal.fire({
            icon: 'success',
            title: '¡Empleado eliminado!',
            text: 'El empleado fue movido al respaldo.',
            confirmButtonColor: '#f5c518'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Código incorrecto',
            text: 'No se pudo eliminar el empleado.',
            confirmButtonColor: '#f5c518'
          });
        }
      }
    });
  }

  regresar() {
    if (this.idSucursal) {
      this.router.navigate(['/app/sucursal', this.idSucursal]);
    } else {
      this.router.navigate(['/app/sucursales']);
    }
  }

  abrirSettings() {
    console.log('Aquí abrirías configuración general del módulo de empleados.');
  }
}
