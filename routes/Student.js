//Importing Express
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
let { getStudentInfo } = require('./data/studentInfo');
//Getting Student's Course Information 
let { getCurrentCourses, getAttendance, getInstructor, getSchedule, getExamsSchedule } = require('./data/coursesInfo');
//To get Library Details
const { getBooks, borrowBook, getBorrowedBooks, returnBook } = require('./data/Library');
//To Store Cache
const NodeCache = require("node-cache");
const myCache = new NodeCache();
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

//Login page OR home page if logged in
router.get('/Student', (req, res) => {

    let status = '';

    if (!isLogged) {
        res.render('StudentLogin.ejs', { status: status });
    } else {
        res.render('StudentHome.ejs');
    }

})

//Verify ID and Password AND AFTER THAT this will URL will also be used as HOME PAGE
router.post('/StudentHome', (req, res) => {


    let ID = req.body.studentID;

    let mysql = 'SELECT Student_ID as StudentID,Student_Name as StudentName,Password as Password,Year_Joined as YearJoined, Student_NIC as StudentNIC,Department_Name as DepartmentName FROM student_academics WHERE Student_ID = ' + ID;

    db.query(mysql, (err, result) => {
        if (err) {
            status = 'Please Enter The Correct User Name And Password';
            res.render('StudentLogin.ejs', { status: status })
        } else if (result.length === 0) {

            status = 'Invalid User ID';
            res.render('StudentLogin.ejs', { status: status })
        }

        let json = JSON.stringify(result);
        let temp = JSON.parse(json);

        let StudentAca = temp[0];


        isLogged = bcrypt.compareSync(req.body.StudentPassword, StudentAca.Password);

        if (isLogged) {
            const success = myCache.set("Student", StudentAca, 3000)
            if (!success) {
                console.log('ERROR! Cache Failed');
            }
            //Passing Student's Data To HTML(EJS) Page
            getStudentInfo(StudentAca.StudentNIC).then((StudentInfo) => {

                let tempStudentHolder = myCache.get("Student");
                myCache.set("StudentInfo", StudentInfo[0], 3000)
                // console.log(tempStudentHolder)
                res.render('StudentHome.ejs', { Student: tempStudentHolder, StudentInfo: StudentInfo[0] })
            })
        } else {
            status = 'Invalid Password'
            res.render('StudentLogin.ejs', { status: status })
        }
    })

})

router.get('/StudentHome', (req, res) => {
    // console.log(myCache.get("Student"));
    res.render("StudentHome.ejs", { Student: myCache.get("Student"), StudentInfo: myCache.get("StudentInfo") })
})



//Courses Route
router.get('/StudentCourses', (req, res) => {

    let Student = myCache.get("Student");
    // console.log(Student);
    getCurrentCourses(Student.StudentID).then((CurrentCourses) => {
        // console.log(CurrentCourses);
        myCache.set("CurrentCourses", CurrentCourses, 30000);
        res.render('StudentCourses.ejs', { CurrentCourses: CurrentCourses });
    })

})

//Attendance Route
router.get("/StudentAttendance/:CourseID", (req, res) => {

    let Course = myCache.get("CurrentCourses").filter((course) => {
        if (req.params.CourseID == course.CourseID) {
            return true;
        }
    })

    let Student = myCache.get("Student");

    getAttendance(Course[0].CourseID, Student.StudentID).then((Attendance) => {
        let presentCount = 0, totalAttendance = 0;
        Attendance.forEach((Attend) => {
            totalAttendance++;
            if (Attend.wasPresent == 'Present') {
                presentCount++;
            }
        })

        res.render('StudentAttendance.ejs', { Attendance: Attendance, AttendancePercentage: (presentCount / totalAttendance) * 100 });
    })

})


//Routes for Course Information
router.get('/StudentCourses/:CourseID/:InstructorID', (req, res) => {

    getInstructor(req.params.InstructorID).then((Instructor) => {


        getSchedule(req.params.CourseID).then((Schedule) => {

            let classSchedule = Schedule[0];
            let instructor = Instructor[0];
            let courseName = myCache.get("CurrentCourses").filter((course) => {
                if (req.params.CourseID == course.CourseID) {
                    return true;
                }
            })
            courseName = courseName[0].CourseName;

            res.render("CourseInfo.ejs", { CourseName: courseName, Instructor: instructor, Schedule: classSchedule })
        })

    })
})


//Modify Profile Of Student
router.post('/Modify/Student', (req, res) => {


    let newTelephone = req.body.Telephone;
    let newStudentAddress = req.body.StudentAddress;
    let Student = myCache.get("Student");
    console.log(newTelephone);
    console.log(newStudentAddress);
    let sizeOfTelephone = newTelephone.toString().length;
    console.log(sizeOfTelephone);
    if (sizeOfTelephone === 11) {
        let sqlQuery = 'UPDATE Student_info SET Student_Address="' + newStudentAddress + '",Student_Phone = ' + newTelephone + ' WHERE Student_NIC = ' + Student.StudentNIC;

        db.query(sqlQuery, (err, result) => {

            if (err) { throw err }
            console.log(result);
            res.redirect('/StudentHome');
        })
    }
    else {

        res.redirect('/StudentHome');
    }

})

router.get('/Exams', (req, res) => {

    let departmentName = myCache.get("Student").DepartmentName;

    getExamsSchedule(departmentName).then((Schedule) => {

        res.render("ExamsSchedule", { ExamSchedule: Schedule });
    })

})

//Books Available At Library
router.get('/Library', (req, res) => {

    getBooks().then((books) => {

        // console.log(books);
        // borrowBook(111, 111)
        getBorrowedBooks(21100).then((borrowedBooks) => {

            res.render('Library.ejs', { Books: books, borrowedBooks: borrowedBooks });
        })
    })

})

router.post('/Library/borrow', (req, res) => {

    const bookID = req.body.bookID;
    const StudentID = myCache.get("Student").StudentID;
    borrowBook(bookID, StudentID);
    res.redirect('/Library');

})

router.post('/Library/return', (req, res) => {

    const bookID = req.body.returnBookID;
    const StudentID = myCache.get("Student").StudentID;
    console.log(bookID);
    returnBook(bookID, StudentID);
    res.redirect('/Library');

})


//LogOut
router.get('/Logout', (req, res) => {

    isLogged = false;

    res.redirect('Student');

})

module.exports = router;