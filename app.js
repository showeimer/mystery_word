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
let lettersGuessed = [];

// webroot
app.get('/', (req, res) => {

  // Send word to session
  if (req.session.word.length === 0) {
    word = words[Math.round(Math.random() * words.length)].toUpperCase();
    req.session.word.push(word);
    console.log(req.session);
  }

  // Generating blank spaces
  if (blank.length === 0) {
    for (let i = 0; i < word.length; i++) {
      blank += "_"
    }
  }

  res.render('home', {blank:blank, guesses:guesses, lettersGuessed:lettersGuessed});
});


// User enters a letter
app.post('/guess', (req,res) => {
  let letter = req.body.userGuess.toUpperCase();
  console.log(letter);

  req.checkBody('userGuess', 'Must be a letter in the Alphabet').isAlpha();
  req.checkBody('userGuess', 'Must enter one letter').len(1,1);

  req.getValidationResult().then((result) => {

    // If there is a result, throw an error.  If letter was already guessed, throw an error
    if (!result.isEmpty()) {
      throw new Error(result.array().map((item) => item.msg).join(' | '));
    } else if (lettersGuessed.includes(letter)) {
      throw new Error('Letter has already been guessed');
    } else {
    console.log('No errors')
    }
  })

  .then(() => {

    // Stack overflow function steal
    String.prototype.replaceAt = function(index, c) {
      return this.substr(0, index) + c + this.substr(index + (c.length == 0 ? 1 : c.length));
    }

    // If the guessed letter is in the word, run this code
    if(req.session.word[0].includes(letter) && letter !== "") {
      console.log('Correct');
      lettersGuessed.push(letter);

      // Replace all blanks with the correct letter
      for(let i = 0; i < req.session.word[0].length; i++) {
        if(req.session.word[0][i] === letter) {
          blank = blank.replaceAt(i,letter);
          // console.log(i);
          console.log(blank);
        }
      }

      // if the word is guessed, then render the winning page
      if(word === blank) {
        (console.log('You win!'));
        res.render('end', {gameWin: 'You Win!', word:word});
      } else {
      res.redirect('/check');
      }

    // Wrong guess, and lose game
    } else {
      guesses--;
      lettersGuessed.push(letter);
      console.log('Wrong');
      if (guesses === 0) {
        console.log('Game Over');
        res.render('end', {gameOver: 'Game Over', word: word});
      } else {
      res.redirect('/check');
      }
    }

  }) //end of then

  .catch((error) => {
    console.log(error);
    res.render('home', {error:error, blank:blank, guesses: guesses, lettersGuessed: lettersGuessed})});

}); //end of /guess post


// Force refresh page
app.get('/check', (req,res) => {
  res.redirect('/');
});


// Restart game
app.post('/playAgain', (req,res) => {
  console.log(req.session.word);
  req.session.word = [];
  guesses = 8;
  word = "";
  blank = "";
  lettersGuessed = [];
  res.redirect('/');
});


app.listen(3000, () => {
  console.log('App successfully loaded');
})
