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

const getBooks = () => {


    return new Promise((resolve, reject) => {

        const sqlQuery = 'SELECT * FROM library WHERE Book_Available = "True" ORDER BY Book_Name'

        db.query(sqlQuery, (err, result) => {

            if (err) { reject(err) }
            else {
                resolve(result);
            }

        })

    })

}


module.exports = { getBooks }