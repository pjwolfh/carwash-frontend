import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ClientesService } from '../services/clientes.service';
import { Router } from '@angular/router';
import { FiltroNombrePipe } from '../pipes/filtro-nombre.pipe';
import Swal from 'sweetalert2';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component'; // Ajusta ruta si está en otra carpeta

interface Cliente {
  id: number;
  nombre_empresa: string;
  nombre_contacto: string;
  telefono: string;
  email: string;
  password?: string;

  rol_id: number;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, FiltroNombrePipe,SettingsMenuComponent],
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  nuevoCliente: Partial<Cliente> = {
    nombre_empresa: '',
    nombre_contacto: '',
    telefono: '',
    email: '',
    password: '',
    rol_id: 3
  };

  editando: Cliente | null = null;
  usuario: any = {};
  filtro: string = '';
  clienteSeleccionado: Cliente | null = null;
  mostrarModalFicha = false;
  mostrarModalAgregar = false;
  mostrarModalEditar = false;
  mostrarPassword = false;
  verPassword = false;
  usuarioDelCliente: any = null;
  serviciosCliente: any[] = [];
  ventasHoy: { cantidad: number; total: number } = { cantidad: 0, total: 0 };
  mostrarConfirmacionEliminacion = false;
  codigoVerificacion = '';

  constructor(
    private clienteService: ClientesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      this.usuario = JSON.parse(userData);
    }
    this.cargarClientes();
  }

  cargarClientes() {
    this.clienteService.getClientes().subscribe(data => (this.clientes = data));
  }

  abrirModalAgregar() {
    this.mostrarModalAgregar = true;
    this.nuevoCliente = {
      nombre_empresa: '',
      nombre_contacto: '',
      telefono: '',
      email: '',
      password: '',
      rol_id: 3
    };
  }

  cerrarModalAgregar() {
    this.mostrarModalAgregar = false;
  }

  guardarCliente() {
    if (this.editando) {
      this.clienteService.updateCliente(this.editando.id, this.nuevoCliente).subscribe(() => {
        this.cargarClientes();
        this.cancelarEdicion();
        this.mostrarModalEditar = false;
        Swal.fire({
          icon: 'success',
          title: 'Cliente actualizado',
          text: 'Los cambios se han guardado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      });
    } else {
      this.clienteService.addCliente(this.nuevoCliente).subscribe(() => {
        this.cargarClientes();
        this.nuevoCliente = {};
        Swal.fire({
          icon: 'success',
          title: 'Cliente agregado',
          text: 'Se agregó el cliente correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      });
    }
  }

  editarCliente(cliente: Cliente) {
    this.editando = cliente;
    this.nuevoCliente = { ...cliente };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.cancelarEdicion();
  }

  cancelarEdicion() {
    this.editando = null;
    this.nuevoCliente = {};
  }

  abrirFicha(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
    this.mostrarModalFicha = true;

    this.clienteService.getUsuarioPorCliente(cliente.id).subscribe(usuario => {
      this.usuarioDelCliente = usuario;
    });

    this.clienteService.getServiciosPorCliente(cliente.id).subscribe(data => {
      this.serviciosCliente = data;
    });

    this.clienteService.getVentasHoyPorCliente(cliente.id).subscribe(data => {
      this.ventasHoy = data;
    });
  }

  resetearPassword(cliente: Cliente) {
    Swal.fire({
      title: `¿Resetear contraseña para ${cliente.nombre_empresa}?`,
      html: `La nueva contraseña será: <b>123456</b><br><br>
             <button class="btn btn-sm btn-primary" onclick="navigator.clipboard.writeText('123456')">
             📋 Copiar contraseña
             </button>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, resetear',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const button = Swal.getPopup()?.querySelector('button');
        if (button) {
          button.addEventListener('click', () => {
            Swal.showValidationMessage('Contraseña copiada ✔');
          });
        }
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.clienteService.resetearPassword(cliente.id).subscribe(() => {
          Swal.fire('¡Éxito!', 'Contraseña restablecida a 123456', 'success');
        });
      }
    });
  }

  confirmarEliminacion(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
    this.codigoVerificacion = '';
    this.mostrarConfirmacionEliminacion = true;
  }
  

  eliminarConfirmado() {
    if (this.codigoVerificacion !== '123456') {
      alert('Código incorrecto. Debe ingresar el código 123456.');
      return;
    }
  
    if (this.clienteSeleccionado) {
      this.clienteService.deleteCliente(this.clienteSeleccionado.id).subscribe(() => {
        this.cargarClientes();
        this.mostrarConfirmacionEliminacion = false;
        this.clienteSeleccionado = null;
      });
    }
  }
  
verCliente(cliente: Cliente) {
  // Guardamos el cliente temporalmente para administración
  localStorage.setItem('clienteAdmin', JSON.stringify(cliente));

  // Navegamos a sucursales
  this.router.navigate(['/app/sucursales']);
}

  
  
}
