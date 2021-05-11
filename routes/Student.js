//Importin Express
const express = require('express');
//Routers to connect this file's routes with Index.js
const router = express.Router();
//For connecting to Database
const mysql = require('mysql');
//To get values from HTML/EJS files
const bodyParser = require('body-parser');
//For Encripting and Decripting Password
let bcrypt = require('bcrypt');

//enabling body parser
router.use(bodyParser.urlencoded({ extended: true }))
router.use(express.static('public'));

//building connection to database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'college-management-system'
})

//connecting to database
db.connect((err) => {

    if (err) throw err
    else console.log('connected');
})

let isLogged = false;

let status = '';
//Login page OR home page if logged in
router.get('/Student', (req, res) => {


    // if (!isLogged) {
    //     isLogged = true;
    res.render('StudentLogin.ejs', { status: status });

    // console.log(req.body);
    // } else {
    //     res.render('StudentHome.ejs');
    // }

})

//Verify
router.post('/student-verify', (req, res) => {

    let ID = req.body.studentID;
    let pass = req.body.studentPassword;

    let mysql = 'SELECT Student_ID as StudentID,Student_Name as StudentName,Password as Password,Year_Joined as YearJoined, Student_NIC as StudentNIC,Department_Name as DepartmentName FROM student_academics WHERE Student_ID = ' + ID;

    db.query(mysql, (err, result) => {

        if (err) throw err;

        console.log(result);

        let json = JSON.stringify(result);
        let temp = JSON.parse(json);

        let Student = temp[0];

        let isCorrect = false;

        isCorrect = bcrypt.compareSync(req.body.StudentPassword, Student.Password);

        console.log(Student);
        if (isCorrect) {
            res.render('StudentHome.ejs', { Student: Student })
        } else {
            status = 'Incorrect Password'
            res.render('StudentLogin', { status: status })
        }
    })

    // console.log(temp);

    // res.send(req.send.StudentID + 'hi')

})




module.exports = router;