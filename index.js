let express = require('express');
const bycrpt = require('bcrypt');
const saltRounds = 10;


const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');


// import sqlite modules
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
let app = express();


app.engine('handlebars', exphbs({defaultLayout: false}));
app.set('view engine', 'handlebars');





// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))
// parse application/json
app.use(express.json())
app.use(express.static('public'));


open({
	filename: './login.db',
	driver: sqlite3.Database
}).then(async function (db) {

	// run migrations

	await db.migrate();

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
  
  app.get('/login', function (req, res) {
    res.render('login') 
  });
  
  app.get('/home', function (req, res) {
    res.render('home') 
  });


   
  app.post('/signin/user', async function (req, res) {
    const {username, password} = req.body;
    const getUserData = await db.all("select * from login where user_name = ?", username);
    if (getUserData.length !== 0){
      res.redirect('/home');
    }else { 
      res.redirect('/login');
      console.log("tell the user the account does not exist");
    }
    
    console.log(getUserData);
  });

  
  app.get('/profile', async function (req, res) {
   res.render('profile');
  });
   
  app.post('/profile/user', async function (req, res) {


    // const {username, password} = req.body;
    // const getUserData = await db.all("select * from login where user_name = ?", username);
    // if (getUserData.length !== 0){
    //   res.redirect('/home');
    // }else { 
    //   res.redirect('/login');
    //   console.log("tell the user the account does not exist");
    // }
    
    // console.log(getUserData);
  });


  app.post('/signup/user', async function (req, res) {
    const {username, email, password} = req.body;
    const checkIfUserExists = await db.all('select * from login where user_name = ?',username);
    if(checkIfUserExists.length !== 0){ 
    bycrpt.hash(password, saltRounds, async (err,hashedPassword)=>{ 
      if (err) console.error(err);
      await db.run('insert into login (user_name, email, password) values (?, ?, ?)', username, email, hashedPassword);
    });
      res.redirect('/home');
    }else{ 
      console.log("tell the user that they already have an account");
    res.redirect('/login');
    }
    let getAddedUser = await db.all('select * from login');
    console.log(getAddedUser);
    
  });
  
  
  let PORT = process.env.PORT || 3007;
  
  app.listen(PORT, function(){
    console.log('App starting on port', PORT);
  });
})









