const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

let db = require("./models");

let PORT = 3000;

let app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//Routes
app.get("/scrape", (req, res) => {
    let result = {};
    axios.get("https://www.cnn.com/").then(response => {
        let $ = cheerio.load(response.data);

        $("article").each(function(i, element) {
            //empty result object

            result.title = $(this)
                .children("cd__headline-text")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
                
            });
        });
        res.json(result);
    });

//Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});  