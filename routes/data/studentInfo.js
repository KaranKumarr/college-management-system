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


//Getting information about student
function getStudentInfo(NIC) {


    let sqlQuery = 'Select Student_NIC as StudentNIC,DATE_FORMAT(Dob,"%d %M %Y") as Dob, Gender as Gender, Guardian_Name as GaurdianName, Student_Phone as StudentPhone, Student_Address as StudentAddress from Student_Info WHERE Student_NIC =' + NIC;

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { reject(err) }
            else {
                //To Stringify The Row Data Packet Value Returned By the Query
                let json = JSON.stringify(result);
                //To Parse That Stringified Data To Proper Javascript Object
                let StudentInfo = JSON.parse(json);

                resolve(StudentInfo);
            }
        })
    });

}


//Getting list of all the students
const getStudentList = () => {

    let sqlQuery = 'SELECT Student_Name as StudentName,Student_ID as StudentID From Student_Academics';

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { reject(err) }
            else {
                //To Stringify The Row Data Packet Value Returned By the Query
                let json = JSON.stringify(result);
                //To Parse That Stringified Data To Proper Javascript Object
                let StudentName = JSON.parse(json);

                resolve(StudentName);
            }
        })
    })

}


module.exports = { getStudentInfo, getStudentList };