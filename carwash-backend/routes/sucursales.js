const express = require('express'); 
const router = express.Router();
const sucursalesController = require('../controllers/sucursalesController');

// ✅ Obtener todas las sucursales
router.get('/', sucursalesController.obtenerTodasSucursales);

// ✅ Obtener resumen de una sucursal específica
router.get('/resumen/:id', sucursalesController.obtenerResumenSucursal);

// ✅ Obtener sucursal por ID
router.get('/id/:id', sucursalesController.obtenerSucursalPorId);

// ✅ Obtener sucursales por cliente
router.get('/:idCliente', sucursalesController.obtenerSucursalesPorCliente);

// ✅ Crear nueva sucursal
router.post('/', sucursalesController.crearSucursal);

// ✅ Editar sucursal
router.put('/:id', sucursalesController.editarSucursal);

// ✅ Eliminar sucursal
router.delete('/:id', sucursalesController.eliminarSucursal);

module.exports = router;
