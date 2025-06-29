const express = require('express');
const router = express.Router();
const controlHorarios = require('../controllers/controlHorariosController');

// 🧩 Rutas
router.post('/entrada', controlHorarios.marcarEntrada);
router.put('/inicio-lunch', controlHorarios.marcarInicioLunch);
router.put('/regreso-lunch', controlHorarios.marcarRegresoLunch);
router.put('/salida', controlHorarios.marcarSalida);
router.get('/empleado/:id_empleado', controlHorarios.obtenerControlHoy);

module.exports = router;
