// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path')
const verifyToken = require('./verifyToken');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(verifyToken);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    password: String, 
  });
  
  const User = mongoose.model('User', userSchema);

// Models
const Idea = require('./models/idea');
const Material = require('./models/material');

// Routes

app.get('/', async (req, res) => {
    try {

      const isAuthenticated = req.user !== null;
      const materials = await Material.find();
      const ideas = await Idea.find().populate('materials');

      const dashboardData = {
        labels: materials.map(material => material.name),
        datasets: [{
            label: 'Nombre d\'idées par matériau',
            data: materials.map(material => ideas.filter(idea => idea.materials.includes(material._id)).length),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
      };

      res.render('home', { title: 'Accueil', ideas, materials, dashboardData, isAuthenticated });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});


app.get('/api/ideas', async (req, res) => {
    try {
        const ideas = await Idea.find().populate('materials');
        res.render('index', { title: 'Toutes les Idées', ideas });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/ideas/new', async (req, res) => {
  try {
    const materials = await Material.find();
    res.render('new-idea', { title: 'Créer une Idée', materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/ideas/new', async (req, res) => {
  try {
      const { name, category, materials, keywords } = req.body;

      if (!Array.isArray(materials)) {

          const singleMaterial = materials;
          const existingMaterial = await Material.findById(singleMaterial);

          if (!existingMaterial) {
              return res.status(400).json({ message: 'Le matériau sélectionné n\'existe pas.' });
          }
      } else {
          const existingMaterials = await Material.find({ _id: { $in: materials } });

          if (existingMaterials.length !== materials.length) {
              return res.status(400).json({ message: 'Certains matériaux n\'existent pas.' });
          }
      }

      const newIdea = new Idea({
          name,
          category,
          materials,
          keywords,
      });

      const savedIdea = await newIdea.save();
      res.redirect('/');
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});



app.get('/api/materials', async (req, res) => {
    try {
        const materials = await Material.find();
        res.render('materials', { title: 'Tous les Matériaux', materials }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.get('/materials/:id', async (req, res) => {
  try {
      const material = await Material.findById(req.params.id);
      res.render('material-details', { title: 'Détails du Matériau', material });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    }
    
    const token = jwt.sign({ username }, 'votreCleSecrete');
    
    res.json({ token, redirect: '/' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  
// Inscription
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const existingUser = await User.findOne({ username });
        
        if (existingUser) {
            return res.status(400).json({ message: 'Nom d\'utilisateur déjà pris.' });
        }
  
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const newUser = new User({
            username,
        password: hashedPassword,
    });
    
    const savedUser = await newUser.save();
    
    // Créez un token JWT
    const token = jwt.sign({ username }, 'votreCleSecrete');
    
    // Renvoyez le token
    res.status(201).json({ token });
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Inscription' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Connexion' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

// démarrage du serveur
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});