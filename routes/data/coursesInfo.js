const mysql = require('mysql');

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


const getCurrentCourses = (StudentID) => {

    let sqlQuery = 'SELECT courses_taken.Course_ID as CourseID,Student_ID as StudentID,Year_Taken as YearTaken,Course_Name as CourseName,instructor_ID as InstructorID FROM courses_taken LEFT JOIN courses_offered ON courses_taken.Course_ID = courses_offered.Course_ID WHERE Student_ID = ' + StudentID + ' && Passed = "FALSE"';

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { reject(err) }
            else {

                //To Stringify The Row Data Packet Value Returned By the Query
                let json = JSON.stringify(result);
                //To Parse That Stringified Data To Proper Javascript Object
                let CurrentCourses = JSON.parse(json);

                resolve(CurrentCourses);

            }

        })
    })
}

const getAttendance = (CourseID, StudentID) => {

    let sqlQuery = 'SELECT  wasPresent as wasPresent,DATE_FORMAT(class_date,"%d %M %Y") as classDate,Course_ID as CourseID, Student_ID as StudentID FROM attendance WHERE Course_ID =' + CourseID + '&& Student_ID =' + StudentID + ' ORDER BY class_date';

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { reject(err) }
            //To Stringify The Row Data Packet Value Returned By the Query
            let json = JSON.stringify(result);
            //To Parse That Stringified Data To Proper Javascript Object
            let Attendance = JSON.parse(json);
            resolve(Attendance);
        });
    })
}

const getInstructor = (InstructorID) => {

    let sqlQuery = "SELECT * FROM instructors WHERE Instructor_ID = " + InstructorID;

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { reject(err) }
            //To Stringify The Row Data Packet Value Returned By the Query
            let json = JSON.stringify(result);
            //To Parse That Stringified Data To Proper Javascript Object
            let Instructor = JSON.parse(json);
            resolve(Instructor);
        })
    })
}

const getSchedule = (CourseID) => {

    let sqlQuery = "SELECT Date_Format(Class_Time,'%r') as ClassTime,Class_Day as ClassDay, Class_Room as Classroom, Course_ID as CourseID FROM class_schedule WHERE Course_ID = " + CourseID;

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { reject(err) }
            //To Stringify The Row Data Packet Value Returned By the Query
            let json = JSON.stringify(result);
            //To Parse That Stringified Data To Proper Javascript Object
            let Schedule = JSON.parse(json);
            resolve(Schedule);
        })
    })

}

const getCoursesOFInstructor = (InstructorID) => {

    let sqlQuery = 'SELECT course_ID as courseID,Course_Name as CourseName, Department_Name as DepartmentName,Instructor_ID as InstructorID FROM courses_offered WHERE Instructor_ID = ' + InstructorID;

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { reject(err) }
            else {

                //To Stringify The Row Data Packet Value Returned By the Query
                let json = JSON.stringify(result);
                //To Parse That Stringified Data To Proper Javascript Object
                let InstructorCourses = JSON.parse(json);

                resolve(InstructorCourses);

            }

        })
    })
}

const getCoursesTaken = (CourseID) => {

    let sqlQuery = 'SELECT Course_ID as CourseID, Student_ID as StudentID, Year_Taken as YearTaken, Passed as Passed, Percentage as Percentage FROM courses_taken WHERE Passed = "False" && Course_ID = ' + CourseID;

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { throw reject(err) }
            else {

                //To Stringify The Row Data Packet Value Returned By the Query
                let json = JSON.stringify(result);
                //To Parse That Stringified Data To Proper Javascript Object
                let CoursesTaken = JSON.parse(json);

                resolve(CoursesTaken);

            }
        })
    })
}

module.exports = { getCurrentCourses, getAttendance, getInstructor, getSchedule, getCoursesOFInstructor, getCoursesTaken }