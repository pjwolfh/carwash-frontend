const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleadosController');
const db = require('../db/connection'); // necesario para la ruta directa

// Listar empleados por sucursal
router.get('/:idSucursal', empleadosController.obtenerEmpleadosPorSucursal);

// Crear nuevo empleado
router.post('/', empleadosController.crearEmpleado);

// Eliminar (lógico o físico)
router.delete('/:idEmpleado', empleadosController.eliminarEmpleado);

// Actualizar datos de un empleado
router.put('/:idEmpleado', empleadosController.actualizarEmpleado);

// Obtener empleado por ID (ruta antigua basada en ID numérico)
router.get('/buscar/:idEmpleado', empleadosController.obtenerEmpleadoPorId);

// 🔍 Buscar empleado por user_id (usado por QR)
router.post('/buscar', (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Falta user_id' });

  db.query('SELECT id, nombre_contacto FROM usuarios WHERE user_id = ?', [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });

    return res.json(rows[0]);
  });
});

// ✅ NUEVA RUTA PARA PANEL EMPLEADO
router.get('/info/:user_id', empleadosController.obtenerEmpleadoPorUserId);

module.exports = router;
