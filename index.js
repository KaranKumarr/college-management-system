//IMPORTING express framework
const express = require('express');
//MYSQL connector for NodeJS
const mysql = require('mysql');
//Importing bodyParser which is used to get HTML values(like input field result) to NodeJS
const bodyParser = require('body-parser');
//Creating Object of Express 
const app = express();
//Importing Student Routes
const studentRoutes = require('./routes/Student');
//Importing Instructor/Faculty Routes
const facultyRoute = require('./routes/Instructor');
//Telling NodeJS that we will be using EJS Template Engine
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'));
//Enabling bodyParser functionalities
app.use(bodyParser.urlencoded({ extended: true }));

//Enabling static functionalities
// app.use(express.static(__dirname + 'public'));
//Creating Connection to mysql
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'college-management-system'
})
//Connecting to Mysql
db.connect((err) => {
    if (err) throw err
})

//Rendering preLogger Page
app.get('/', (req, res) => {

    res.render('preLogger.ejs');

})
//Student FILE accessing from here
app.use(studentRoutes);


//Instructor FILE accessing from here
app.use(facultyRoute);


//Assigning the port where we will be listening
app.listen('3000', () => {

    console.log('server is listening..');

});
