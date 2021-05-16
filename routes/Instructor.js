const express = require('express');
const router = express.Router();
//For connecting to Database
const mysql = require('mysql');
//To get values from HTML/EJS files
const bodyParser = require('body-parser');
//enabling body parser
router.use(bodyParser.urlencoded({ extended: true }))
router.use(express.static('public'));
//To Store Cache
const NodeCache = require("node-cache");
const FacultyCache = new NodeCache();
//For Encripting and Decripting Password
let bcrypt = require('bcrypt');
//Getting Instructor Information
let { getInstructorInfo, getAttendance } = require('./data/instructorInfo');
let { getCoursesOFInstructor } = require('./data/coursesInfo');

//get Student Name For Attendance Sheet
let { getStudentName } = require('./data/studentInfo');

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
router.get('/Instructor', (req, res) => {

    if (!isLogged) {
        res.render('InstructorLogin.ejs', { status: status });

    } else {
        res.render('InstructorHome.ejs');
    }

})

router.post('/InstructorHome', (req, res) => {

    let ID = req.body.InstructorID;

    let sqlQuery = 'SELECT Instructor_ID as InstructorID,Instructor_Name as InstructorName,Password as Password,Year_Joined as YearJoined, Instructor_NIC as InstructorNIC,Instructor_Email as InstructorEmail FROM Instructors WHERE Instructor_ID = ' + ID;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;

        let json = JSON.stringify(result);
        let temp = JSON.parse(json);

        let Instructor = temp[0];

        isLogged = bcrypt.compareSync(req.body.InstructorPassword, Instructor.Password);

        if (isLogged) {
            const successCache = FacultyCache.set("Instructor", Instructor, 3000);
            if (!successCache) {
                console.log('ERROR! Cache Failed');
            }

            getInstructorInfo(Instructor.InstructorNIC).then((InstructorInfo) => {

                let tempInstructorHolder = FacultyCache.get("Instructor");
                FacultyCache.set("InstructorInfo", InstructorInfo[0], 3000)
                // console.log(tempStudentHolder)
                res.render('InstructorHome.ejs', { Instructor: tempInstructorHolder, InstructorInfo: InstructorInfo[0] })

            })

        }
    })

})

//Get Route For Instructor Home
router.get('/InstructorHome', (req, res) => {
    res.render("InstructorHome.ejs", { Instructor: FacultyCache.get("Instructor"), InstructorInfo: FacultyCache.get("InstructorInfo") })
})

//Instructor Courses
router.get('/InstructorCourses', (req, res) => {
    getCoursesOFInstructor(FacultyCache.get("Instructor").InstructorID).then((courses) => {
        FacultyCache.set("InstructorCourses", courses, 3000)
        res.render("InstructorCourses.ejs", { Courses: courses })
    })
})

//Instructor Classes
router.get('/InstructorClasses/:courseID', (req, res) => {

    let courseID = req.params.courseID;

    getAttendance(courseID).then((Attendance) => {

        FacultyCache.set("Attendance", Attendance, 3000)

        const dates = new Array();

        for (let i = 0; i < Attendance.length; i++) {

            if (dates.includes(Attendance[i].classDate)) {

            } else {
                dates.push(Attendance[i].classDate)
            }

        }
        FacultyCache.set("dates", dates, 3000)
        // console.log(FacultyCache.get("InstructorCourses"));
        let CourseName = FacultyCache.get("InstructorCourses").filter((course) => {
            if (course.courseID == courseID) {
                return true;
            }
        })
        // console.log(CourseName);
        res.render("InstructorClasses", { dates: dates, CourseName: CourseName[0].CourseName })

    })

})

//Instructor Attendance
router.get("/InstructorClasses/:courseID/:index", (req, res) => {

    let index = req.params.index;

    const oldAttendance = FacultyCache.get("Attendance");
    const dates = FacultyCache.get("dates");
    let filteredAttendance = oldAttendance.filter((attendance) => {

        if (attendance.classDate == dates[index]) {
            return true;
        }

    })

    res.render("InstructorAttendance.ejs", { Attendance: filteredAttendance, date: dates[index] })


})

//Wrong URL ERROR Handling
router.get('/Faculty', (req, res) => {
    res.redirect('/Instructor');
})

//LogOut
router.get('/Signout', (req, res) => {

    isLogged = false;

    res.redirect('Instructor');

})

module.exports = router;