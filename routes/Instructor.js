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
let { getCoursesOFInstructor, getSchedule, getCoursesTaken } = require('./data/coursesInfo');
//get Student Name For Attendance Sheet
let { getStudentList } = require('./data/studentInfo');

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
    let status = '';

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
        if (err) {
            status = 'Please Enter The Correct User Name And Password';
            res.render('InstructorLogin.ejs', { status: status })
        } else if (result.length === 0) {

            status = 'Invalid User ID';
            res.render('InstructorLogin.ejs', { status: status })
        }

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
                res.render('InstructorHome.ejs', {
                    Instructor: tempInstructorHolder, InstructorInfo: InstructorInfo[0]
                })

            })

        } else {
            status = 'Invalid Password'
            res.render('InstructorLogin.ejs', { status: status })
        }
    })

})

//Get Route For Instructor Home
router.get('/InstructorHome', (req, res) => {
    res.render("InstructorHome.ejs", {
        Instructor: FacultyCache.get("Instructor"), InstructorInfo: FacultyCache.get("InstructorInfo")
    })
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
        res.render("InstructorClasses", { dates: dates, CourseName: CourseName[0].CourseName, CourseID: courseID })

    })

})

//COURSE INFO
router.get("/InstructorCourses/:courseID", (req, res) => {

    let CourseID = req.params.courseID;

    getSchedule(CourseID).then((schedule) => {

        let Course = FacultyCache.get("InstructorCourses");
        let CourseName;

        for (let i = 0; i < Course.length; i++) {

            if (Course[i].courseID == CourseID) {
                CourseName = Course[i].CourseName;
            }

        }

        let InstructorName = FacultyCache.get("Instructor").InstructorName;


        res.render("InstructorCoursesInfo.ejs", { InstructorName: InstructorName, CourseName: CourseName, Schedule: schedule[0] })

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

    getStudentList().then((Student) => {
        res.render("InstructorAttendance.ejs", { Attendance: filteredAttendance, date: dates[index], StudentList: Student, maxLength: Student.length })
    })

})


//Getting New Attendance
router.get('/Add/Attendance/:courseID', (req, res) => {

    let courseID = req.params.courseID;

    getCoursesTaken(courseID).then((Courses) => {
        console.log(Courses);
        FacultyCache.set("CourseID", courseID, 3000)
        res.render("AddAttendance.ejs", { Courses: Courses })
    })

})


//Post method --> Adding Attendance
router.post('/Add/Attendance', (req, res) => {

    let CourseID = FacultyCache.get("CourseID");
    let StudentIDs = req.body.StudentIDs;
    let Statuses = req.body.Statuses;
    let date = req.body.classdate;

    let Values = new Array();


    const getValues = (Statuses, StudentIDs) => {
        for (let i = 0; i < Statuses.length; i++) {

            Values.push([Statuses[i], date, CourseID, StudentIDs[i]])

        }
    }

    getValues(Statuses, StudentIDs);

    let sqlQuery = 'INSERT INTO Attendance(wasPresent,class_date,Course_ID,Student_ID) VALUES ?';

    db.query(sqlQuery, [Values], (err, result) => {

        if (err) { throw err }
        else {
            console.log(result);
            res.redirect('/InstructorClasses/' + CourseID);
        }

    })

})

//Modify Profile
router.post('/Modify/Instructor', (req, res) => {

    let newTelephone = req.body.Telephone;
    let newInstructorAddress = req.body.InstructorAddress;
    let Instructor = FacultyCache.get("Instructor");

    let sizeOfTelephone = newTelephone.toString().length;

    if (sizeOfTelephone === 11) {
        let sqlQuery = 'UPDATE instructor_info SET Instructor_Address="' + newInstructorAddress + '",Telephone = ' + newTelephone + ' WHERE Instructor_NIC = ' + Instructor.InstructorNIC;

        db.query(sqlQuery, (err, result) => {

            if (err) { throw err }

            res.redirect('/InstructorHome');
        })
    }
    else {

        res.redirect('/InstructorHome');
    }
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