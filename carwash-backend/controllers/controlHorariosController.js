const db = require('../db/connection');

// ➡️ Crear entrada
const marcarEntrada = (req, res) => {
  const { id_empleado, id_sucursal } = req.body;

  const query = `
    INSERT INTO control_horarios (id_empleado, id_sucursal, fecha, hora_entrada)
    VALUES (?, ?, CURDATE(), CURTIME())
  `;

  db.query(query, [id_empleado, id_sucursal], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Entrada registrada correctamente' });
  });
};

// ➡️ Registrar inicio de lunch
const marcarInicioLunch = (req, res) => {
  const { id_control } = req.body;

  const query = `
    UPDATE control_horarios
    SET hora_inicio_lunch = CURTIME()
    WHERE id_control = ?
  `;

  db.query(query, [id_control], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Inicio de lunch registrado' });
  });
};

// ➡️ Registrar regreso de lunch
const marcarRegresoLunch = (req, res) => {
  const { id_control } = req.body;

  const query = `
    UPDATE control_horarios
    SET hora_regreso_lunch = CURTIME()
    WHERE id_control = ?
  `;

  db.query(query, [id_control], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Regreso de lunch registrado' });
  });
};

// ➡️ Registrar salida y calcular horas trabajadas
const marcarSalida = (req, res) => {
  const { id_control } = req.body;

  const query = `
    UPDATE control_horarios
    SET 
      hora_salida = CURTIME(),
      horas_trabajadas = TIMESTAMPDIFF(MINUTE, hora_entrada, CURTIME())/60 -
                         IFNULL(TIMESTAMPDIFF(MINUTE, hora_inicio_lunch, hora_regreso_lunch)/60, 0)
    WHERE id_control = ?
  `;

  db.query(query, [id_control], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Salida registrada y horas trabajadas calculadas' });
  });
};

// ➡️ Obtener control horario de un empleado hoy
const obtenerControlHoy = (req, res) => {
  const { id_empleado } = req.params;

  const query = `
    SELECT * FROM control_horarios
    WHERE id_empleado = ?
      AND fecha = CURDATE()
  `;

  db.query(query, [id_empleado], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.json(null);
    res.json(results[0]);
  });
};

module.exports = {
  marcarEntrada,
  marcarInicioLunch,
  marcarRegresoLunch,
  marcarSalida,
  obtenerControlHoy
};
