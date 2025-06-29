import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlHorariosService } from '../services/control-horarios.service'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-control-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-horarios.component.html',
  styleUrls: ['./control-horarios.component.css']
})
export class ControlHorariosComponent implements OnInit {
  empleado: any = {};
  ultimoMovimiento: string = '';

  constructor(private controlHorariosService: ControlHorariosService) {}

  ngOnInit(): void {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.empleado = JSON.parse(data);
    }
  }

  marcarEntrada() {
    this.controlHorariosService.marcarEntrada(this.empleado.id).subscribe(() => {
      this.ultimoMovimiento = 'Entrada registrada';
    });
  }

  marcarInicioLunch() {
    this.controlHorariosService.inicioLunch(this.empleado.id).subscribe(() => {
      this.ultimoMovimiento = 'Inicio de lunch registrado';
    });
  }

  marcarRegresoLunch() {
    this.controlHorariosService.regresoLunch(this.empleado.id).subscribe(() => {
      this.ultimoMovimiento = 'Regreso de lunch registrado';
    });
  }

  marcarSalida() {
    this.controlHorariosService.finLunch(this.empleado.id).subscribe(() => {
      this.ultimoMovimiento = 'Salida registrada';
    });
  }
}
