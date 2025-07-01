import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import imageCompression from 'browser-image-compression';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from '../../environments/environment';


import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';

@Component({
  selector: 'app-bitacora-deller',
  standalone: true,
  templateUrl: './bitacora-deller.component.html',
  styleUrls: ['./bitacora-deller.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsMenuComponent
  ]
})
export class BitacoraDellerComponent implements OnInit {
  idDeller: string = '';
  deller: any = {};
  bitacoras: any[] = [];
  formBitacora: FormGroup;
  selectedFiles: (File | null)[] = [null, null, null, null];
  previews: string[] = ['', '', '', ''];
  mostrarFormulario: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.formBitacora = this.fb.group({
      vehiculo: [''],
      bin: [''],
      precio: [''],
      adicionales: ['']
    });
  }

  ngOnInit(): void {
    this.idDeller = this.route.snapshot.paramMap.get('id') || '';
    this.obtenerDeller();
    this.obtenerBitacoras();
  }

obtenerDeller() {
  this.http.get(`${environment.apiUrl}/api/dellers/${this.idDeller}`).subscribe((data: any) => {
    this.deller = data;
  });
}

obtenerBitacoras() {
  this.http.get<any[]>(`${environment.apiUrl}/api/dellers/bitacora/${this.idDeller}`).subscribe(data => {
    this.bitacoras = data;
  });
}

async onIndividualFileChange(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  if (input?.files && input.files[0]) {
    const file = input.files[0];

    // Opciones de compresión
    const options = {
      maxSizeMB: 0.5, // Máximo tamaño en MB
      maxWidthOrHeight: 1024, // Tamaño máximo en pixeles
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      this.selectedFiles[index - 1] = compressedFile;

      const reader = new FileReader();
      reader.onload = () => {
        this.previews[index - 1] = reader.result as string;
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('❌ Error al comprimir imagen:', error);
    }
  }
}


  nombreFoto(index: number): string {
    switch (index) {
      case 1: return 'Right';
      case 2: return 'Front';
      case 3: return 'Left';
      case 4: return 'Back';
      default: return 'Foto';
    }
  }

guardarBitacora() {
  const formData = new FormData();
  formData.append('id_deller', this.idDeller);
  formData.append('vehiculo', this.formBitacora.value.vehiculo);
  formData.append('bin', this.formBitacora.value.bin);
  formData.append('precio', this.formBitacora.value.precio);
  formData.append('adicionales', this.formBitacora.value.adicionales);

  this.selectedFiles.forEach((file, i) => {
    if (file) {
      formData.append(`foto${i + 1}`, file);
    }
  });

  this.http.post(`${environment.apiUrl}/api/dellers/bitacora/agregar`, formData).subscribe({
    next: () => {
      Swal.fire('✅ Bitácora guardada', 'El servicio fue registrado correctamente.', 'success');
      this.formBitacora.reset();
      this.selectedFiles = [null, null, null, null];
      this.previews = ['', '', '', ''];
      this.mostrarFormulario = false;
      this.obtenerBitacoras();
    },
    error: err => {
      console.error('❌ Error al guardar bitácora:', err);
      Swal.fire('Error', 'No se pudo guardar la bitácora.', 'error');
    }
  });
}

  volverALista() {
    window.history.back();
  }

  verImagenes(bitacora: any) {
    const fotos = [bitacora.foto1, bitacora.foto2, bitacora.foto3, bitacora.foto4].filter(Boolean);

    if (fotos.length === 0) return;

    let currentIndex = 0;

   const mostrarModal = () => {
  Swal.fire({
    html: `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <img src="${fotos[currentIndex]}" style="max-width:100%; max-height:60vh; border-radius:10px;" />
        <div style="margin-top:10px;">
          <button id="prev" class="swal2-styled">⬅</button>
          <button id="next" class="swal2-styled">➡</button>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    didOpen: () => {
      document.getElementById('prev')?.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + fotos.length) % fotos.length;
        Swal.close();
        mostrarModal();
      });

      document.getElementById('next')?.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % fotos.length;
        Swal.close();
        mostrarModal();
      });
    }
  });
};

mostrarModal();
}

eliminarBitacora(bitacora: any) {
  Swal.fire({
    title: '¿Eliminar registro?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      this.http.delete(`${environment.apiUrl}/api/dellers/bitacora/${bitacora.id_bitacora}`).subscribe({
        next: () => {
          Swal.fire('✅ Eliminado', 'El registro fue eliminado.', 'success');
          this.obtenerBitacoras();
        },
        error: err => {
          console.error('❌ Error al eliminar bitácora:', err);
          Swal.fire('Error', 'No se pudo eliminar la bitácora.', 'error');
        }
      });
    }
  });
}

exportarBitacorasPDF() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(16);
  doc.text(`Bitácora de Servicios - ${this.deller?.nombre || ''}`, 14, y);
  y += 10;

  const maxImgHeight = 30;
  const maxImgWidth = 40;

  const drawRow = (bitacora: any, index: number, callback: () => void) => {
    // 🔢 Número + Fecha de registro
    doc.setFontSize(12);
    doc.setTextColor(100);
    const fecha = new Date(bitacora.fecha_registro);
    const fechaFormateada = `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    doc.text(`${index + 1}. ${fechaFormateada}`, 14, y + 5);
    y += 7;

    // Encabezado
    doc.setFillColor(41, 128, 185); // azul
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.rect(14, y, pageWidth - 28, 8, 'F');
    doc.text('Vehículo', 16, y + 6);
    doc.text('BIN', 66, y + 6);
    doc.text('Precio', 116, y + 6);
    doc.text('Adicionales', 156, y + 6);
    y += 8;

    // Datos
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(bitacora.vehiculo || '', 16, y + 6);
    doc.text(bitacora.bin || '', 66, y + 6);
    doc.text(`Q${parseFloat(bitacora.precio).toFixed(2)}`, 116, y + 6);
    doc.text(bitacora.adicionales || 'N/A', 156, y + 6);
    y += 14;

    // Imágenes
    const fotos = [bitacora.foto1, bitacora.foto2, bitacora.foto3, bitacora.foto4].filter(Boolean);
    let loaded = 0;

    if (fotos.length === 0) {
      callback();
      return;
    }

    fotos.forEach((foto, j) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = foto;

      img.onload = () => {
        const x = 14 + j * (maxImgWidth + 5);
        doc.addImage(img, 'JPEG', x, y, maxImgWidth, maxImgHeight);
        loaded++;
        if (loaded === fotos.length) {
          y += maxImgHeight + 10;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          callback();
        }
      };

      img.onerror = () => {
        console.error('❌ Error al cargar imagen:', foto);
        loaded++;
        if (loaded === fotos.length) {
          y += maxImgHeight + 10;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          callback();
        }
      };
    });
  };

  const drawAll = (index = 0) => {
    if (index >= this.bitacoras.length) {
      doc.save(`bitacora_${this.deller?.nombre || 'deller'}.pdf`);
      return;
    }

    drawRow(this.bitacoras[index], index, () => drawAll(index + 1));
  };

  drawAll();
}
}
