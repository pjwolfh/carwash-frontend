import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import QRCodeStyling from 'ngx-qrcode-styling/lib/qr-code-styling';



@Component({
  selector: 'app-user-qr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-qr.component.html',
//   styleUrls: ['./user-qr.component.css']
})
export class UserQrComponent implements OnInit {
  @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef;

  qrCode: any;


  constructor() {
    // Puedes personalizar colores, logos, etc. aquí
    this.qrCode = new QRCodeStyling({
      width: 200,
      height: 200,
      type: 'canvas',
      data: '', // lo llenaremos en ngOnInit
      dotsOptions: {
        color: '#000',
        type: 'rounded'
      },
      backgroundOptions: {
        color: '#fff',
      }
    });
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      const user = JSON.parse(userData);
      const userId = user?.user_id ?? 'NO_USER_ID';

      this.qrCode.update({
        data: `https://tusitio.com/usuario/${userId}` // puedes cambiar la URL
      });

      this.qrCode.append(this.qrCanvas.nativeElement);
    }
  }
}
