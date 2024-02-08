const express = require('express')
const app = express()
const port = 3000
const jsonData = require('./Movie Data/data.json')

//Create a constructor function to ensure your data follow the same format.
function Data (title,posterPath,overview){
    this.title=title
    this.posterPath=posterPath
    this.overview=overview
}

//Favorite Page Endpoint: “/favorite”Response Example:Welcome to Favorite Page
app.get('/favorite',getFavoriteHandler)
function getFavoriteHandler(req,res){
    res.send("Welcome to Favorite Page")
}

//Create a route with a method of get and a path of /. The callback should use the provided JSON data.
app.get('/',getJsonDataHandler)
function getJsonDataHandler(req,res){
        let newData =new Data(jsonData.title,jsonData.poster_path,jsonData.overview)
        console.log(newData)
        
    res.json((newData))
}
//Create a function to handle the server error (status 500)
//500 error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});


//Create a function to handle "page not found error" (status 404)

app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});



console.log("hello")
//3. run server make it lis
app.listen(port, () => {
    console.log(`my app is running and  listening on port ${port}`)
  })