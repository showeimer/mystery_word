// necessary modules/packages
const fs = require('fs');
const express = require('express');
const handlebars = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");


// creating my mysterd word app
const app = express();

// loading handlebars as my templating engine
app.engine('handlebars', handlebars());
app.set('views', './views');
app.set('view engine', 'handlebars');

// configuring static files
app.use(express.static('public'));

// Setting session middleware
app.use(session({
  secret: 'password', // this is a password. make it unique
  resave: false, // don't resave the session into memory if it hasn't changed
  saveUninitialized: true // always create a session, even if we're not storing anything in it.
}));

// Parse data for use
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Form validation middleware
app.use(expressValidator());

// Loading session
app.use((req, res, next) => {
  if(!req.session.word) {
    req.session.word = [];
  }
  next();
});

// Variables
let guesses = 8;
let word = "";
let blank = "";

// webroot
app.get('/', (req, res) => {
  // Pull random word from list
  let word = words[Math.round(Math.random() * words.length)].toUpperCase();

  // Send word to session
  req.session.word.push(word);
  console.log(req.session);

  // Generating blank spaces
  for (let i = 0; i < word.length; i++) {
    blank += "_"
  }

  res.render('home', {blank:blank, guesses:guesses});
});

// User enters a letter
app.post('/guess', (req,res) => {
  let letter = req.body.userGuess.toUpperCase();
  console.log(letter);

  req.checkBody('userGuess', 'Please enter a letter').notEmpty();
  // req.checkBody('userGuess', 'Only one letter per guess').len(1,1);

  req.getValidationResult().then((result) => {
    let errors = result.array();
    // console.log(errors);
    if (errors) {
      res.render('home', {errors:errors, blank:blank, guesses:guesses});
    }
  })

  .then(() => {
    if(req.session.word[0].includes(letter)) {
      console.log('the letter is in the word');
      
    } else {
      console.log('FAIL!');
    }
  })

});

app.listen(3000, () => {
  console.log('App successfully loaded');
})
