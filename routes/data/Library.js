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

        const sqlQuery = 'SELECT * FROM library ORDER BY Book_Name'

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

const updateBookState = (bookID, bookState) => {


    if (bookState === 'True') {
        const sqlQuery = 'UPDATE Library SET Book_Available = "False" WHERE Book_ID = ' + bookID;


        db.query(sqlQuery, (err, result) => {

            if (err) { console.log('Error While Updating Book State'); throw err }

        })
    } else {
        const sqlQuery2 = 'UPDATE Library SET Book_Available = "True" WHERE Book_ID = ' + bookID;


        db.query(sqlQuery2, (err, result) => {

            if (err) { console.log('Error While Updating Book State'); throw err }

        })

    }
}

const borrowBook = (bookID, studentID) => {

    let currentDate = new Date();
    // currentDate = currentDate.toISOString(currentDate);
    const sqlQuery = 'INSERT INTO books_borrowed(Book_ID,Issue_Date,Student_ID) VALUES ?';
    const values = [[bookID, currentDate, studentID]];
    db.query(sqlQuery, [values], (err, result) => {

        if (err) { console.log(err); }
        else {
            updateBookState(bookID, 'True');
        }

    })

}

const getBorrowedBooks = (studentID) => {


    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT books_borrowed.Book_ID as book_ID,DATE_FORMAT(Issue_Date,"%d %M %Y") as Issue_Date,DATE_FORMAT(Return_Date,"%d %M %Y") as Return_Date,Student_ID,Book_Name,Book_Available FROM books_borrowed INNER JOIN library ON library.Book_ID = books_borrowed.Book_ID WHERE Student_ID = ' + studentID + ' ORDER BY ISSUE_DATE';



        db.query(sqlQuery, (err, result) => {

            if (err) { console.log(err); reject(err); }

            //To Stringify The Row Data Packet Value Returned By the Query
            let json = JSON.stringify(result);
            //To Parse That Stringified Data To Proper Javascript Object
            let borrowedBooks = JSON.parse(json);

            resolve(borrowedBooks);

        })
    })
}

const returnBook = (bookID, studentID) => {

    let currentDate = new Date();
    // currentDate = currentDate.toISOString(currentDate);
    const sqlQuery = 'UPDATE books_borrowed SET return_date = "' + currentDate.toISOString().substring(0, 10) + '" WHERE Book_ID = ' + bookID;
    db.query(sqlQuery, (err, result) => {

        if (err) { console.log(err); }
        else {
            console.log(result);
            updateBookState(bookID, 'False');
        }

    })


}

module.exports = { getBooks, borrowBook, getBorrowedBooks, returnBook }