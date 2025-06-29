import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coordinador',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div class="text-center">
        <h2 class="text-success">📋 Panel del Coordinador</h2>
        <p class="text-muted">Aquí podrás gestionar empleados, verificar jornadas y reportes.</p>
      </div>
    </div>
  `
})
export class CoordinadorComponent {}
