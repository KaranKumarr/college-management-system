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
//Getting Student Information
let { getStudentInfo } = require('./studentInfo');

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


    if (!isLogged) {
        res.render('StudentLogin.ejs', { status: status });

    } else {
        res.render('StudentHome.ejs');
    }

})


//Verify ID and Password
router.post('/student-verify', (req, res) => {

    let ID = req.body.studentID;
    let pass = req.body.studentPassword;

    let mysql = 'SELECT Student_ID as StudentID,Student_Name as StudentName,Password as Password,Year_Joined as YearJoined, Student_NIC as StudentNIC,Department_Name as DepartmentName FROM student_academics WHERE Student_ID = ' + ID;

    db.query(mysql, (err, result) => {

        if (err) throw err;

        let json = JSON.stringify(result);
        let temp = JSON.parse(json);

        let Student = temp[0];


        isLogged = bcrypt.compareSync(req.body.StudentPassword, Student.Password);

        if (isLogged) {
            let i;
            getStudentInfo(Student.StudentNIC).then((StudentInfo) => {
                console.log(StudentInfo);
                res.render('StudentHome.ejs', { Student: Student, StudentInfo: StudentInfo[0] })
            })
        } else {
            status = 'Login Again'
            res.render('StudentLogin', { status: status })
        }
    })

    //LogOut
    router.get('/Logout', (req, res) => {

        isLogged = false;

        res.redirect('Student');

    })

})


module.exports = router;