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
let { getCurrentCourses, getAttendance, getInstructor, getSchedule, getExamsSchedule, getPreviousCourses } = require('./data/coursesInfo');
//To get Library Details
const { getBooks, borrowBook, getBorrowedBooks, returnBook } = require('./data/Library');
//To Store Cache
const NodeCache = require("node-cache");
const myCache = new NodeCache();
//enabling body parser that will allow us to get Input Field Values From Html back to this file
router.use(bodyParser.urlencoded({ extended: true }))
router.use(express.static('public'));

//Setting isLogged to false initally
let isLogged = false;

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

    let mysql = 'SELECT Student_ID as StudentID,Student_Name as StudentName,Password as Password,Year_Joined as YearJoined, Student_NIC as StudentNIC,student_academics.Department_Name as DepartmentName,Department_Manager as DepartmentManager,Manager_Email as ManagerEmail FROM student_academics INNER JOIN departments ON student_academics.Department_Name = departments.Department_Name WHERE Student_ID = ' + ID;

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


//Renders The Student Home Route
router.get('/StudentHome', (req, res) => {
    // console.log(myCache.get("Student"));
    res.render("StudentHome.ejs", { Student: myCache.get("Student"), StudentInfo: myCache.get("StudentInfo") })
})



//Current Courses Route
router.get('/StudentCourses', (req, res) => {

    let Student = myCache.get("Student");
    // console.log(Student);
    getCurrentCourses(Student.StudentID).then((CurrentCourses) => {
        // console.log(CurrentCourses);
        myCache.set("CurrentCourses", CurrentCourses, 30000);
        res.render('StudentCourses.ejs', { CurrentCourses: CurrentCourses });
    })

})


//Previous Courses Route
router.get("/StudentCourses/passed", (req, res) => {

    let Student = myCache.get("Student");

    getPreviousCourses(Student.StudentID).then((PreviousCourses) => {

        res.render("StudentPreviousCourses.ejs", { PreviousCourses: PreviousCourses })

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
    let sizeOfTelephone = newTelephone.toString().length;
    if (sizeOfTelephone === 11) {
        let sqlQuery = 'UPDATE Student_info SET Student_Address="' + newStudentAddress + '",Student_Phone = ' + newTelephone + ' WHERE Student_NIC = ' + Student.StudentNIC;

        db.query(sqlQuery, (err, result) => {

            if (err) { throw err }
            res.redirect('/StudentHome');
        })
    }
    else {

        res.redirect('/StudentHome');
    }

})

//Exams Schedule Route
router.get('/Exams', (req, res) => {

    let departmentName = myCache.get("Student").DepartmentName;

    getExamsSchedule(departmentName).then((Schedule) => {

        res.render("ExamsSchedule", { ExamSchedule: Schedule });
    })

})

//Books Available At Library
router.get('/Library', (req, res) => {


    const StudentID = myCache.get("Student").StudentID;
    getBooks().then((books) => {

        getBorrowedBooks(StudentID).then((borrowedBooks) => {

            let charges = new Array();



            for (let i = 0; i < borrowedBooks.length; i++) {

                let date = new Date()
                let issueDate = new Date(borrowedBooks[i].Issue_Date);
                let returnDate = new Date(date.toLocaleDateString());
                let difference = Math.abs(issueDate - returnDate);
                let differenceInDays = difference / (1000 * 3600 * 24);



                if (differenceInDays > 18700) {
                    charges.push('Not Returned')
                } else if (differenceInDays > 2) {
                    charges.push((differenceInDays - 3) * 100)
                } else {
                    charges.push(0)
                }

            }

            let numberOfBorrowedBooks = 0;

            for (let i = 0; i < borrowedBooks.length; i++) {

                if (borrowedBooks[i].Book_Available === 'False') {
                    numberOfBorrowedBooks++;
                }
            }


            res.render('Library.ejs', { Books: books, borrowedBooks: borrowedBooks, charges: charges, numberOfBorrowedBooks: numberOfBorrowedBooks });
        })
    })

})


//Borrowing a Book Route
router.post('/Library/borrow', (req, res) => {

    const bookID = req.body.bookID;
    const StudentID = myCache.get("Student").StudentID;
    borrowBook(bookID, StudentID);
    res.redirect('/Library');

})


//Routes to see books that have been borrowed by the student
router.get('/Library/borrow', (req, res) => {
    const bookID = req.query.books;
    const StudentID = myCache.get("Student").StudentID;
    borrowBook(bookID, StudentID);
    res.redirect('/Library')
})


//Returning a book that was borrowed
router.post('/Library/return/:returnBookID', (req, res) => {

    const bookID = req.params.returnBookID;
    const StudentID = myCache.get("Student").StudentID;
    const index = req.body.returnBookIDIndex;

    returnBook(bookID, StudentID);
    res.redirect('/Library');

})


//LogOut
router.get('/Logout', (req, res) => {

    isLogged = false;

    res.redirect('Student');

})

module.exports = router;