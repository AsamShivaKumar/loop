require("dotenv").config();
const exp = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = exp();

app.use(exp.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


app.get("/", function(req,res){
    res.sendFile(__dirname + "/login.html");
});

app.get("/signUp", function(req,res){
    res.render("signUp", {});
});

app.post("/signUp", function(req,res){
    console.log(req.body);
});

app.listen("3000",function(){
  console.log("Server set up at route 3000!");
});
