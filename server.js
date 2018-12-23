const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

let db = require("./models");

let PORT = process.env.PORT || 3000;

let app = express();

//app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//Connect to the Mongo DB
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//Routes
app.get("/scrape", function (req, res) {
    axios.get("https://www.bbc.com/news").then(function (response) {
        let $ = cheerio.load(response.data);
        $(".gs-c-promo-heading").each(function (i, element) {
            //empty result object
            let result = {};

            result.title = $(this)
                .text();
            result.link = $(this)
                .attr("href");

            db.Article.create(result)
                .then(dbArticle => {
                    console.log(dbArticle);
                })
                .catch(err => {
                    console.log(err);
                });
        });
    });
    res.send("scrape complete");
});

//route for getting all the articles
app.get("/articles", function(req, res) {
    db.Article.find({})
        .then(dbArticle => {
            res.json(dbArticle);
        })
        .catch(err => {
            res.json(err);
        });
});

//route for getting article by id, and its note
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            console.log("error here");
            res.json(err);
        });
});

//route for saving / updating notes
app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
        .then(dbNote => {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});  