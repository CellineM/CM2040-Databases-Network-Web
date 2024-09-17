const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.db");



/**
 * @desc Display all the users
 */
/////////////////////////////////////       GET     /////////////////////////////////////////////

// get the authorPage route
router.get("/authorPage", (req, res, next) => {
    // getting the data from blog_setting 
    global.db.get('SELECT * FROM blog_settings', (err, settings) => {
        // checking if there is any error
        if (err) { 
            // if no error pass the next error to the next error like middleware
            next(err);
            return;
        }

        // Fetch all the recipes from the recipe table
        global.db.all("SELECT * FROM recipes", (err, recipes) => {
            if (err) {
                next(err);
                return;
            }

            // the recipes is being separated into 2 = drafts and publish
            // if it's published it will go to published section
            const drafts = recipes.filter(recipe => !recipe.published);
            const published = recipes.filter(recipe => recipe.published);

            // Pass it to authorPage.ejs
            res.render("authorPage.ejs", { drafts, published, settings });
        });
    });
});

router.get("/authorCreate", (req, res) => {
    // pass the initial value of the name of the author as null
    res.render("authorCreate.ejs", { authorName: null }); // Pass null initially
});



router.get("/authorSettings/:id", (req, res, next) => {
    // getting the id from the rl
    const { id } = req.params;

    // whether id is new or not
    if (id === 'new') {
        // if it is new, create a new setting where the object is with default values.
        const newSettings = { id: 'new', blog_title: '', author_name: '' };
        res.render('authorSettings.ejs', { currentSettings: newSettings });
    } else {
        // if id = not new, get the settings from the database on the given id
        global.db.get('SELECT * FROM blog_settings WHERE id = ?;', id, function (err, settings) {
            if (err) {
                next(err);
            } else {
                // Check if settings exist, if not create a new setting object
                const currentSettings = settings || { id: 'new', blog_title: '', author_name: '' };
                res.render('authorSettings.ejs', { currentSettings });
            }
        });
    }
});

router.get("/authorPage/edit/:id", (req, res, next) => {
    // takign the id from the url
    const { id } = req.params;

    // get the recipe from the recipe table based on the id
    global.db.get('SELECT * FROM recipes WHERE id = ?;', id, function (err, recipe) {
        if (err) {
            next(err);
        } else {
            res.render('authorEdit.ejs', { locals: recipe });
        }
    });
});


/////////////////////////////////////       POST     /////////////////////////////////////////////


// handle the submission of the edit of the recipe in the authorPage
router.post("/authorPage/edit/:id", (req, res, next) => {
    // get the is and the recipe info from the request
    const { id } = req.params;
    const { title, recipe_info } = req.body;

    // only here to for debug 
    console.log("Received values:", { id, title, recipe_info, body: req.body });

    // update the recipe in the recipe table with any new info
    global.db.run(
        'UPDATE recipes SET title = ?, recipe_info = ?, modified = CURRENT_TIMESTAMP WHERE id = ?;',
        [title, recipe_info, id],
        function (err) {
            if (err) {
                next(err);
            } else {
                res.redirect('/authorPage');
            }
        }
    );
});


router.post("/authorCreate", (req, res, next) => {

    // getting the recipe info from the request of the body
    const title = req.body['blog-title'];
    const recipeInfo = req.body['recipe-info'];
    const publishDate = req.body['publish-date'];
    const createdDate = formatDate(req.body['created-date']); // changing the date format
    const authorName = req.body['author-name'];

    // insert the new recipe to the recipe table
    const query = "INSERT INTO recipes (title, recipe_info, publish_date, created_date, author_name) VALUES (?, ?, ?, ?, ?)";
    const queryParam = [title, recipeInfo, publishDate, createdDate, authorName];

    // to handle the sql and the error
    global.db.run(query, queryParam, function (err) {
        if (err) {
            next(err);
        } else {
            // redirect to authorpage when its successful
            res.redirect("/authorPage");
        }
    });

    // the date format
    function formatDate(inputDate) {
        const [year, month, day] = inputDate.split('-');
        return `${year}-${month}-${day}`;
    }
});



// Update the route to handle article deletion
router.post("/authorPage/delete/:id", (req, res, next) => {
    const { id } = req.params;
    global.db.run(
        'DELETE FROM recipes WHERE id = ?;', id, function (err) {
            if (err) {
                next(err);
            } else {
                res.redirect('/authorPage');
                // call the next following middleware so that processing can be continued
                next();
            }
        }
    );
});

// Add a route to handle article publishing
router.post("/authorPage/publish/:id", (req, res, next) => {
    const { id } = req.params;
    global.db.run(
        'UPDATE recipes SET published = CURRENT_TIMESTAMP WHERE id = ?;', [id], function (err) {
            if (err) {
                next(err);
            } else {
                res.redirect('/authorPage');
                next();
            }
        }
    );
});

router.post("/saveSettings/:id", (req, res, next) => {
    const { id } = req.params;
    const { blog_title, author_name } = req.body;

    const updateSettings = `
        UPDATE blog_settings
        SET blog_title = ?, author_name = ?
        WHERE id = ?;
    `;

    db.run(updateSettings, [blog_title, author_name, id], function (err) {
        if (err) {
            console.error("Error updating settings:", err);
            next(err);
        } else {
            console.log("update succeesfully!!");
            res.redirect("/authorPage");
        }
    });
});





module.exports = router;