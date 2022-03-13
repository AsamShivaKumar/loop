require("dotenv").config();
const exp = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randString = require("randomstring");
const cookieParser = require("cookie-parser");

const app = exp();

app.use(exp.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

mongoose.connect("mongodb://localhost:27017/usersData");
// console.log(mongoose);

//Setting up nodemailer to send auth code to the user for authentication --
const transporter = nodemailer.createTransport({
        service: "Outlook365",
        host: "smtp.office365.com",
        port: "587",
        tls: {
         ciphers: "SSLv3",
         rejectUnauthorized: false,
        },
        auth:{
          user: process.env.SERVER_MAIL,
          pass: process.env.PASS
        }
      });

const userSchema = new mongoose.Schema({
      id: String,
      firstName: String,
      lastName: String,
      userName: String,
      mail: String,
      passHash: String,
      active: Boolean
});


const tokenSchema = new mongoose.Schema({
      userID: String,
      authCode: String,
});

const User = new mongoose.model("User",userSchema);
const Token = new mongoose.model("Token",tokenSchema);

// login page
app.get("/", function(req,res){
    // console.log(req.cookies);
  if(req.cookies.session_id){
    console.log("Logged in!");
    // res.render("home",{userName: req.cookies.user_name});
    res.sendFile(__dirname + "/home.html");
  }else{
    res.render("login", {Message: ""});
  }
});

// Login-in user
app.post("/login",function(req,res){
    User.findOne({mail: req.body.Email}, function(err,user){
         if(err) res.render("login", {Message: "Error!!!"});
         else if(user == null) res.render("login", {Message: "Email doesn't exists!"});
         else if(!user.active) res.render("login", {Message: "Authenticate your mail and try again!"});
         else bcrypt.compare(req.body.password,user.passHash, function(err,result){
                if(err){
                  res.render("login", {Message: "Try again"});
                }else if(result) {
                  var mail = req.body.Email;
                  res.cookie("session_id", mail);
                  res.cookie("user_name", user.userName);
                  res.sendFile(__dirname + "/home.html");
                }else{
                  res.render("login", {Message: "Incorrect Password!"});
                }
         });
    });
});

// SignUp page

app.get("/signUp", function(req,res){
    res.render("signUp", {message: ""});
});

// Create a new user

app.post("/signUp", function(req,res){
    const mail = req.body.email;
    if(req.body.password != req.body.rePassword || mail.slice(-24) != "@student.nitandhra.ac.in"){
      res.render("signUp",{message: "Incorrect credentials"});
    }

    User.findOne({mail: req.body.email},function(err,user){
         if(user != null) res.render("signUp",{message: "Email already exists!"});
    });

    bcrypt.hash(req.body.password,10,function(err,bHash){
      const newUser = new User({
            id: randString.generate(10),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            mail: req.body.email,
            passHash: bHash,
            active: false
      });
      // console.log(newUser.passHash);
         newUser.save();
         sendMail(newUser.id,req.body.email);
         var action = "/auth/" + newUser.id;
         res.render("auth",{action: action});
    });
});

function sendMail(userID,userMailID){
  var auth = randString.generate(10);

  // console.log("Usermail:" + userMailID);
  const options = {
    from: process.env.SERVER_MAIL,
    to: userMailID,
    subject: "Authenticate your email account!",
    text: "Auth Code: " + auth
  };

  const newToken = new Token({
        userID: userID,
        authCode: auth
  });
  newToken.save();
  transporter.sendMail(options);
}

// authorization

app.post("/auth/:userId",function(req,res){
    var userId = req.params.userId;
    console.log(userId);
    Token.find({userID: userId}, function(err, token){
           if(token.authCode == req.body.authCode){
              console.log("Successful!");
              Token.findOneAndDelete({userID: userId});
              res.render("login",{Message: "Successfully registered!"});
           }else{
              Token.findOneAndDelete({userID: userId});
              res.render("signUp", {message: "SignUp falied. Try again!"});
           }
    });
});

app.listen("3000",function(){
  console.log("Server set up at route 3000!");
});
