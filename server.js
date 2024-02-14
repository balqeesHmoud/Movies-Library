'use strict';
const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const cors = require('cors');
const axios = require('axios');
const apiKey=process.env.API_KEY;
const jsonData = require('./Movie Data/data.json')
const port = process.env.PORT;



const { Client } = require('pg')
const url = process.env.url;
const client = new Client(url)

//routes
//lab11
app.get('/favorite',getFavoriteHandler)
//lab12
app.get('/trending', listTrendingMoviesHandler);
app.get('/search',searchHandler);
//TV Certifications
app.get('/tv_certifications',tvCertificationsHandler);
//Movie Certifications
app.get('/movie_certifications',movieCertificationsHandler);
//lab13
app.get('/', homeHandler);
app.post('/addMovie', addMovieHandler);
app.get('/getMovies', getMoviesHandler);
//lab14
app.put('/update/:id', updateMovieCommentsHandler);
app.delete('/delete/:id', deleteMovieHandler);
app.get('/get/:id', getMovieHandlerBYId);



//Create a constructor function to ensure your data follow the same format.
function Movie (ID,title,releaseDate,posterPath,overview){
    this.ID=ID
    this.title=title
    this.releaseDate=releaseDate
    this.posterPath=posterPath
    this.overview=overview
};



//handlers 
function updateMovieCommentsHandler(req, res) {
    let movieId = req.params.id;
    let { comments } = req.body;
    let sql = `UPDATE movie_data SET comments = $1 WHERE id = $2;`;
    let values = [comments, movieId];
    client.query(sql, values).then(result => {
        res.send("Successfully updated comments");
    }).catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
}
function deleteMovieHandler(req, res) {
    let movieId = req.params.id;
    let sql = `DELETE FROM movie_data WHERE id = $1;`;
    let values = [movieId];
    client.query(sql, values).then(result => {
        res.status(204).send("Successfully deleted");
    }).catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
}



function getMovieHandlerBYId(req, res) {
    let movieId = req.params.id;
    let sql = `SELECT * FROM movie_data WHERE id = $1;`;
    let values = [movieId];
    client.query(sql, values).then(result => {
        const data = result.rows[0];
        res.json(data);
    }).catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
}
function homeHandler(req, res) {
    res.send("welcome home")
}

function addMovieHandler(req, res) {
    console.log(req.body)

    const { title, releaseDate, posterPath, overview, comments } = req.body // destructuring
    const sql = `INSERT INTO movie_data (title, releaseDate, posterPath, overview, comments)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    const values = [title, releaseDate, posterPath, overview, comments]
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


function listTrendingMoviesHandler (req,res){
    let url =`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`
    axios.get(url)
    .then(result=>{
        console.log(result.data.results)
        let movesData = result.data.results.map(ele =>{
            return new Movie(ele.ID, ele.title, ele.release_date, ele.poster_path, ele.overview)

        })
        res.json(movesData)
    })
    .catch(error=>{
        console.log(error)
    })



};
// search function
function searchHandler(req, res) {
    console.log(req.query);
    let movieName = req.query.title;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${movieName}&page=2`;
    axios.get(url)
        .then(result => {
            console.log(req.query.title);
            if (result.data.results) {
                let moviesData = result.data.results.map(ele => {
                    return new Movie(ele.ID, ele.title, ele.release_date, ele.poster_path, ele.overview);
                });
                res.json(moviesData);
            } else {
                res.json([]); // Handle the case where there are no results
            }
        })
        .catch(error => {
            console.log(error);
        });


}

//tvCertificationsHandler function
function tvCertificationsHandler(req, res) {
    let url = `https://api.themoviedb.org/3/certification/tv/list?api_key=${apiKey}`;
    axios.get(url)
        .then(result => {
            console.log(result.data.certifications);
            res.json(result.data.certifications);
        })
        .catch(error => {
            console.log(error);
        });
}

//Movie Certifications
function movieCertificationsHandler(req, res) {
    let url = `https://api.themoviedb.org/3/certification/movie/list?api_key=${apiKey}`;
    axios.get(url)
        .then(result => {
            console.log(result.data.certifications);
            res.json(result.data.certifications);
        })
        .catch(error => {
            console.log(error);
        });
}



//Favorite Page Endpoint: “/favorite”Response Example:Welcome to Favorite Page
function getFavoriteHandler(req,res){
    res.send("Welcome to Favorite Page")
}


//Create a function to handle the server error (status 500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

//Create a function to handle "page not found error" (status 404)
app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});





client.connect().then(() => {
    app.listen(port, () => {
        console.log(`listening to port ${port}`);
    });
}).catch(error => {
    console.error(error);
});