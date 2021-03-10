const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const bodyParser = require("body-parser");
const EJS = require("ejs");
const app = express();
const notifier = require("node-notifier");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/moviepickerDB", {useNewUrlParser: true, useUnifiedTopology: true})

app.get("/", function(req, res){
    res.render('starter');
})

const movieSchema = new mongoose.Schema({
    name:{
        required: true,
        type: String
    }
});

const Movie = mongoose.model("Movie", movieSchema);

app.get("/add", function(req, res){
    res.render('add');
})

app.get("/found", function(req, res){
    Movie.estimatedDocumentCount().exec(function(err, result){
        const randomNum = Math.floor(Math.random() * result);
        Movie.findOne().skip(randomNum).exec(function(err, result){
            if(!result){
                notifier.notify({
                    title: "Hello!",
                    message:"Please add some movies to your list first!"
                });
                res.redirect("/");
            } else{
                if(!err){
                    res.render('found', {movieTitle: result.name});
                } else {
                    console.log(err);
                }
            }
        })
    })
})

app.post("/delete", function(req, res){
    const toDelete = req.body.delete;
    Movie.findOneAndRemove({name: toDelete}, function(err, result){
        if(!err){
            notifier.notify({
                title: "Success!",
                message:"Movie removed from the list."
            });
            res.redirect("/");
        }
    })
})

app.post("/added", function(req, res){
    const newMovieTitle = _.capitalize(req.body.movieTitle)
    Movie.findOne({name: newMovieTitle}, function(err, result){
        if(!err){
            if(!result){
                const movie = new Movie({
                    name: newMovieTitle
                });
                movie.save();
                res.render('added', {movieTitle: newMovieTitle});
            } else {
                res.render('exists', {movieTitle: newMovieTitle})
            }
        } else {
            console.log(err)
        }
    })

    
    
})

app.listen(3000, function(){
    console.log("Server up and running on port 3000");
})