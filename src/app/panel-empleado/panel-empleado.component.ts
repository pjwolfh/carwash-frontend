import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { EmpleadoService } from '../empleado/empleado.service';

@Component({
  selector: 'app-panel-empleado',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './panel-empleado.component.html',
  styleUrls: ['./panel-empleado.component.css']
})
export class EmpleadoPanelComponent implements OnInit {

  empleado: any = {};
  historial: any[] = [];
  totalGanado: number = 0;
    today: Date = new Date(); // ✅ restaurado
    

  constructor(
    private router: Router,
    private empleadoService: EmpleadoService
  ) {}

  ngOnInit(): void {
  const data = localStorage.getItem('usuario');
  if (data) {
    const usuario = JSON.parse(data);
    this.empleado = {
      nombre: usuario.nombre || usuario.nombre_contacto || 'Colaborador',
      hora_entrada: usuario.hora_entrada || '—',
      hora_salida: usuario.hora_salida || '—',
      dia_descanso: usuario.dia_descanso || '—',
      user_id: usuario.user_id || null
      
    };

    if (usuario.user_id) {
      this.cargarHistorial(usuario.user_id);
    }
  } else {
    this.router.navigate(['/login']);
  }
}

  cargarHistorial(user_id: string): void {
    
    this.empleadoService.obtenerHistorial(user_id).subscribe({
      
      next: (data: any[]) => {
        this.historial = data.map(h => ({
  fecha: h.fecha?.split('T')[0] || '—',
  hora_entrada: h.hora_entrada || '—',
  hora_salida: h.hora_salida || '—',
  total_horas: Number(h.horas || 0),
  total_q: Number(h.pago || 0)
}));

        console.log('📊 Datos recibidos:', data);

       this.totalGanado = this.historial.reduce((sum, h) => sum + Number(h.total_q || 0), 0);

      },
      error: (err) => {
        console.error('❌ Error al cargar historial:', err);
      }
    });
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
