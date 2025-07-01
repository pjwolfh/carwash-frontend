import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent implements OnInit {
  usuario: any = {};
  qrVisible = false;
  qrValue = '';
  apiUrl = `${environment.apiUrl}/api/usuarios/codigo/`;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      this.usuario = JSON.parse(userData);
      this.qrValue = this.usuario?.user_id ?? '';
      console.log('📦 Usuario en LocalStorage:', this.usuario);
      console.log('🔗 QR generado:', this.qrValue);

      // 🚀 Traer puntos y servicios actualizados
      this.http.get<any>(this.apiUrl + this.qrValue).subscribe({
        next: (data) => {
          console.log('✅ Datos desde backend:', data);
          this.usuario.puntos = data.puntos;
          this.usuario.servicios_acumulados = data.servicios_acumulados;
        },
        error: (err) => {
          console.error('❌ Error al obtener puntos y servicios:', err);
        }
      });
    } else {
      console.warn('⚠️ No hay datos del usuario en localStorage');
    }
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  @Output() showQr = new EventEmitter<void>();

  toggleQR() {
    console.log('📢 Emitiendo showQr...');
    this.showQr.emit();
  }
}
