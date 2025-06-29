import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';

@Component({
  selector: 'app-validar-canje',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule, SettingsMenuComponent],
  templateUrl: './validar-canje.component.html',
})
export class ValidarCanjeComponent {
  codigo: string = '';
  canje: any = null;
  formatsEnabled: BarcodeFormat[] = [BarcodeFormat.QR_CODE];
selectedDevice: MediaDeviceInfo | undefined = undefined;


  constructor(private http: HttpClient) {}

  onQrScanned(qrCode: string) {
    console.log('📷 Código escaneado:', qrCode);
    this.codigo = qrCode;
    this.buscarCanje();
  }

  onScanError(error: any) {
    console.error('📛 Error del escáner QR:', error);
    Swal.fire('Error al escanear', 'No se pudo acceder a la cámara o leer el código.', 'error');
  }

  buscarCanje() {
    if (!this.codigo.trim()) {
      Swal.fire('Campo vacío', 'Por favor ingresa un código de validación.', 'warning');
      return;
    }

    this.http.post('http://localhost:3000/api/canjes/validar', { codigo: this.codigo }).subscribe({
      next: (res: any) => {
        this.canje = res.canje;
        Swal.fire('✅ Canje encontrado', 'Puedes proceder a entregarlo.', 'info');
      },
      error: (err) => {
        console.error('❌ Error al validar canje:', err);
        Swal.fire('Código inválido', err.error?.error || 'No se encontró el canje', 'error');
        this.canje = null;
      }
    });
  }

  entregarCanje() {
    this.http.post('http://localhost:3000/api/canjes/entregar', { codigo: this.codigo }).subscribe({
      next: () => {
        Swal.fire('🎉 Canje entregado', 'El regalo ha sido marcado como entregado.', 'success');
        if (this.canje) this.canje.estado = 'entregado';
      },
      error: (err) => {
        console.error('❌ Error al marcar como entregado:', err);
        Swal.fire('Error', err.error?.error || 'No se pudo entregar el canje', 'error');
      }
    });
  }

  regresarSucursales() {
    window.history.back();
  }
}
