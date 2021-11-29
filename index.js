let express = require('express');
const bycrpt = require('bcrypt');
const saltRounds = 10;
const path = require('path');


const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const FeedBack = require('./FeedBack');
const ML_probality = require('./MlProbability');
let alert = require('alert');

let feedBack = FeedBack();


// import sqlite modules
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
let app = express();

app.use(express.static('public'));

var hbs = exphbs.create({
  helpers: {
    getStringifiedJson: function (value) {
      return JSON.stringify(value);
    }
  },
  defaultLayout: 'main',
  partialsDir: ['views/partials/']
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// app.engine('handlebars', exphbs({
//   defaultLayout: false,
//   partialsDir: __dirname + '/views/partials'
// }));
// app.set('view engine', 'handlebars');


// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))
// parse application/json
app.use(express.json())


// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'secret string',
  resave: false,
  saveUninitialized: false
  // store: store, /* store session data in mongodb */ 
  // cookie: { /* can add cookie related info here */ }
}));


open({
  filename: './login.db',
  driver: sqlite3.Database
}).then(async function (db) {

  // run migrations

  await db.migrate();
  const ml_probality = ML_probality(db);

  //only setup the routes once the database connection has been established
  // app.get('/', function(req, res){
  //   db
  //   .all('select * from login')
  //   .then (function(login){
  //     console.log(login);

  //     res.render('login', {
  //       login
  //     });
  //   })
  // }); 

  app.get('/', function (req, res) {
    res.render('login')
  });
  app.get('/login', async function (req, res) {
    const get = await db.all("select * from login");
    res.render('login')
  });

  app.get('/home', async function (req, res) {
    res.render('home')
  });



  app.post('/signin/user', async function (req, res) {
    const { username, password } = req.body;
    const getUserData = await db.all("select * from login where user_name = ?", username);
    req.session.isDone = false;
    if (getUserData.length !== 0) {
      req.session.username = username;
      res.redirect('/home');
    } else {
      res.redirect('/login');
      console.log("tell the user the account does not exist");
    }
  });


  app.get('/profile', async function (req, res) {
    res.render('profile');
  });

  app.post('/profile/user', async function (req, res) {
    console.log(req.body);
    const { full_name, age, location, land_size, soil_type, crop_type } = req.body;
    const checkIfProfileExists = await db.all("select * from user_profile where full_name = ?", full_name);
    if (checkIfProfileExists.length === 0) {
      req.session.isDone = true;
      await db
        .run("insert into user_profile (full_name, age, location, landsize, soiltype, croptype) values (?, ?, ?, ?, ?, ?)",
          full_name, age, location, land_size, soil_type, crop_type);

      console.log(req.session.username);
      req.session.isDone = true;
      if (req.session.isDone) {
        let getUserProfile = await db.all("select * from user_profile where full_name = ?", req.session.username);
        console.log(getUserProfile);
        let userFeedBack = {
          username: getUserProfile[0].full_name,
          location: getUserProfile[0].location,
          soiltype: getUserProfile[0].soiltype,
          landsize: getUserProfile[0].landsize
        };
        feedBack.check(userFeedBack);
        res.json({
          status: true,
          feedBack: feedBack.getFeedBack()
        });
      } else {

        console.log("the profile already exist");
        res.json({
          status: false
        });
      }
    }

  });


  app.post('/signup/user', async function (req, res) {
    const { username, email, password } = req.body;
    const checkIfUserExists = await db.all('select * from login where user_name = ?', username);
    if (checkIfUserExists.length === 0) {
      bycrpt.hash(password, saltRounds, async (err, hashedPassword) => {
        if (err) console.error(err);
        req.session.isDone = false;
        req.session.username = username;
        await db.run('insert into login (user_name, email, password) values (?, ?, ?)', username, email, password);
      });
      res.redirect('/home');
    } else {
      console.log("tell the user that they already have an account");
      res.redirect('/login');
    }
    let getAddedUser = await db.all('select * from login');
    console.log(getAddedUser);
  });

  app.post('/contact/user', async function (req, res) {
    // const { username, email, password } = req.body;
    // const checkIfUserExists = await db.all('select * from login where user_name = ?', username);
    // if (checkIfUserExists.length === 0) {
    //   bycrpt.hash(password, saltRounds, async (err, hashedPassword) => {
    //     if (err) console.error(err);
    //     req.session.isDone = false;
    //     req.session.username = username;
    //     await db.run('insert into login (user_name, email, password) values (?, ?, ?)', username, email, password);
    //   });
    //   res.redirect('/home');
    // } else {
    //   console.log("tell the user that they already have an account");
    //   res.redirect('/login');
    // }
    // let getAddedUser = await db.all('select * from login');
    // console.log(getAddedUser);
    res.redirect('/home');

    alert("We will Contact You")
  });

  app.get('/weather', async function (req, res) {
    res.render("weather");
  });

  app.get('/about', async function (req, res) {
    res.render("about");
  });

  app.get('/inquiries', async function (req, res) {
    await db.run('delete from ml');
    res.render("inquiries");
  });

  app.get('/cropandfunding', async function (req, res) {
    res.render("Crop&Funding");
  });

  app.post('/ml/prediction', async function (req, res) {
    const { cropProbality, cropClassName } = req.body;
    let data = {
      cropProbality,
      cropClassName,
      userName: "Victoria Vicks",
      cropType: "",
    };
    const mlFeedback = ml_probality.checkIfExist(data);
    if ((await mlFeedback).isExists) {
      res.json({
        status: true,
        "message": 'Crop has been saved',
        feedback: (await mlFeedback).mlFeedback
      });
    } else if (!(await mlFeedback).isExists) {
      res.json({
        status: false,
        "message": 'Crop already saved'
      });
    }

  });


  let PORT = process.env.PORT || 3007;

  app.listen(PORT, function () {
    console.log('App starting on port', PORT);
  });
})









