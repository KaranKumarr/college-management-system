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

    let sqlQuery = 'SELECT * FROM attendance WHERE Course_ID =' + CourseID + ' && Student_ID =' + StudentID;

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

module.exports = { getCurrentCourses, getAttendance }

