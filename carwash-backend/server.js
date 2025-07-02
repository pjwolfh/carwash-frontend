// 🧠 Importaciones necesarias
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 📦 Importar rutas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const clientesRoutes = require('./routes/clientes');
const controlHorariosRoutes = require('./routes/control_horarios');
const sucursalesRoutes = require('./routes/sucursales');
const empleadosRoutes = require('./routes/empleados');
const asistenciaRoutes = require('./routes/asistencia');
const serviciosRoutes = require('./routes/servicios');
const regalosRoutes = require('./routes/regalos');
const canjesRoutes = require('./routes/canjes');
const ventasRoutes = require('./routes/ventas');
const dellersRoutes = require('./routes/dellers');

// 🔌 Conexión a la base de datos
require('./db/connection');

// 🌍 Configurar variables de entorno
dotenv.config();

// 🚀 Crear instancia de la app
const app = express();
const PORT = process.env.PORT || 3000;

// 🌐 Configurar CORS
const corsOptions = {
  origin: [
    'https://carwash-app-three.vercel.app',
    'https://carwash-app-git-main-pjs-projects-5248e35c.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// ✅ Usar CORS con opciones
app.use(cors(corsOptions));

// ✅ Middleware para preflight (opciones CORS)
app.options('*', cors(corsOptions));

// 🧩 Middlewares para parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ✅ Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 📦 Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/control-horarios', controlHorariosRoutes);
app.use('/api/sucursales', sucursalesRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/regalos', regalosRoutes);
app.use('/api/canjes', canjesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/dellers', dellersRoutes);

// ✅ Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ API CarWash funcionando correctamente');
});

// 🟢 Levantar el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
