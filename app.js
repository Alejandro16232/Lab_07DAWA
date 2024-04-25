const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();

mongoose.connect('mongodb://localhost:27017/Games', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error(error);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const videojuegoSchema = new mongoose.Schema({
  titulo: String,
  plataforma: String,
  genero: String,
  precio: Number,
  imagen: String 
});

const Videojuego = mongoose.model('Videojuego', videojuegoSchema);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/videojuegos', async (req, res) => {
  try {
    const videojuegos = await Videojuego.find();
    res.render('listajuegos.ejs', { videojuegos });
  } catch (error) {
    console.error('Error al recuperar los videojuegos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/agregar', (req, res) => {
  res.render('agregarJuego.ejs');
});

app.post('/agregar', upload.single('imagen'), async (req, res) => {
  const { titulo, plataforma, genero, precio } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

  const nuevoVideojuego = new Videojuego({
    titulo,
    plataforma,
    genero,
    precio,
    imagen: imagePath 
  });

  try {
    await nuevoVideojuego.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error al agregar el videojuego:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
