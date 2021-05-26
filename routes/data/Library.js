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

                //To Stringify The Row Data Packet Value Returned By the Query
                let json = JSON.stringify(result);
                //To Parse That Stringified Data To Proper Javascript Object
                let LibraryBooks = JSON.parse(json);

                resolve(LibraryBooks);
            }

        })

    })

}

const updateBookState = (bookID) => {

    const sqlQuery = 'UPDATE Library SET Book_Available = "False" WHERE Book_ID = ' + bookID;


    db.query(sqlQuery, (err, result) => {

        if (err) { console.log('Error While Updating Book State'); throw err }

    })

}

const borrowBook = (bookID, studentID) => {

    let currentDate = new Date();
    // currentDate = currentDate.toISOString(currentDate);
    console.log(currentDate.toISOString().substring(0, 10));
    const sqlQuery = 'INSERT INTO books_borrowed(Book_ID,Issue_Date,Student_ID) VALUES ?';
    const values = [[bookID, currentDate, studentID]];
    db.query(sqlQuery, [values], (err, result) => {

        if (err) { console.log(err); }
        else {
            updateBookState(bookID);
        }

    })

}


module.exports = { getBooks, borrowBook }