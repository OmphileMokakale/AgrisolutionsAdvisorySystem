let express = require('express');


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
  app.get('/', function(req, res){
    db
    .all('select * from login')
    .then (function(login){
      console.log(login);

      res.render('login', {
        login
      });
    })
  }); 

  app.get('/', function (req, res) {
    res.render('login') 
  });
  
  app.get('/login', function (req, res) {
    res.render('login') 
  });
  
  app.get('/home', function (req, res) {
    res.render('home') 
  });
  
  
  let PORT = process.env.PORT || 3007;
  
  app.listen(PORT, function(){
    console.log('App starting on port', PORT);
  });
})









