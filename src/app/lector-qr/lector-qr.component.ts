import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { HttpClient } from '@angular/common/http';
import { BarcodeFormat } from '@zxing/library';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-lector-qr',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './lector-qr.component.html',
  styleUrls: ['./lector-qr.component.css']
})
export class LectorQrComponent implements OnInit {
  currentDevice: MediaDeviceInfo | undefined;
  mensaje: string = '';
  estado: 'ok' | 'error' | null = null;
  scannedRecently = false;
  scannedUserId: string = ''; // ✅ importante
  formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getDevices();
  }

  getDevices() {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      if (videoDevices.length > 0) {
        this.currentDevice = videoDevices[0];
      } else {
        console.warn('No se encontraron cámaras.');
      }
    }).catch(err => console.error('Error al obtener cámaras:', err));
  }

  // ✅ Escaneo exitoso
  onScanSuccess(data: string) {
    this.scannedUserId = data;
  }

  // ✅ Al presionar botón "Registrar"
  registrarManual() {
    if (!this.scannedUserId || this.scannedRecently) return;

    this.scannedRecently = true;

    this.http.post(`${environment.apiUrl}/api/asistencias`, { user_id: this.scannedUserId }).subscribe({
      next: (res: any) => {
        this.mensaje = `✅ Bienvenido, ${res.nombre_empleado || 'Empleado'}. Entrada registrada con éxito.`;
        this.estado = 'ok';
        this.limpiar();
      },
      error: () => {
        this.mensaje = '❌ Error al registrar la asistencia.';
        this.estado = 'error';
        this.limpiar();
      }
    });
  }

  // ✅ Reset de mensaje, estado y bandera
  limpiar() {
    setTimeout(() => {
      this.mensaje = '';
      this.estado = null;
      this.scannedRecently = false;
      this.scannedUserId = '';
    }, 3000);
  }
}
