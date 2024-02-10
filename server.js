'use strict';
const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const cors = require('cors');
const port= 3005;
// const port = process.env.PORT || 3001;

const { Client } = require('pg')
const url = `postgres://balqees:0000@localhost:5432/moveislist`
const client = new Client(url)

//route 
app.get('/', homeHandler);
app.post('/addMovie', addMovieHandler);
app.get('/getMovies', getMoviesHandler);

//handlers 
function homeHandler(req, res) {
    res.send("welcome home")
}



function addMovieHandler(req, res) {
    console.log(req.body)

    const { tiltle, overview, img } = req.body // destructuring
    const sql = `INSERT INTO movie_data (tiltle, overview, img)
                 VALUES ($1, $2, $3) RETURNING *;`;
    const values = [tiltle, overview, img]
    client.query(sql, values).then((result) => {
        console.log(result.rows);
        res.status(201).json(result.rows);
    }).catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
}

function getMoviesHandler(req, res) {
    const sql = `SELECT * FROM movie_data;`
    client.query(sql).then((result) => {
        const data = result.rows
        res.json(data)
    }).catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
}

client.connect().then(() => {
    app.listen(port, () => {
        console.log(`listening to port ${port}`);
    });
}).catch(error => {
    console.error(error);
});
