import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { BackgroundWrapperComponent } from './background-wrapper/background-wrapper.component';
import { HomeComponent } from './home/home.component';
import { SucursalesComponent } from './sucursales/sucursales.component';
import { EmpleadoComponent } from './empleado/empleado.component';
import { CoordinadorComponent } from './coordinador/coordinador.component';
import { SucursalDetalleComponent } from './sucursal-detalle/sucursal-detalle.component';
import { DellersComponent } from './dellers/dellers.component';
import { RegalosComponent } from './regalos/regalos.component';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'app',
    component: BackgroundWrapperComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'sucursales', component: SucursalesComponent },
      { path: 'dellers', component: DellersComponent },

      {
        path: 'seleccionar-sucursal',
        loadComponent: () =>
          import('./seleccionar-sucursal/seleccionar-sucursal.component').then(m => m.SeleccionarSucursalComponent)
      },
      {
        path: 'sucursal/:idSucursal',
        component: SucursalDetalleComponent
      },
      {
        path: 'sucursal/:idSucursal/regalos',
        component: RegalosComponent
      },
      {
        path: 'sucursal/:idSucursal/empleados',
        component: EmpleadoComponent
      },
      {
        path: 'sucursal/:idSucursal/empleados/agregar',
        loadComponent: () =>
          import('./agregar-empleado/agregar-empleado.component').then(m => m.AgregarEmpleadoComponent)
      },
      {
        path: 'sucursal/:idSucursal/empleados/editar/:idEmpleado',
        loadComponent: () =>
          import('./editar-empleado/editar-empleado.component').then(m => m.EditarEmpleadoComponent)
      },
      {
        path: 'sucursal/:idSucursal/servicios',
        loadComponent: () =>
          import('./menu-servicios/menu-servicios.component').then(m => m.MenuServiciosComponent)
      },
      {
        path: 'panel-empleado',
        loadComponent: () =>
          import('./panel-empleado/panel-empleado.component').then(m => m.EmpleadoPanelComponent)
      },
      {
        path: 'sucursal/:idSucursal/empleados/horarios/:id_empleado',
        loadComponent: () =>
          import('./empleado-horarios/empleado-horarios.component').then(m => m.EmpleadoHorariosComponent)
      },
      {
        path: 'lector-qr',
        loadComponent: () =>
          import('./lector-qr/lector-qr.component').then(m => m.LectorQrComponent)
      },
      {
        path: 'sucursal/:idSucursal/lector-qr',
        loadComponent: () =>
          import('./lector-qr/lector-qr.component').then(m => m.LectorQrComponent)
      },
      {
        path: 'sucursal/:idSucursal/validar-canje',
        loadComponent: () =>
          import('./validar-canje/validar-canje.component').then(m => m.ValidarCanjeComponent)
      },
      {
        path: 'sucursal/:idSucursal/ventas-qr',
        loadComponent: () =>
          import('./ventas-qr/ventas-qr.component').then(m => m.VentasQrComponent)
      },
      {
        path: 'bitacora-deller/:id',
        loadComponent: () =>
          import('./bitacora-deller/bitacora-deller.component').then(m => m.BitacoraDellerComponent)
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./clientes/clientes.component').then(m => m.ClientesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
