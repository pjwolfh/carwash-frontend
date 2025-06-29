import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gifts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gifts.component.html',
})
export class GiftsComponent implements OnInit {
  apiUrl = 'http://localhost:3000/uploads/';
  endpointApi = 'http://localhost:3000/api/';
  regalos: any[] = [];
  usuario: any = {};
  cargandoCanje: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      this.usuario = JSON.parse(userData);
      if (!this.usuario.id) {
        Swal.fire({ icon: 'error', title: 'Error', text: '⚠️ El ID del usuario no está definido.' });
        return;
      }
      this.obtenerRegalos();
    }
  }

  obtenerRegalos() {
    this.http.get<any[]>(this.endpointApi + 'regalos').subscribe({
      next: (data) => (this.regalos = data),
      error: () => Swal.fire('Error', 'No se pudieron cargar los regalos', 'error'),
    });
  }

  estaCargando(id: number): boolean {
    return this.cargandoCanje === id;
  }

  canjear(regalo: any) {
    if (this.usuario.puntos < regalo.puntos_requeridos) {
      Swal.fire({ icon: 'warning', title: 'Puntos insuficientes', text: 'No tienes suficientes puntos.' });
      return;
    }

    this.cargandoCanje = regalo.id;
const payload = {
  user_id: this.usuario.user_id,
  id_regalo: regalo.id  // ✅ nombre correcto esperado por el backend
};


    this.http.post(this.endpointApi + 'regalos/canjear', payload).subscribe({
      next: (res: any) => {
        this.usuario.puntos -= regalo.puntos_requeridos;
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.cargandoCanje = null;

        Swal.fire({
          icon: 'success',
          title: '🎁 ¡Canje exitoso!',
          html: `
            <p>Has canjeado: <strong>${res.nombre_regalo}</strong></p>
            <p><strong>Código de validación:</strong></p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${res.codigo_validacion}" />
            <p class="mt-2"><code>${res.codigo_validacion}</code></p>
          `
        });
      },
      error: (err) => {
        this.cargandoCanje = null;
        const mensaje = err?.error?.error || 'Error inesperado al procesar el canje.';
        Swal.fire('Error', mensaje, 'error');
      },
    });
  }
}
