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


function getInstructorInfo(NIC) {


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



module.exports = { getInstructorInfo };