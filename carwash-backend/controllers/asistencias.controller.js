const db = require('../db/connection');

// ✅ Registrar asistencia (entrada o salida)
const registrarAsistencia = (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Falta user_id' });
  }

  const obtenerEmpleado = `
    SELECT u.id AS id_empleado, u.nombre_contacto, e.hora_entrada, e.dia_descanso
    FROM usuarios u
    JOIN empleados e ON u.id = e.id_usuario
    WHERE u.user_id = ?
  `;

  db.query(obtenerEmpleado, [user_id], (err, resultados) => {
    if (err) return res.status(500).json({ error: err });
    if (resultados.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });

    const empleado = resultados[0];
    const id_empleado = empleado.id_empleado;
    const nombre_empleado = empleado.nombre_contacto || 'Empleado';
    const horaPermitida = empleado.hora_entrada;
    const diaDescanso = empleado.dia_descanso;

    const hoy = new Date();
    const fecha = hoy.toISOString().slice(0, 10);
    const horaActual = hoy.toTimeString().slice(0, 8);
    const diaSemana = hoy.toLocaleDateString('es-GT', { weekday: 'long' });

    if (diaSemana.toLowerCase() === diaDescanso.toLowerCase()) {
      return res.status(403).json({ error: 'Hoy es tu día de descanso. No puedes registrar asistencia.' });
    }

    const [h, m] = horaPermitida.split(':');
    const entradaPermitida = new Date(hoy);
    entradaPermitida.setHours(h, m - 10, 0);

    if (hoy < entradaPermitida) {
      return res.status(403).json({ error: `Solo puedes registrar tu entrada 10 minutos antes de las ${horaPermitida}` });
    }

    const buscarAsistencia = `
      SELECT * FROM asistencias 
      WHERE id_empleado = ? AND fecha = ? 
      ORDER BY id DESC LIMIT 1
    `;

    db.query(buscarAsistencia, [id_empleado, fecha], (err2, registros) => {
      if (err2) return res.status(500).json({ error: err2 });

      const registro = registros[0];

      if (!registro || registro.hora_salida) {
        const insertar = `
          INSERT INTO asistencias (id_empleado, fecha, hora_entrada) 
          VALUES (?, ?, ?)
        `;
        db.query(insertar, [id_empleado, fecha, horaActual], (err3) => {
          if (err3) return res.status(500).json({ error: err3 });
          return res.json({ tipo: 'entrada', nombre_empleado });
        });

      } else {
        const actualizar = `
          UPDATE asistencias SET hora_salida = ? WHERE id = ?
        `;
        db.query(actualizar, [horaActual, registro.id], (err4) => {
          if (err4) return res.status(500).json({ error: err4 });
          return res.json({ tipo: 'salida', nombre_empleado });
        });
      }
    });
  });
};




// ✅ Historial semanal de asistencias (por user_id del empleado)
const obtenerHistorialSemanal = (req, res) => {
  const { user_id } = req.params;

  const query = `
    SELECT a.fecha, a.hora_entrada, a.hora_salida,
      ROUND(TIMESTAMPDIFF(MINUTE, a.hora_entrada, a.hora_salida)/60, 2) AS horas,
      ROUND((TIMESTAMPDIFF(MINUTE, a.hora_entrada, a.hora_salida)/60) * e.pago_por_hora, 2) AS pago
    FROM asistencias a
    JOIN empleados e ON a.id_empleado = e.id_empleado
    JOIN usuarios u ON e.id_usuario = u.id
    WHERE u.user_id = ? 
      AND WEEK(a.fecha, 1) = WEEK(CURDATE(), 1)
      AND YEAR(a.fecha) = YEAR(CURDATE())
    ORDER BY a.fecha ASC
  `;

  db.query(query, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};


// ✅ Nuevo: historial completo por id_empleado (para panel del dueño)
const obtenerHistorialPorEmpleado = (req, res) => {
  const { id_empleado } = req.params;
  console.log('📥 id_empleado recibido:', id_empleado);

  const query = `
    SELECT 
      a.fecha,
      a.hora_entrada,
      a.hora_salida,
      ROUND(TIMESTAMPDIFF(MINUTE, a.hora_entrada, a.hora_salida)/60, 2) AS horas,
      ROUND((TIMESTAMPDIFF(MINUTE, a.hora_entrada, a.hora_salida)/60) * e.pago_por_hora, 2) AS pago
    FROM asistencias a
    JOIN empleados e ON a.id_empleado = e.id_empleado
    WHERE e.id_empleado = ?
    ORDER BY a.fecha ASC
  `;

  db.query(query, [id_empleado], (err, rows) => {
    if (err) {
      console.error('❌ Error al consultar historial por empleado:', err);
      return res.status(500).json({ error: err });
    }
    res.json(rows);
  });
};


// ✅ Filtrar historial por fechas (para dueño)
const obtenerHistorialPorRango = (req, res) => {
  const { id_empleado } = req.params;
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ error: 'Fechas desde y hasta son requeridas' });
  }

  const query = `
    SELECT 
      a.fecha,
      a.hora_entrada,
      a.hora_salida,
      ROUND(TIMESTAMPDIFF(MINUTE, a.hora_entrada, a.hora_salida)/60, 2) AS horas,
      ROUND((TIMESTAMPDIFF(MINUTE, a.hora_entrada, a.hora_salida)/60) * e.pago_por_hora, 2) AS pago
    FROM asistencias a
    JOIN empleados e ON a.id_empleado = e.id_empleado
    WHERE e.id_empleado = ?
      AND a.fecha BETWEEN ? AND ?
    ORDER BY a.fecha ASC
  `;

  db.query(query, [id_empleado, desde, hasta], (err, rows) => {
    if (err) {
      console.error('❌ Error al filtrar historial:', err);
      return res.status(500).json({ error: err });
    }
    res.json(rows);
  });
};


// ✅ Filtrar asistencias por fecha (para un empleado específico)
// ✅ Obtener asistencias por rango de fechas
const filtrarAsistenciasPorFechas = (req, res) => {
  const { id_empleado, desde, hasta } = req.query;

  if (!id_empleado || !desde || !hasta) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  const query = `
    SELECT 
      a.fecha,
      a.hora_entrada,
      a.hora_salida,
      ROUND(TIMESTAMPDIFF(MINUTE, a.hora_entrada, a.hora_salida)/60, 2) AS horas,
      ROUND((TIMESTAMPDIFF(MINUTE, a.hora_entrada, a.hora_salida)/60) * e.pago_por_hora, 2) AS pago
    FROM asistencias a
    JOIN empleados e ON a.id_empleado = e.id_empleado
    WHERE a.id_empleado = ? AND a.fecha BETWEEN ? AND ?
    ORDER BY a.fecha ASC
  `;

  db.query(query, [id_empleado, desde, hasta], (err, rows) => {
    if (err) {
      console.error('❌ Error al filtrar asistencias:', err);
      return res.status(500).json({ error: err });
    }
    res.json(rows);
  });
};

module.exports = {
  // ...otros exportados
  filtrarAsistenciasPorFechas,
};




module.exports = {
  registrarAsistencia,
  obtenerHistorialSemanal,
  obtenerHistorialPorEmpleado,
  obtenerHistorialPorRango,
   filtrarAsistenciasPorFechas
};
