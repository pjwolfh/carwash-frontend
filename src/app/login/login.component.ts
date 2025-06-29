import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioService } from '../services/usuario.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  telefono: string = '';
  email: string = '';
  nuevoTelefono: string = '';
  mostrarFormRegistro: boolean = false;

  usuarioService = inject(UsuarioService);
  http = inject(HttpClient);
  router = inject(Router);

  login() {
    if (!this.telefono.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor, ingrese su número de teléfono',
        confirmButtonColor: '#f5b400'
      });
      return;
    }

    this.usuarioService.iniciarSesion(this.telefono).subscribe({
      next: (usuarioBackend) => {
        const id_cliente = usuarioBackend.id_cliente || (
          [2, 3].includes(usuarioBackend.rol_id) ? usuarioBackend.id : null
        );

        const usuario = {
          id: usuarioBackend.id,
          nombre: usuarioBackend.nombre_contacto || 'Usuario',
          telefono: usuarioBackend.telefono,
          email: usuarioBackend.email || '',
          rol_id: usuarioBackend.rol_id,
          rol: this.obtenerRolTexto(usuarioBackend.rol_id),
          id_cliente,
          user_id: usuarioBackend.user_id,
          hora_entrada: usuarioBackend.hora_entrada || '',
          hora_salida: usuarioBackend.hora_salida || '',
          dia_descanso: usuarioBackend.dia_descanso || '',
          id_sucursal: usuarioBackend.id_sucursal || null
        };

        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('rol_usuario', usuario.rol_id.toString());

        console.log('🧠 Usuario guardado:', usuario);

        if (usuario.rol_id === 1) {
          // Cliente - verificar sucursales
          this.http.get<any[]>(`http://localhost:3000/api/usuarios/${usuario.id}/sucursales`).subscribe({
            next: (sucursales) => {
              if (sucursales.length === 1) {
                localStorage.setItem('id_sucursal_activa', sucursales[0].id_sucursal);
                this.router.navigate(['/app/home']);
              } else if (sucursales.length > 1) {
                localStorage.setItem('sucursales_cliente', JSON.stringify(sucursales));
                this.router.navigate(['/app/seleccionar-sucursal']);
              } else {
                Swal.fire('⚠️ Error', 'No estás asignado a ninguna sucursal. Consulta al administrador.', 'warning');
              }
            },
            error: (err) => {
              console.error('❌ Error al obtener sucursales:', err);
              Swal.fire('Error', 'No se pudieron obtener las sucursales.', 'error');
            }
          });

        } else {
          // Otros roles
          switch (usuario.rol_id) {
            case 2: this.router.navigate(['/app/clientes']); break;      // SuperAdmin
            case 3: this.router.navigate(['/app/sucursales']); break;    // Dueño
            case 4: this.router.navigate(['/app/panel-empleado']); break;// Empleado
            case 5: this.router.navigate(['/app/sucursales']); break;   // Coordinador
            default: this.router.navigate(['/app/home']);
          }
        }
      },
      error: (err) => {
        if (err.status === 404) {
          Swal.fire({
            icon: 'info',
            title: 'Usuario no registrado',
            text: 'Este número no está registrado. Puedes crear una cuenta nueva.',
            confirmButtonText: 'Registrar',
            confirmButtonColor: '#007bff'
          }).then(() => {
            this.nuevoTelefono = this.telefono;
            this.mostrarFormularioRegistro();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo iniciar sesión',
            confirmButtonColor: '#dc3545'
          });
        }
      }
    });
  }

  obtenerRolTexto(rol_id: number): string {
    switch (rol_id) {
      case 1: return 'Cliente';
      case 2: return 'SuperAdmin';
      case 3: return 'Dueño';
      case 4: return 'Empleado';
      case 5: return 'Coordinador';
      default: return 'Desconocido';
    }
  }

  registrar() {
    if (!this.nuevoTelefono.trim() || !this.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, complete todos los campos',
        confirmButtonColor: '#f5b400'
      });
      return;
    }

    this.usuarioService.registrarUsuario(this.email, this.nuevoTelefono).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Usuario registrado correctamente',
          confirmButtonColor: '#28a745'
        });
        this.mostrarFormularioLogin();
      },
      error: (err) => {
        console.error('❌ Error al registrar:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un problema al registrar el usuario',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  mostrarFormularioRegistro() {
    this.mostrarFormRegistro = true;
  }

  mostrarFormularioLogin() {
    this.mostrarFormRegistro = false;
  }
}
