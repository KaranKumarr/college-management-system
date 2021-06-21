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



//getting information about instructor
const getInstructorInfo=(NIC)=> {


    let sqlQuery = 'Select Instructor_NIC as InstructorNIC,DATE_FORMAT(Dob,"%d %M %Y") as Dob, Gender as Gender, Telephone as InstructorPhone,Instructor_Address as InstructorAddress from Instructor_Info WHERE Instructor_NIC =' + NIC;

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { reject(err) }
            else {
                //To Stringify The Row Data Packet Value Returned By the Query
                let json = JSON.stringify(result);
                //To Parse That Stringified Data To Proper Javascript Object
                let InstructorInfo = JSON.parse(json);

                resolve(InstructorInfo);
            }
        })
    });

}


//getting attendance for a course
const getAttendance = (CourseID) => {

    let sqlQuery = 'SELECT  Student_Name as StudentName, wasPresent as wasPresent,DATE_FORMAT(class_date,"%d %M %Y") as classDate,Course_ID as CourseID, attendance.Student_ID as StudentID FROM attendance LEFT JOIN student_academics ON attendance.Student_ID = student_academics.Student_ID WHERE Course_ID =' + CourseID + ' ORDER BY Student_Name ASC';

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { reject(err) }
            //To Stringify The Row Data Packet Value Returned By the Query
            let json = JSON.stringify(result);
            //To Parse That Stringified Data To Proper Javascript Object
            let Attendance = JSON.parse(json);
            console.log(Attendance);
            resolve(Attendance);
        });
    })
}


module.exports = { getInstructorInfo, getAttendance };