const express = require('express');
const router = express.Router();

const {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  editarCliente,
  eliminarCliente,
  obtenerServiciosPorCliente,
  obtenerVentasDelDiaPorCliente,
  getUsuarioPorCliente,
  resetearPasswordCliente
} = require('../controllers/clientesController');

// 🧩 Endpoints principales
router.get('/', obtenerClientes);
router.get('/:id', obtenerClientePorId);
router.post('/crear', crearCliente);
router.put('/:id', editarCliente);
router.delete('/:id', eliminarCliente);

// 🔁 Servicios y ventas relacionados al cliente
router.get('/:clienteId/servicios', obtenerServiciosPorCliente);
router.get('/:clienteId/ventas-hoy', obtenerVentasDelDiaPorCliente);

// 🔐 Info de usuario del cliente
router.get('/:clienteId/usuario', getUsuarioPorCliente);

// 🔁 Reset de contraseña
router.put('/:id/reset-password', resetearPasswordCliente);

module.exports = router;
