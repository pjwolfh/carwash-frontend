import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dellers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SettingsMenuComponent
  ],
  templateUrl: './dellers.component.html',
  styleUrls: ['./dellers.component.css']
})
export class DellersComponent implements OnInit {
  dellers: any[] = [];
  formDeller: FormGroup;
  mostrarFormulario: boolean = false;
  editandoId: number | null = null;

  usuario: any = {};
  sucursal: any = {};

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.formDeller = this.fb.group({
      nombre: [''],
      telefono: [''],
      correo: ['']
    });
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.sucursal = JSON.parse(localStorage.getItem('sucursal') || '{}');
    this.cargarDellers();
  }

  cargarDellers() {
    this.http.get<any[]>(`${environment.apiUrl}/api/dellers`).subscribe({
      next: (data) => this.dellers = data,
      error: (err) => {
        console.error('❌ Error al cargar Dellers:', err);
        Swal.fire('Error', 'No se pudieron cargar los Dellers.', 'error');
      }
    });
  }

  guardarDeller() {
    const nuevo = {
      ...this.formDeller.value,
      id_sucursal: this.sucursal?.id || localStorage.getItem('id_sucursal_activa')
    };

    if (this.editandoId) {
      this.http.put(`${environment.apiUrl}/api/dellers/${this.editandoId}`, nuevo).subscribe({
        next: () => {
          this.resetFormulario();
          this.cargarDellers();
          Swal.fire('✅ Actualizado', 'Deller actualizado correctamente.', 'success');
        },
        error: err => {
          console.error('❌ Error al editar deller:', err);
          Swal.fire('Error', 'No se pudo actualizar el deller.', 'error');
        }
      });
    } else {
      this.http.post<any>(`${environment.apiUrl}/api/dellers`, nuevo).subscribe({
        next: (res) => {
          this.resetFormulario();
          this.cargarDellers();
          this.irABitacora(res.id);
          Swal.fire('✅ Deller agregado', 'Se agregó correctamente el deller.', 'success');
        },
        error: (err) => {
          console.error('❌ Error al guardar deller:', err);
          Swal.fire('Error', 'No se pudo agregar el deller.', 'error');
        }
      });
    }
  }

  editarDeller(deller: any) {
    this.mostrarFormulario = true;
    this.formDeller.patchValue({
      nombre: deller.nombre,
      telefono: deller.telefono,
      correo: deller.correo
    });
    this.editandoId = deller.id_deller;
  }

  eliminarDeller(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/api/dellers/${id}`).subscribe({
          next: () => {
            this.cargarDellers();
            Swal.fire('✅ Eliminado', 'El deller ha sido eliminado.', 'success');
          },
          error: err => {
            console.error('❌ Error al eliminar:', err);
            Swal.fire('Error', 'No se pudo eliminar el deller.', 'error');
          }
        });
      }
    });
  }

  irABitacora(id: string) {
    this.router.navigate(['/app/bitacora-deller', id]);
  }

  abrirFormulario() {
    if (this.editandoId) {
      this.resetFormulario();
    } else {
      this.mostrarFormulario = !this.mostrarFormulario;
    }
  }

  resetFormulario() {
    this.formDeller.reset();
    this.editandoId = null;
    this.mostrarFormulario = false;
  }
  volverALista() {
  window.history.back();
}
}
