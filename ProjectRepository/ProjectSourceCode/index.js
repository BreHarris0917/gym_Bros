
// ----------------------------------   DEPENDENCIES  ----------------------------------------------

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. 

// App Settings
// ------------------------------

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// -------------------------------------  DB CONFIG AND CONNECT   ---------------------------------------
// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

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
  .then(obj => {
    // Can check the server version here (pg-promise v10.1.0+):
    console.log('Database connection successful');
    obj.done(); // success, release the connection;
    })
  .catch(error => {
    console.log('ERROR', error.message || error);
  });

// -------------------------------------  ROUTES   ----------------------------------------------
app.get('/', (req, res) => {
    res.redirect('/login'); 
});
app.get('/register', (req, res) => {
    res.render('pages/register');
});
app.post('/login', async (req, res) => {
    // hash the password using bcrypt library
    const username = req.body.username;
    const password = req.body.password;
    db.oneOrNone('SELECT * FROM users WHERE username = $1', [username])
    .then(user => {
      if (!user) {
        return res.redirect('/register');
      }
  
      bcrypt.compare(password, users.password)
      .then(match => {
        if (!match) {
          return res.render('pages/login', { message: 'Incorrect username or password.' });
        }
  
        req.session.user = user;
        req.session.save();
        return res.redirect('/home');
      });
    })
    .catch(error => {
      console.error(error);
      return res.render('pages/login', { message: 'An error occurred.' });
    });
});

// Starting the server
// Keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');

