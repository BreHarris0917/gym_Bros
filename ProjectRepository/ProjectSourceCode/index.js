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

const user = {
  username:undefined,
  password: undefined,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  height_feet:undefined,
  height_inch: undefined,
  weight: undefined,
  age: undefined
};

app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  if(!req.session.user){
    return res.redirect('/login');
  }

  res.render('pages/home',  {
    username: req.session.user.username,
    password: req.session.user.password,
    firstName: req.session.user.firstName,
    lastName: req.session.user.lastName,
    email: req.session.user.email,
    height_feet: req.session.user.height_feet,
    height_inch: req.session.user.height_inch,
    weight: req.session.user.weight,
    age: req.session.user.age
  });
});


app.get('/login', (req, res) => {
  res.render('pages/login')
});

app.get('/register', (req, res) => {
  res.render('pages/register')
});

app.get('/fitness', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('pages/fitness', {
    firstName: req.session.user.firstName 
  });
});

app.get('/shop', (req, res) => {
  res.render('pages/shop')
});

app.get('/cart', (req, res) => {
  res.render('pages/cart')
});

app.get('/checkout', (req, res) => {
  res.render('pages/checkout')
});

app.get('/aboutus', (req, res) => {
  res.render('pages/aboutus')
});

app.post('/register', async (req, res) => {
  const {
    username,
    password,
    firstName,
    lastName,
    email,
    age,
    weight,
    height_feet,
    height_inch,
  } = req.body;

  const query = 'INSERT INTO users (username, password, firstName, lastName, email, age, weight, height_feet, height_inch ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);';
  
  try{
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(query, [
      username,
      hashedPassword,
      firstName,
      lastName,
      email,
      age,
      weight,
      height_feet,
      height_inch,
    ]);

    req.session.user = {
      username,
      firstName,
      lastName,
      email,
      height_feet,
      height_inch,
      weight,
      age,
    };


    req.session.save(() => {
      res.redirect('/home');
    });

  }catch(error) {
    console.error(error);
    res.render('pages/register', { message: 'Registration failed.' });
  }
});

app.post('/login', async (req, res) => {

  const { username, password } = req.body;

  try {
    const user = await db.oneOrNone('SELECT username, password, firstname, lastname, email, weight, height_feet, height_inch, age FROM users WHERE username = $1', [username]);
    if (!user) {
      return res.render('pages/login', {message: 'User not found, please register.'});
    }

    console.log('Database user object:', user);

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('pages/login', { message: 'Incorrect username or password.' });
    }

    req.session.user = {
      username: user.username,
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      weight: Number(user.weight),
      height_feet: Number(user.height_feet),
      height_inch: Number(user.height_inch),
      age: Number(user.age)
    };

     req.session.save(() => {
        res.redirect('/home');
      });


  } catch (error) {
    console.error(error);
    res.render('pages/login', { message: 'An error occurred during login.' });
  }
});
   

const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next();
};

app.use(auth);

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
