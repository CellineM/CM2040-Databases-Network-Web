/**
* index.js
* This is your main app entry point
*/

// Set up express, bodyparser and EJS
const express = require('express');
const app = express();
const port = 3000;



var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.use(express.static(__dirname + '/public')); // set location of static files

// Set up SQLite
// Items in the global namespace are accessible throught out the node application
const sqlite3 = require('sqlite3').verbose();

global.db = new sqlite3.Database('./database.db',function(err){
    if(err){
        console.error(err);
        process.exit(1); // bail out we can't connect to the DB
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
    }
});

// // Handle requests to the home page 
// app.get('/', (req, res) => {
//     res.send('Hello World!')
// });

// Add all the route handlers in usersRoutes to the app under the path /users
const usersRoutes = require('./routes/users');
const blogRoute = require("./routes/blog");
const readerRoutes = require("./routes/reader")


app.use('/users', usersRoutes);
app.use("/", blogRoute);
app.use('/', readerRoutes);


// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


// Handle requests to the home page 
app.get('/', (req, res) => {
    res.send(`
        <link rel="stylesheet" type="text/css" href="/main.css">

        <h1>Welcome to my Recipe Blog!!</h1>
        <p>Please choose which one are you!!</p>
        
        <div class = "translucentBox"> 
            <div class = "leftside">
                <a href = "/authorPage">Author</a>
            </div>

            <div class = "rightside">
                <a href = "/readerPage">Reader</a>
            </div>
        </div>

    `);
});

// Author Home Page
app.get('/authorPage', (req, res) => {
    res.render('authorPage');
});

// Reader Home Page
app.get('/readerPage', (req, res) => {
    res.render('readerPage');
});

// // Make the web application listen for HTTP requests
// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`);
// });


