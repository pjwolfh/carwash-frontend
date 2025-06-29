import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegalosService } from '../services/regalos.service';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-regalos',
  standalone: true,
  imports: [CommonModule, FormsModule, SettingsMenuComponent],
  templateUrl: './regalos.component.html',
  styleUrls: []
})
export class RegalosComponent implements OnInit {
  regalos: any[] = [];

  nuevoRegalo = {
    nombre: '',
    descripcion: '',
    puntos_requeridos: 0,
    imagen: ''
  };

  editando = false;
  regaloEnEdicion: any = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private regalosService: RegalosService) {}

  ngOnInit(): void {
    this.cargarRegalos();
  }

  cargarRegalos() {
    this.regalosService.obtenerRegalos().subscribe({
      next: (data) => {
        this.regalos = data;
        console.log('🎁 Regalos cargados:', this.regalos);
      },
      error: (err) => {
        console.error('❌ Error al cargar regalos:', err);
      }
    });
  }

  guardarNuevoRegalo() {
    const formData = new FormData();
    formData.append('nombre', this.nuevoRegalo.nombre);
    formData.append('descripcion', this.nuevoRegalo.descripcion);
    formData.append('puntos_requeridos', this.nuevoRegalo.puntos_requeridos.toString());
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    }

    if (this.editando && this.regaloEnEdicion) {
      // Actualizar
      this.regalosService.actualizarRegaloFormData(this.regaloEnEdicion.id, formData).subscribe({
        next: () => {
          this.cargarRegalos();
          this.cancelarEdicion();
          Swal.fire('✅ Actualizado', 'Regalo actualizado correctamente.', 'success');
        },
        error: (err) => {
          console.error('❌ Error al actualizar regalo:', err);
          Swal.fire('Error', 'No se pudo actualizar el regalo.', 'error');
        }
      });
    } else {
      // Crear
      this.regalosService.crearRegaloFormData(formData).subscribe({
        next: () => {
          this.cargarRegalos();
          this.limpiarFormulario();
          Swal.fire('✅ Agregado', 'Regalo creado correctamente.', 'success');
        },
        error: (err) => {
          console.error('❌ Error al crear regalo:', err);
          Swal.fire('Error', 'No se pudo crear el regalo.', 'error');
        }
      });
    }
  }

  editarRegalo(regalo: any) {
    Swal.fire({
      title: 'Modo edición activado',
      text: 'Puedes modificar los datos del regalo.',
      icon: 'info',
      confirmButtonText: 'Entendido'
    });

    this.nuevoRegalo = {
      nombre: regalo.nombre,
      descripcion: regalo.descripcion,
      puntos_requeridos: regalo.puntos_requeridos,
      imagen: regalo.imagen
    };
    this.editando = true;
    this.regaloEnEdicion = regalo;
  }

  eliminarRegalo(regalo: any) {
    if (!regalo.id) {
      console.error('❌ Regalo sin ID válido');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.regalosService.eliminarRegalo(regalo.id).subscribe({
          next: () => {
            Swal.fire('✅ Eliminado', 'El regalo ha sido eliminado.', 'success');
            this.cargarRegalos();
          },
          error: (err) => {
            console.error('❌ Error al eliminar regalo:', err);
            Swal.fire('❌ Error', 'No se pudo eliminar el regalo', 'error');
          }
        });
      }
    });
  }

  cancelarEdicion() {
    this.editando = false;
    this.regaloEnEdicion = null;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevoRegalo = {
      nombre: '',
      descripcion: '',
      puntos_requeridos: 0,
      imagen: ''
    };
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.nuevoRegalo.imagen = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  volverALista() {
    window.history.back();
  }
}
