import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';
import { SucursalService } from '../services/sucursal.service';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, FormsModule, SettingsMenuComponent],
  templateUrl: './sucursales.component.html',
  styleUrls: ['./sucursales.component.css']
})
export class SucursalesComponent implements OnInit {
  sucursales: any[] = [];

  nuevaSucursal = {
    id_cliente: null,
    nombre_sucursal: '',
    direccion: '',
    ubicacion_gps: '',
    encargado_nombre: '',
    encargado_telefono: '',
    encargado_email: ''
  };
  modoEditar: boolean = false;
  idSucursalEditando: number | null = null;
  mostrarModalAgregar: boolean = false;
  mostrarFichaTecnica: boolean = false;
  sucursalSeleccionada: any = null;

  balanceDiario: number = 0;
  usuario: any = {};
  esSuperAdmin: boolean = false;
  private CLAVE_SEGURIDAD_ELIMINAR = 'ELIMINAR123';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sucursalService: SucursalService
  ) {}

  ngOnInit(): void {
    const data = localStorage.getItem('usuario');
    const clienteAdminData = localStorage.getItem('clienteAdmin');

    if (data) {
      this.usuario = JSON.parse(data);
      console.log('Rol del usuario logueado:', this.usuario.rol);
      this.esSuperAdmin = this.usuario.rol === 'SuperAdmin';
    }

    if (this.esSuperAdmin && clienteAdminData) {
      const cliente = JSON.parse(clienteAdminData);
      this.usuario.id_cliente = cliente.id;
      console.log('🔍 ID Cliente extraído para SuperAdmin:', this.usuario.id_cliente);
    }

    this.cargarSucursales();
  }

cargarSucursales() {
  console.log('✅ Cargando sucursales para rol:', this.usuario.rol);

  if ([1, 2, 3, 4, 5].includes(this.usuario.rol_id)) {
    this.sucursalService.obtenerSucursalesPorUsuario(this.usuario.id).subscribe({
      next: (data) => {
        this.sucursales = data;
        this.balanceDiario = 0;

        let totalBalance = 0;
        let pendientes = this.sucursales.length;

        if (pendientes === 0) {
          this.balanceDiario = 0;
          return;
        }

        this.sucursales.forEach((suc) => {
          this.sucursalService.obtenerResumenSucursal(suc.id_sucursal).subscribe({
            next: (resumen) => {
              suc.ventas_dia = resumen.ventas_dia || 0;
              suc.ventas_semana = resumen.ventas_semana || 0;
              suc.ventas_mes = resumen.ventas_mes || 0;
              suc.empleados = resumen.empleados_activos || 0;

              totalBalance += Number(resumen.ventas_dia || 0);
              pendientes--;

              if (pendientes === 0) {
                this.balanceDiario = totalBalance;
              }
            },
            error: (err) => {
              console.error('❌ Error al obtener resumen de sucursal', err);
              pendientes--;
              if (pendientes === 0) {
                this.balanceDiario = totalBalance;
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('❌ Error cargando sucursales:', err);
      }
    });
  } else {
    console.error('⚠️ Rol no reconocido para cargar sucursales:', this.usuario.rol);
  }
}

  cargarResumenSucursal(sucursal: any) {
    this.sucursalService.obtenerResumenSucursal(sucursal.id_sucursal).subscribe({
      next: (resumen) => {
        sucursal.ventas_dia = resumen.ventas_dia || 0;
        sucursal.ventas_semana = resumen.ventas_semana || 0;
        sucursal.ventas_mes = resumen.ventas_mes || 0;
        sucursal.empleados = resumen.empleados_activos || 0;
        this.balanceDiario += sucursal.ventas_dia || 0;
      },
      error: (err) => {
        console.error('❌ Error al obtener resumen de sucursal', err);
      }
    });
  }

abrirModalAgregar() {
  this.nuevaSucursal = {
    id_cliente: this.usuario.id_cliente,
    nombre_sucursal: '',
    direccion: '',
    ubicacion_gps: '',
    encargado_nombre: '',
    encargado_telefono: '',
    encargado_email: ''
  };
  this.modoEditar = false;
  this.idSucursalEditando = null;
  this.mostrarModalAgregar = true;
}


guardarSucursal() {
  if (this.modoEditar && this.idSucursalEditando !== null) {
    this.sucursalService.editarSucursal(this.idSucursalEditando, this.nuevaSucursal).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Sucursal actualizada!',
          text: 'Se actualizó exitosamente.',
          confirmButtonColor: '#28a745'
        });
        this.mostrarModalAgregar = false;
        this.cargarSucursales();
        this.modoEditar = false;
        this.idSucursalEditando = null;
      },
      error: (err) => {
        console.error('❌ Error al actualizar sucursal:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al actualizar la sucursal.',
          confirmButtonColor: '#d33'
        });
      }
    });
  } else {
    this.sucursalService.crearSucursal(this.nuevaSucursal).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Sucursal creada!',
          text: 'Se agregó exitosamente.',
          confirmButtonColor: '#28a745'
        });
        this.mostrarModalAgregar = false;
        this.cargarSucursales();
      },
      error: (err) => {
        console.error('❌ Error al crear sucursal:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al guardar la sucursal.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}

  abrirFicha(sucursal: any) {
    this.sucursalSeleccionada = sucursal;
    this.mostrarFichaTecnica = true;

    this.sucursalService.obtenerResumenSucursal(sucursal.id_sucursal).subscribe({
      next: (resumen) => {
        this.sucursalSeleccionada.ventas_dia = resumen.ventas_dia;
        this.sucursalSeleccionada.ventas_semana = resumen.ventas_semana;
        this.sucursalSeleccionada.ventas_mes = resumen.ventas_mes;
        this.sucursalSeleccionada.empleados = resumen.empleados_activos;
      },
      error: (err) => {
        console.error('❌ Error al obtener resumen de sucursal', err);
      }
    });
  }

  cerrarFicha() {
    this.mostrarFichaTecnica = false;
    this.sucursalSeleccionada = null;
  }

  irASucursal(sucursal: any) {
    if (!sucursal.id_sucursal) {
      console.error('Error: esta sucursal no tiene id_sucursal', sucursal);
      return;
    }
    this.router.navigate(['/app/sucursal', sucursal.id_sucursal]);
  }

editarSucursal() {
  if (!this.sucursalSeleccionada) return;

  this.nuevaSucursal = {
    id_cliente: this.usuario.id_cliente,
    nombre_sucursal: this.sucursalSeleccionada.nombre_sucursal,
    direccion: this.sucursalSeleccionada.direccion,
    ubicacion_gps: this.sucursalSeleccionada.ubicacion_gps,
    encargado_nombre: this.sucursalSeleccionada.encargado_nombre,
    encargado_telefono: this.sucursalSeleccionada.encargado_telefono,
    encargado_email: this.sucursalSeleccionada.encargado_email
  };

  this.modoEditar = true;
  this.idSucursalEditando = this.sucursalSeleccionada.id_sucursal;

  this.mostrarFichaTecnica = false;
  this.mostrarModalAgregar = true;
}


  eliminarSucursal() {
    if (!this.sucursalSeleccionada?.id_sucursal) return;

    Swal.fire({
      title: 'Confirmación requerida',
      html: `<p>Para eliminar esta sucursal debes ingresar la clave de seguridad.</p>`,
      input: 'password',
      inputPlaceholder: 'Ingresa la clave de seguridad',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      preConfirm: (inputClave) => {
        if (inputClave !== this.CLAVE_SEGURIDAD_ELIMINAR) {
          Swal.showValidationMessage('❌ Clave incorrecta');
          return false;
        }
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.sucursalService.eliminarSucursal(this.sucursalSeleccionada.id_sucursal).subscribe({
          next: () => {
            Swal.fire('✅ Eliminado', 'La sucursal fue eliminada correctamente.', 'success');
            this.cerrarFicha();
            this.cargarSucursales();
          },
          error: (err) => {
            console.error('❌ Error al eliminar sucursal:', err);
            Swal.fire('❌ Error', 'No se pudo eliminar la sucursal.', 'error');
          }
        });
      }
    });
  }

  obtenerUbicacionActual() {
    if (!navigator.geolocation) {
      Swal.fire('Error', 'Tu navegador no soporta geolocalización.', 'error');
      return;
    }

    Swal.fire({
      title: 'Obteniendo ubicación...',
      didOpen: () => Swal.showLoading()
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.nuevaSucursal.ubicacion_gps = `${lat}, ${lng}`;
        Swal.close();
      },
      (error) => {
        Swal.fire('Error', 'No se pudo obtener la ubicación.', 'error');
        console.error(error);
      }
    );
  }

  regresarSuperAdmin() {
    Swal.fire({
      title: '¿Salir de Administración?',
      text: '¿Seguro que deseas salir de la administración de sucursales?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f5c518',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/app/clientes']);
      }
    });
  }
}
