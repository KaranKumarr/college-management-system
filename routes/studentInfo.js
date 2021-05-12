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


function getStudentInfo(NIC) {


    let sqlQuery = 'Select Student_NIC as StudentNIC,DATE_FORMAT(Dob,"%d %M %Y") as Dob, Gender as Gender, Guardian_Name as GaurdianName, Student_Phone as StudentPhone from Student_Info WHERE Student_NIC =' + NIC;

    return new Promise((resolve, reject) => {
        db.query(sqlQuery, (err, result) => {
            if (err) { reject(err) }
            else {
                let json = JSON.stringify(result);
                let StudentInfo = JSON.parse(json);

                resolve(StudentInfo);
            }
        })
    });

}



module.exports = { getStudentInfo };