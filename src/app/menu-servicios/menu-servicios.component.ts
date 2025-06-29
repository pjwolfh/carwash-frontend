import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';
import { ServiciosService } from '../services/servicios.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, SettingsMenuComponent],
  templateUrl: './menu-servicios.component.html',
  styleUrls: ['./menu-servicios.component.css']
})
export class MenuServiciosComponent implements OnDestroy {
  idSucursal: string | null = null;
  servicios: any[] = [];

  mostrarModalAgregar: boolean = false;
  nuevoServicio = {
    id: 0,
    nombre: '',
    precio: 0,
    detalles: '',
    imagen: '',
    puntos: 0
  };

  modoEditar: boolean = false;
  indiceEditar: number | null = null;

  private routeSub: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private serviciosService: ServiciosService
  ) {
    // ✅ Escuchar los cambios de parámetros dinámicos
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.idSucursal = params.get('idSucursal') || localStorage.getItem('id_sucursal_activa');
      if (!this.idSucursal) {
        Swal.fire('Error', 'No se encontró una sucursal activa.', 'error');
        this.router.navigate(['/app/seleccionar-sucursal']);
        return;
      }
      this.cargarServicios();
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  cargarServicios() {
    console.log('🔁 Llamando a cargarServicios() para sucursal:', this.idSucursal);
    this.servicios = [];

    if (this.idSucursal) {
      this.serviciosService.obtenerServicios(this.idSucursal).subscribe(
        (data) => {
          console.log('📦 Servicios recibidos:', data.length);
          this.servicios = data;
        },
        (error) => {
          console.error('❌ Error al cargar servicios', error);
        }
      );
    }
  }

  abrirModalAgregar() {
    this.nuevoServicio = {
      id: 0,
      nombre: '',
      precio: 0,
      detalles: '',
      imagen: '',
      puntos: 0
    };
    this.mostrarModalAgregar = true;
    this.modoEditar = false;
    this.indiceEditar = null;
  }

  cargarImagen(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.serviciosService.uploadImagen(file).subscribe({
        next: (res) => {
          this.nuevoServicio.imagen = res.imagePath;
        },
        error: (err) => {
          console.error('Error al subir imagen', err);
          Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
        }
      });
    }
  }

  guardarServicio() {
    if (!this.idSucursal) return;

    if (this.modoEditar && this.indiceEditar !== null) {
      const servicioEditado = {
        nombre_servicio: this.nuevoServicio.nombre,
        precio: this.nuevoServicio.precio,
        detalles: this.nuevoServicio.detalles,
        imagen: this.nuevoServicio.imagen,
        puntos: this.nuevoServicio.puntos
      };

      const id = Number(this.nuevoServicio.id);

      this.serviciosService.editarServicio(id, servicioEditado).subscribe(() => {
        this.cargarServicios();
        this.mostrarModalAgregar = false;
        Swal.fire({
          icon: 'success',
          title: '¡Servicio actualizado!',
          text: 'El servicio fue modificado exitosamente.',
          confirmButtonColor: '#28a745'
        });
      });
    } else {
      const nuevo = {
        id_sucursal: Number(this.idSucursal),
        nombre_servicio: this.nuevoServicio.nombre,
        precio: this.nuevoServicio.precio,
        detalles: this.nuevoServicio.detalles,
        imagen: this.nuevoServicio.imagen,
        puntos: this.nuevoServicio.puntos
      };

      console.log('🚀 Enviando servicio al backend:', nuevo);

      this.serviciosService.agregarServicio(nuevo).subscribe(() => {
        this.cargarServicios();
        this.mostrarModalAgregar = false;
        Swal.fire({
          icon: 'success',
          title: '¡Servicio guardado!',
          text: `${nuevo.nombre_servicio} ha sido registrado exitosamente.`,
          confirmButtonColor: '#28a745'
        });
      });
    }
  }

  editarServicio(index: number) {
    const servicio = this.servicios[index];
    this.indiceEditar = index;
    this.nuevoServicio = {
      id: servicio.id,
      nombre: servicio.nombre_servicio,
      precio: servicio.precio,
      detalles: servicio.detalles,
      imagen: servicio.imagen || '',
      puntos: servicio.puntos || ''
    };
    this.mostrarModalAgregar = true;
    this.modoEditar = true;
  }

  eliminarServicio(index: number) {
    const servicio = this.servicios[index];

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el servicio permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviciosService.eliminarServicio(servicio.id).subscribe(() => {
          this.cargarServicios();
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El servicio fue eliminado correctamente.',
            confirmButtonColor: '#28a745'
          });
        });
      }
    });
  }

  regresar() {
    this.router.navigate(['/app/sucursal', this.idSucursal]);
  }
}
