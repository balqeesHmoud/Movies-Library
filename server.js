const express = require('express')
const app = express()
const axios = require('axios');
const port = 3007
const jsonData = require('./Movie Data/data.json')

//Create a constructor function to ensure your data follow the same format.
function Movie (id,title,releaseDate,posterPath,overview){
    this.id=id
    this.title=title
    this.releaseDate=releaseDate
    this.posterPath=posterPath
    this.overview=overview
}
//routes
app.get('/trending',listTrendingMoviesHandler);
app.get('/search',searchHandler);

//TV Certifications
app.get('/tv_certifications',tvCertificationsHandler);

//Movie Certifications
app.get('/movie_certifications',movieCertificationsHandler);




//functions
function listTrendingMoviesHandler(req,res){
    let url =`https://api.themoviedb.org/3/trending/all/week?api_key=60b47f14771c44b1da955019650eb9d2`
    axios.get(url)
    .then(result=>{
        console.log(result.data.results)
        let movesData = result.data.results.map(ele =>{
            return new Movie(ele.id, ele.title, ele.release_date, ele.poster_path, ele.overview)

        })
        res.json(movesData)
    })
    .catch(error=>{
        console.log(error)
    })



}
// search function
function searchHandler(req, res) {
    console.log(req.query);
    let movieName = req.query.title;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=668baa4bb128a32b82fe0c15b21dd699&language=en-US&query=${movieName}&page=2`;
    axios.get(url)
        .then(result => {
            console.log(req.query.title);
            if (result.data.results) {
                let moviesData = result.data.results.map(ele => {
                    return new Movie(ele.id, ele.title, ele.release_date, ele.poster_path, ele.overview);
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
function tvCertificationsHandler(req,res){
    let url =`https://api.themoviedb.org/3/certification/tv/list?api_key=60b47f14771c44b1da955019650eb9d2`
    axios.get(url)
    .then(result=>{
        console.log(result.data.certifications)
        let tvCertifications = result.data.certifications.map(ele =>{
            return tvCertifications

        })
        res.json(tvCertifications)
    })
    .catch(error=>{
        console.log(error)
    })

}

//Movie Certifications
function movieCertificationsHandler(req,res){
    let url =`https://api.themoviedb.org/3/certification/movie/list?api_key=60b47f14771c44b1da955019650eb9d2`
    axios.get(url)
    .then(result=>{
        console.log(result.data.certifications)
        let tvCertifications = result.data.certifications.map(ele =>{
            return tvCertifications

        })
        res.json(tvCertifications)
    })
    .catch(error=>{
        console.log(error)
    })

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


//Create a function to handle "page not found error" (status 404)

app.get('*',(req,res)=>res.send("page not found error (status 404)"))



console.log("hello")
//3. run server make it lis
app.listen(port, () => {
    console.log(`my app is running and  listening on port ${port}`)
  })