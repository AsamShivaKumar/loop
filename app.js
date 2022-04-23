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
      avatar: {type: Number, default: 6},
      active: Boolean,
      following: [String],       // user names of the followees
      followers: [String],       // followers' user names
      queries: [mongoose.ObjectId],       // ids of the queries posted by the userID
      saved: {type: [mongoose.ObjectId] ,default: []},          // ids of the queries saved by the user
      likedPosts: {type: [mongoose.ObjectId] ,default: []}     // ids of the posts liked by the user
});

const tokenSchema = new mongoose.Schema({
      userID: String,
      authCode: String,
});

const answerSchema = new mongoose.Schema({
      by: String,             // user name
      mail: String,           //user MailID
      avatar: Number,         //usre avatar
      answer: String,         // answer
      likes: Number,          // like-count
});

const querySchema = new mongoose.Schema({
      postedBy: String,         //user name
      mail: String,             // user MailID
      avatar: Number,
      que: String,              // question
      answers: [answerSchema]   // array of answers
});

const User = new mongoose.model("User",userSchema);
const Token = new mongoose.model("Token",tokenSchema);
const Answer = new mongoose.model("Answer",answerSchema);
const Query = new mongoose.model("Query",querySchema);

// login page
app.get("/", function(req,res){
  if(req.cookies.user){
    console.log("Logged in!");
    res.redirect("/home");
  }else{
    res.render("lgin", {Message: ""});
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
                  res.cookie("user", user);
                  res.redirect("/");
                }else{
                  res.render("login", {Message: "Incorrect Password!"});
                }
         });
    });
});

//$2b$10$zS9A5hZMDrmliPDyxMQ82eB1eSLCVey80TU4yEpCu3JvctVqyDBQu

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
         sendMail(newUser._id,req.body.email);
         var action = "/auth/" + newUser.id;
         res.render("auth",{action: action});
    });
});

function sendMail(userID,userMailID){
  const auth = randString.generate(10);
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
  console.log(newToken.userID);
  newToken.save();
  transporter.sendMail(options);
}

// authorization
app.post("/auth/:userId",function(req,res){
    var userId = req.params.userId;
    console.log(userId);
    Token.find({userID: userId}, function(err, token){
           console.log("Saved code: " + token.authCode);
           console.log("Entered code: " + req.body.authCode);
           if(token.authCode === req.body.authCode){
              console.log("Successful!");
              Token.findOneAndDelete({userID: userId});
              res.render("login",{Message: "Successfully registered!"});
           }else{
              Token.findOneAndDelete({userID: userId});
              User.findOneAndDelete({id: userId});
              res.render("signUp", {message: "SignUp falied. Try again!"});
           }
    });
});

// query Page
app.get("/home",function(req,res){
    const avatar = "/images/avatars/" + req.cookies.user.avatar + ".png";
    Query.find().limit(10).exec(function(err,posts){
         if(!err) res.render("query",{user: req.cookies.user, avatar: avatar, queries: posts});
    });
});

//new query
app.post("/newPost", function(req,res){
    const user = req.cookies.user;
    const que = new Query({
        postedBy: user.userName,
        mail: user.mail,
        avatar: user.avatar,
        que: req.body.question,
        answers: []
    });
    que.save();
    res.redirect("/home");
});

// new answer
app.post("/newAnswer", function(req,res){
     const queID = req.body.queID;
     const ans = req.body.newAnswer;

     Query.findOne({_id: queID},function(err,query){
           if(err) console.log(err);
           const user = req.cookies.user;
           const answer = new Answer({
                 by: user.userName,
                 mail: user.mail,
                 avatar: user.avatar,
                 answer: ans,
                 likes: 0,
           });
           answer.save();
           query.answers.push(answer);
           query.save();
           res.redirect("/home");
     });
});

//saving posts
app.post("/savePost", function(req,res){
    User.findOne({mail: req.cookies.user.mail}, function(err,user){
         if(err) {
           console.log(err);
           res.send(false);
          }
         else{
           user.saved.push(req.body.id);
           user.save();
           res.cookie("user",user);
           res.send(true);
         }
    });
});

// deleting posts from SAVED
app.post("/deleteFromSaved",function(req,res){
  const que = req.body.id;
  User.findOne({mail: req.cookies.user.mail}, function(err,user){
       if(err) {
         console.log(err);
         res.send(false);
       }else{
         for(var i = 0; i < user.saved.length; i++){
             const arr = [];
             if(user.saved[i].toString() === que){
                const temp = user.saved[i];
                user.saved[i] = user.saved[0];
                user.saved[0] = temp;
                user.saved.shift();     // shift operation removes the first element from the array
             }
         }
         user.save();
         res.cookie("user",user);
         res.send(true);
       }
  });
});

// managing likes
app.post("/like", function(req,res){
    Answer.findOne({_id: req.body.id}, function(err, answer){
           if(err){
             console.log(err);
             res.send({likeCount: -1});
           }else{
             if(req.body.like === "true") answer.likes--;
             else answer.likes++;
             answer.save();
             Query.findOne({_id: req.body.queID}, function(err,query){
                   if(err) console.log(err);
                   for(var i = 0; i < query.answers.length; i++){
                       if(query.answers[i]._id.toString() === answer._id.toString()){
                           query.answers[i] = answer;
                           query.save();
                           break;
                       }
                   }
             });
             User.findOne({mail: req.cookies.user.mail}, function(err,user){
                  if(err) {
                    console.log(err);
                  }else{
                    if(req.body.like === "false"){
                      user.likedPosts.push(req.body.id);
                    }else{
                      for(var i = 0; i < user.likedPosts.length; i++){
                          const arr = [];
                          if(user.likedPosts[i].toString() === req.body.id){
                             const temp = user.likedPosts[i];
                             user.likedPosts[i] = user.likedPosts[0];
                             user.likedPosts[0] = temp;
                             user.likedPosts.shift();     // shift operation removes the first element from the array
                          }
                      }
                    }
                    user.save();
                    res.cookie("user",user);
                    res.send({likeCount: answer.likes });
                  }
             });

           }
    });
});

//logging-out
app.get("/logout", function(req,res){
    res.clearCookie("user");
    res.redirect("/");
});

// saved posts
app.get("/saved-posts", function(req,res){
    const ids = req.cookies.user.saved;
    ids.forEach( id =>{
        id = mongoose.Types.ObjectId(id);
    });
    const avatar = "/images/avatars/" + req.cookies.user.avatar + ".png";

    Query.find( { _id: { $in: ids} } , function(err,sQueries){
          if(!err) res.render("saved",{user: req.cookies.user, avatar: avatar, queries: sQueries});
    });
});

//profile page
app.get("/:userId", function(req,res){
    Query.find({mail: req.cookies.user.mail},function(err,ques){
          if(err) console.log(err);
          else res.render("profile", {user: req.cookies.user, queries: ques});
    });
});

// answers sec in profile page
app.post("/answers", function(req,res){
    Answer.find({ mail: req.body.mail.trim()}, function(err, ans){
           if(err) console.log(err);
           else res.send({ answers: ans });
    });
});

//searching users
function escapeRegex(regex) {
    return regex.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.post("/search", function(req,res){
    const reg = new RegExp(escapeRegex(req.body.user),"gi");
    User.find({ userName: reg}, function(err,userObjs){
         if(err) console.log(err);
         else res.send({ users: userObjs});
    });
});

app.listen("3000",function(){
  console.log("Server set up at route 3000!");
});
