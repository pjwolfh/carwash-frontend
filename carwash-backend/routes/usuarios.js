const express = require('express');
const router = express.Router();

const { 
  loginUsuario, 
  crearUsuario, 
  obtenerUsuario,
  obtenerUsuarios,
  editarUsuario,
  eliminarUsuario,
  resetearPasswordCliente,
  obtenerVentasDelDiaPorCliente,
  obtenerServiciosPorCliente,
  getCredencialesUsuario,
  obtenerUsuarioPorCodigo,
  obtenerSucursalesPorUsuario // ✅ nuevo
} = require('../controllers/usuariosController');

// 🔐 Login del usuario
router.post('/login', loginUsuario);

// 🆕 Registro del usuario
router.post('/registrar', crearUsuario);

// 🔍 Obtener todos los usuarios
router.get('/', obtenerUsuarios);

// 🔍 Obtener usuario por ID numérico (ej. /usuarios/13)
router.get('/:id', obtenerUsuario);

// 🔍✅ Obtener usuario por código alfanumérico (ej. /usuarios/codigo/7P8NQU)
router.get('/codigo/:user_id', obtenerUsuarioPorCodigo);

// ✅ Editar usuario
router.put('/:id', editarUsuario);

// ❌ Eliminar usuario
router.delete('/:id', eliminarUsuario);

// 🔁 Resetear contraseña
router.put('/reset-password/:id', resetearPasswordCliente);

// 📊 Ventas del día
router.get('/:id/ventas-hoy', obtenerVentasDelDiaPorCliente);

// 🛠️ Servicios del cliente
router.get('/:id/servicios', obtenerServiciosPorCliente);

// 🔐 Credenciales del usuario
router.get('/:id/credenciales', getCredencialesUsuario);

// 🔗 Sucursales asignadas al usuario
router.get('/:id/sucursales', obtenerSucursalesPorUsuario); // ✅ NUEVO

module.exports = router;
