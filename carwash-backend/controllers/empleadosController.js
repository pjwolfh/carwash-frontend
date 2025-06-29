const db = require('../db/connection');
const bcrypt = require('bcryptjs'); // Asegúrate de tenerlo instalado

// Obtener empleados por sucursal
exports.obtenerEmpleadosPorSucursal = (req, res) => {
  const idSucursal = req.params.idSucursal;
  db.query('SELECT * FROM empleados WHERE id_sucursal = ?', [idSucursal], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Crear nuevo empleado y usuario
exports.crearEmpleado = (req, res) => {
  console.log("🚀 Iniciando creación de nuevo empleado...");
  const body = req.body;
  console.log("📦 Datos recibidos:", body);

  // Crear usuario vinculado (rol 4 = empleado)
  const nuevoUsuario = {
    telefono: body.telefono,
    email: body.correo,
    password: bcrypt.hashSync('123456', 10),
    rol_id: body.rol_id || 4,  // ✅ usa 4 por defecto si no se envía
    puntos: 0,
    servicios_acumulados: 0,
    user_id: generarCodigoUsuario(),
    nombre_contacto: body.nombre_empleado,
    nombre_empresa: null,
    fecha_registro: new Date()
  };


  db.query('INSERT INTO usuarios SET ?', nuevoUsuario, (err, resultUsuario) => {
    if (err) {
      console.error("❌ Error creando usuario:", err);
      return res.status(500).json({ error: 'Error creando usuario', detalles: err });
    }

    const idUsuario = resultUsuario.insertId;
    console.log("✅ Usuario creado con ID:", idUsuario);

    // Crear empleado vinculado
    const nuevoEmpleado = {
      id_sucursal: body.id_sucursal,
      nombre_empleado: body.nombre_empleado,
      telefono: body.telefono,
      correo: body.correo,
      pago_por_hora: body.pago_por_hora,
      dia_descanso: body.dia_descanso,
      fecha_ingreso: body.fecha_ingreso,
      hora_entrada: body.hora_entrada,
      hora_salida: body.hora_salida,
      estado: body.estado,
      puesto: body.puesto,
      id_usuario: idUsuario
    };

    db.query('INSERT INTO empleados SET ?', nuevoEmpleado, (err2, resultEmpleado) => {
      if (err2) {
        console.error("❌ Error creando empleado:", err2);
        return res.status(500).json({ error: 'Error creando empleado', detalles: err2 });
      }

      console.log("✅ Empleado creado con ID:", resultEmpleado.insertId);
      res.json({
        message: 'Empleado y usuario creados exitosamente',
        id_empleado: resultEmpleado.insertId,
        id_usuario: idUsuario
      });
    });
  });
};

// Obtener datos del empleado usando user_id (para el panel)
exports.obtenerEmpleadoPorUserId = (req, res) => {
  const { user_id } = req.params;

  const query = `
    SELECT u.nombre_contacto AS nombre_empleado, e.puesto, e.hora_entrada, e.hora_salida, e.dia_descanso
    FROM usuarios u
    JOIN empleados e ON u.id = e.id_usuario
    WHERE u.user_id = ?
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });

    res.json(results[0]);
  });
};

// Actualizar empleado
exports.actualizarEmpleado = (req, res) => {
  const id = req.params.idEmpleado;
  const datos = req.body;

  db.query('UPDATE empleados SET ? WHERE id_empleado = ?', [datos, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Empleado actualizado correctamente' });
  });
};

// Obtener empleado por ID
exports.obtenerEmpleadoPorId = (req, res) => {
  const id = req.params.idEmpleado;

  db.query('SELECT * FROM empleados WHERE id_empleado = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(results[0]);
  });
};

// Eliminar empleado
exports.eliminarEmpleado = (req, res) => {
  const id = req.params.idEmpleado;

  db.query('DELETE FROM empleados WHERE id_empleado = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Empleado eliminado correctamente' });
  });
};

// Generador de código único
function generarCodigoUsuario() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}
