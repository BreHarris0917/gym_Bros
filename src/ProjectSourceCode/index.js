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
const { error } = require('console');

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

// Register a Handlebars helper to add 1 to the index
hbs.handlebars.registerHelper('add', function(a, b) {
  return a + b;
});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case '===':
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case '<':
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case '>':
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case '<=':
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case '>=':
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

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
  age: undefined,
  fitness_points: undefined
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/home', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const user = await db.oneOrNone('SELECT fitness_points FROM users WHERE username = $1', [req.session.user.username]);
    
    if (!user) {
      return res.redirect('/login');
    }

    res.render('pages/home', {
      username: req.session.user.username,
      password: req.session.user.password,
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      email: req.session.user.email,
      height_feet: req.session.user.height_feet,
      height_inch: req.session.user.height_inch,
      weight: req.session.user.weight,
      age: req.session.user.age,
      fitness_points: user.fitness_points, // Fetched from the database
      showCheckInPopup: req.session.showCheckInPopup
    });
  } catch (error) {
    console.error('Error fetching fitness points:', error);
    res.redirect('/login');
  }
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

app.get('/workout', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('pages/workout')
});

app.get('/shop', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

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

app.get('/leaderboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const leaderboard = await db.any('SELECT username, fitness_points FROM users ORDER BY fitness_points DESC LIMIT 10');

    res.render('pages/leaderboard', { leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.render('pages/leaderboard', { message: 'An error occurred while fetching the leaderboard.', error:true });
  }
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
      height_inch
    ]);

    req.session.user = {
      username,
      firstName,
      lastName,
      email,
      height_feet,
      height_inch,
      weight,
      age
    };


    req.session.save(() => {
      res.redirect('/home');
    });

  }catch(error) {
    console.error(error);
    res.render('pages/register', { message: 'Registration failed.' , error:true});
  }
});

app.post('/login', async (req, res) => {

  const { username, password } = req.body;

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
    if (!user) {
      return res.render('pages/login', {message: 'User not found, please register.', error:true});
    }

    console.log('Database user object:', user);

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('pages/login', { message: 'Incorrect username or password.', error:true});
    }

    req.session.user = {
      username: user.username,
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      weight: Number(user.weight),
      height_feet: Number(user.height_feet),
      height_inch: Number(user.height_inch),
      age: Number(user.age),
      fitness_points: Number(user.fitness_points)
    };

    // Check if the user has checked in today
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    if (user.last_checkin !== currentDate) {
      // User has not checked in today, show the popup and update fitness points
      req.session.showCheckInPopup = true;
      
      // Update fitness points and last check-in date
      await db.none(
        'UPDATE users SET fitness_points = fitness_points + 1, last_checkin = $1 WHERE username = $2',
        [currentDate, user.username]
      );
    } 
    else {
      // User has already checked in today, don't show the popup
      req.session.showCheckInPopup = false;
    }

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('pages/login', { message: 'An error occurred during login.', error:true});
      }
      res.redirect('/home');
    });
  } catch (error) {
    console.error(error);
    res.render('pages/login', { message: 'An error occurred during login.', error:true});
  }
});

const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next();
};


app.post('/home', async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  
  if (newPassword !== confirmPassword) {
    return res.render('pages/home',  {
      username: req.session.user.username,
      password: req.session.user.password,
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      email: req.session.user.email,
      height_feet: req.session.user.height_feet,
      height_inch: req.session.user.height_inch,
      weight: req.session.user.weight,
      age: req.session.user.age,
      fitness_points: req.session.user.fitness_points,
      showCheckInPopup: req.session.showCheckInPopup,
      message: 'New passwords do not match!',
      error: true
    });
  }

  const username = req.session.user.username;

  try {
    const user = await db.oneOrNone('SELECT username, password FROM users WHERE username = $1', [username]);

    if (!user) {
      return res.status(404).send('User not found.');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return res.render('pages/home', {
        username: req.session.user.username,
        password: req.session.user.password,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        email: req.session.user.email,
        height_feet: req.session.user.height_feet,
        height_inch: req.session.user.height_inch,
        weight: req.session.user.weight,
        age: req.session.user.age,
        fitness_points: req.session.user.fitness_points,
        showCheckInPopup: req.session.showCheckInPopup,
        message: 'Incorrect old password.',
        error: true
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.none('UPDATE users SET password = $1 WHERE username = $2', [hashedNewPassword, username]);

    req.session.user.password = hashedNewPassword;

    res.render('pages/home', {
      username: req.session.user.username,
      password: req.session.user.password,
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      email: req.session.user.email,
      height_feet: req.session.user.height_feet,
      height_inch: req.session.user.height_inch,
      weight: req.session.user.weight,
      age: req.session.user.age,
      fitness_points: req.session.user.fitness_points,
      showCheckInPopup: req.session.showCheckInPopup,
      message: 'Password successfully changed!',
      error: false
    });
  } catch (error) {
    console.error(error);
    res.render('pages/home', {
      username: req.session.user.username,
      password: req.session.user.password,
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      email: req.session.user.email,
      height_feet: req.session.user.height_feet,
      height_inch: req.session.user.height_inch,
      weight: req.session.user.weight,
      age: req.session.user.age,
      fitness_points: req.session.user.fitness_points,
      showCheckInPopup: req.session.showCheckInPopup,
      message: 'An error occurred while changing the password.',
      error: true
    });
  }
});

app.post('/submit-points', async (req, res) => {
  const points = parseInt(req.body.points, 10); //parse points => integer
  const username = req.body.username || (req.session.user ? req.session.user.username : null);

  if (!points || isNaN(points)) {
      return res.status(400).send('Invalid points.');
  }

  try {
    //Fetch user from database
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

    if (!user) {
      return res.status(404).send('User not found.');
    }

    //Update user's points in the database
    await db.none('UPDATE users SET fitness_points = fitness_points + $1 WHERE username = $2', [points, username]);

    //Update session data if needed
    req.session.user.fitness_points += points;

    //Redirect the user to the fitness page
    res.redirect('/fitness');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the points.' });
  }
});

app.use(auth);

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});