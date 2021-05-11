const express = require('express');
const router = express.Router();

let route = '/Faculty';

router.get('/Instructor', (req, res) => {


    res.render('InstructorLogin.ejs', { route: route });

})

router.get('/Instructorr', (req, res) => {

    res.send('no');

})

router.get('/Faculty', (req, res) => {
    res.redirect('/Instructor');
})


module.exports = router;