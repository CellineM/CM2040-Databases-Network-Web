// reader.js

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db'); // Update with your actual database name

/////////////////////////////////////   GET     /////////////////////////

// the route to show the readerPage = reader Homepage
router.get('/readerPage', (req, res) => {

    // sql to fetch the recipes from the table but by the most recent order
    const query = 'SELECT * FROM recipes WHERE published IS NOT NULL ORDER BY published DESC';

    // execute the query 
    db.all(query, [], (err, published) => {
        if (err) {
            // when there's error it will show the message
            console.error(err.message);
            return res.status(500).send('Error! :(');
        }
        
        // render the page and getting the published recipes as well.
        res.render('readerPage', { published });
    });
});

// reader.js

router.get('/readerArticle/:id', (req, res) => {
    const articleId = req.params.id;

    // Increase the number of reading for the current article
    const viewIncreased = 'UPDATE recipes SET num_reads = num_reads + 1 WHERE id = ?';
    db.run(viewIncreased, [articleId], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error! :(');
        }

        // Fetch the specific article from the recipes table database based on the ID
        const queryArticle = 'SELECT * FROM recipes WHERE id = ?';

        db.get(queryArticle, [articleId], (err, article) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Internal Server Error');
            }

            // Render the individual article page with the retrieved article data
            res.render('readerArticle', { article });
        });
    });
});

/////////////////////////////////////   POST     /////////////////////////


router.post('/readerArticle/:id/comment', (req, res) => {
    const articleId = req.params.id;
    const { readerName, readerText } = req.body; // extract the readers name (the one submitted)
    const date = new Date().toISOString(); // current date

    // Insert the new comment into the comments table
    const inputComment = 'INSERT INTO comments (article_id, readerName, readerText, date) VALUES (?, ?, ?, ?)';
    db.run(inputComment, [articleId, readerName, readerText, date], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }

        // Redirect back to the individual article page 
        res.redirect(`/readerArticle/${articleId}`);
    });
});

router.post('/readerArticle/:id/like', (req, res) => {
    const articleId = req.params.id;

    // update the likes 
    const UpdateLikes = 'UPDATE recipes SET num_likes = num_likes + 1 WHERE id = ?';
    db.run(UpdateLikes, [articleId], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }

        // Redirect back to the individual article page after liking
        res.redirect(`/readerArticle/${articleId}`);
    });
});

module.exports = router;
