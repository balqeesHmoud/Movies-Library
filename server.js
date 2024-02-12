 
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
const port=3000;
// const port = process.env.PORT;
const psqlPort = process.env.PSQLPORT;
const userName = process.env.USERNAME;
const sqlPass = process.env.SQLPASS;
const dataBaseName = process.env.DATABASENAME;


const { Client } = require('pg')
const url = `postgres://balqees:0000@localhost:5432/moveislist`
const client = new Client(url)

//routes
app.get('/trending', listTrendingMoviesHandler);
app.get('/search',searchHandler);

//TV Certifications
app.get('/tv_certifications',tvCertificationsHandler);

//Movie Certifications
app.get('/movie_certifications',movieCertificationsHandler);
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




//Create a constructor function to ensure your data follow the same format.
function Movie (ID,title,releaseDate,posterPath,overview){
    this.ID=ID
    this.title=title
    this.releaseDate=releaseDate
    this.posterPath=posterPath
    this.overview=overview
};





//functions
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
app.get('/favorite',getFavoriteHandler)
function getFavoriteHandler(req,res){
    res.send("Welcome to Favorite Page")
}


//Create a function to handle the server error (status 500)
app.get('/error',(req,res)=>res.send(error()))
app.use(function(err,req,res,text){
    res.type('text/plain')
    res.status(500)
    res.send('internal server error 500')

})
 




client.connect().then(() => {
    app.listen(port, () => {
        console.log(`listening to port ${port}`);
    });
}).catch(error => {
    console.error(error);
});
