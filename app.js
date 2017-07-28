// necessary modules/packages
const fs = require('fs');
const express = require('express');
const handlebars = require('handlebars');
const session = require('express-session');
const bodyParser = require('body-parsers');
const expressValidator = require('express-validator');

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
  if(!req.session.users) {
    req.sessions.users = [];
  }
  next();
});

app.listen(3000, () => {
  console.log('App successfully loaded');
})
