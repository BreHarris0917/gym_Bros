// ----------------------------------   DEPENDENCIES  ----------------------------------------------

const express = require('express'); //To build an application server or API
const app = express(); //instance of Express
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars'); //core handlebars library
const path = require('path'); //importing path (for file path manipulation)
const pgp = require('pg-promise')(); //to connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); //to set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //to hash passwords
const axios = require('axios'); //to make HTTP requests from our server. 

// App Settings
// ------------------------------
//create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs', //.hbs becomes default file extention for /views
  layoutsDir: path.join(__dirname, 'views/layouts'), //layout files directory
  partialsDir: path.join(__dirname, 'views/partials'), //partial view files directory
});

//register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs'); //make handlebars the view engine
app.set('views', path.join(__dirname, 'views')); //path to views
app.use(bodyParser.json()); //specify the usage of JSON for parsing request body.

app.use(bodyParser.urlencoded({ extended: true })); //parse URL-encoded data

//initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false, //don't save empty sessions
    resave: false, //no resaving session if not modified
  })
);

// -------------------------------------  DB CONFIG AND CONNECT   ---------------------------------------
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);

// db test
db.connect()
  .then((obj) => {
    console.log('Database connection successful');
    obj.done(); // success, release the connection
  })
  .catch((error) => {
    console.log('ERROR:', error.message || error);
  });

// -------------------------------------  ROUTES   ----------------------------------------------
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('pages/login')
});

app.get('/register', (req, res) => {
  res.render('pages/register')
});

app.get('/fitness', (req, res) => {
  res.render('pages/fitness')
});

app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const age = req.body.age;
  const weight = req.body.weight;
  const height = req.body.height;
  const query = 'INSERT INTO users (username, password, email, age, weight, height) VALUES ($1, $2, $3, $4, $5, $6);';
  
  bcrypt.hash(password, 10)
  .then(hash => {
    return db.query(query, [username, hash, email, age, weight, height]);
  })
  .then(() => {
    res.redirect('/login');
  })
  .catch(error => {
    console.error(error);
    res.render('pages/register', { message: 'Registration failed.' });
  });
});

app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
    if (!user) {
      return res.redirect('/register');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('pages/login', { message: 'Incorrect username or password.' });
    }

    req.session.user = user;
    req.session.save(() => {
      res.redirect('/home');
    });
  } catch (error) {
    console.error(error);
    res.render('pages/login', { message: 'An error occurred during login.' });
  }
});

app.get('/home', (req, res) => {
  res.render('pages/home');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
