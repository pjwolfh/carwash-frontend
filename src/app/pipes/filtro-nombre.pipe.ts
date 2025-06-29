import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroNombre',
  standalone: true
})
export class FiltroNombrePipe implements PipeTransform {
    transform(clientes: any[], filtro: string): any[] {
        if (!filtro) return clientes;
        return clientes.filter(c =>
          (c.nombre_empresa ?? '').toLowerCase().includes(filtro.toLowerCase())
        );
      }
      
}


