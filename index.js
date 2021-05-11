const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
let bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'college-management-system'
})

db.connect((err) => {
    if (err) throw err
    else console.log('connected');
})

app.get('/', (req, res) => {

    res.render('preLogger.ejs');

})


app.get('/addStudent', (req, res) => {


})


app.listen('3000', () => {

    console.log('started..');

});