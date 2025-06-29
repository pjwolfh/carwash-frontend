const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const {
  obtenerHistorialSemanal,
  obtenerHistorialPorEmpleado,
  obtenerHistorialPorRango ,
  filtrarAsistenciasPorFechas 
  
} = require('../controllers/asistencias.controller'); 

// POST /api/asistencias
router.post('/', (req, res) => {
  console.log('📥 POST /api/asistencias alcanzado');
  const { user_id } = req.body;
  console.log('🆔 user_id recibido:', user_id);

  if (!user_id) {
    return res.status(400).json({ error: 'Falta user_id' });
  }

  const queryEmpleado = `
    SELECT empleados.id_empleado, usuarios.nombre_contacto 
    FROM empleados 
    JOIN usuarios ON empleados.id_usuario = usuarios.id 
    WHERE usuarios.user_id = ?
  `;

  db.query(queryEmpleado, [user_id], (err, results) => {
    if (err) {
      console.error('❌ Error al buscar empleado:', err);
      return res.status(500).json({ error: err });
    }

    console.log('🟢 Resultados:', results);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const empleado = results[0];
    const id_empleado = empleado.id_empleado;
    const nombre_empleado = empleado.nombre_contacto || 'Empleado';
    const hoy = new Date().toISOString().slice(0, 10);
    const horaActual = new Date().toLocaleTimeString('es-GT', { hour12: false });

    const buscarAsistencia = `
      SELECT * FROM asistencias 
      WHERE id_empleado = ? AND fecha = ? 
      ORDER BY id DESC LIMIT 1
    `;

    db.query(buscarAsistencia, [id_empleado, hoy], (err2, registros) => {
      if (err2) {
        console.error('❌ Error al buscar asistencia:', err2);
        return res.status(500).json({ error: err2 });
      }

      const registro = registros[0];

      if (!registro || registro.hora_salida) {
        const insertar = `
          INSERT INTO asistencias (id_empleado, fecha, hora_entrada) 
          VALUES (?, ?, ?)
        `;
        db.query(insertar, [id_empleado, hoy, horaActual], (err3) => {
          if (err3) {
            console.error('❌ Error al registrar entrada:', err3);
            return res.status(500).json({ error: err3 });
          }
          return res.json({
            tipo: 'entrada',
            nombre_empleado,
            mensaje: `Entrada registrada correctamente para ${nombre_empleado}`
          });
        });
      } else {
        const actualizar = `
          UPDATE asistencias SET hora_salida = ? WHERE id = ?
        `;
        db.query(actualizar, [horaActual, registro.id], (err4) => {
          if (err4) {
            console.error('❌ Error al registrar salida:', err4);
            return res.status(500).json({ error: err4 });
          }
          return res.json({
            tipo: 'salida',
            nombre_empleado,
            mensaje: `Salida registrada correctamente para ${nombre_empleado}`
          });
        });
      }
    });
  });
});

// ✅ Obtener nombre del empleado por id_empleado
router.get('/nombre/:id_empleado', (req, res) => {
  const { id_empleado } = req.params;

  const query = `
    SELECT u.nombre_contacto 
    FROM empleados e
    JOIN usuarios u ON e.id_usuario = u.id
    WHERE e.id_empleado = ?
  `;

  db.query(query, [id_empleado], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(results[0]);
  });
});


// ✅ Historial semanal por user_id (para empleados)
router.get('/historial/:user_id', obtenerHistorialSemanal);

// ✅ Historial completo por id_empleado (para panel del dueño)
router.get('/empleado/:id_empleado', obtenerHistorialPorEmpleado);

// ✅ Historial por rango
router.get('/empleado/:id_empleado/rango', obtenerHistorialPorRango);

// GET /api/asistencias/filtrar?id_empleado=1&desde=2025-06-01&hasta=2025-06-10
router.get('/filtrar', filtrarAsistenciasPorFechas);




module.exports = router;
