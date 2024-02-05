//Search Page
//http://localhost:3001/search?title=Raiders
function searchTtrinfHandler(req, res) {
    let trendName = req.query.title;
    let url = https://api.themoviedb.org/3/search/movie?api_key=${api_key}&language=en-US&query=${trendName}&page=2
    axios.get(url)
        .then(result => {
            console.log(req.query.title)
            const results = result.data.results || [];
            if (results.length > 0) {
                let response = results.map(movie => {
                    return new Movies(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
                });
                res.json(response);
            } else {
                console.log('No results found');
                res.json([]);
            }
        })
        .catch(error => {
            console.log(error)
            res.status(500).send('Sorry, Something Went Wrong')
        })
}