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

mongoose.connect("mongodb+srv://ask:" + process.env.ATLAS_PASS + "@cluster0.pi81t.mongodb.net/usersData");
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
      mail: { type: String },
      passHash: String,
      avatar: {type: Number, default: 6},
      active: Boolean,
      following: { type: [String], default: [] },              // MailID of the followees
      followers: { type: [String], default: [] },              // followers' MailIDs
      queries: [mongoose.ObjectId],                            // ids of the queries posted by the userID
      saved: {type: [mongoose.ObjectId] ,default: []},         // ids of the queries saved by the user
      likedPosts: {type: [mongoose.ObjectId] ,default: []}     // ids of the posts liked by the user
});

const tokenSchema = new mongoose.Schema({
      userID: String,
      authCode: String,
});

const answerSchema = new mongoose.Schema({
      queId: mongoose.ObjectId, // question id
      by: String,               // user name
      mail: String,             //user MailID
      avatar: Number,           //usre avatar
      answer: String,           // answer
      likes: Number,            // like-count
});

const querySchema = new mongoose.Schema({
      postedBy: String,         //user name
      mail: String,             // user MailID
      avatar: Number,
      que: String,              // question
      answers: [ answerSchema ],              // arrays of answers
});

const commentSchema = new mongoose.Schema({
      mail: String,         // user mail
});

const User = new mongoose.model("User",userSchema);
const Token = new mongoose.model("Token",tokenSchema);
const Answer = new mongoose.model("Answer",answerSchema);
const Query = new mongoose.model("Query",querySchema);

// login page
app.get("/", function(req,res){
  if(req.cookies.user){
    res.redirect("/home");
  }else{
    res.render("lgin", {Message: ""});
  }
});

// Login-in user
app.post("/login",function(req,res){
    User.findOne({mail: req.body.Email}, function(err,user){
         if(err) res.render("lgin", {Message: "Error!!!"});
         else if(user == null) res.render("lgin", {Message: "Email doesn't exists!"});
         else if(!user.active) res.render("lgin", {Message: "Authenticate your mail and try again!"});
         else bcrypt.compare(req.body.password,user.passHash, function(err,result){
                if(err){
                  res.render("lgin", {Message: "Try again"});
                }else if(result) {
                  var mail = req.body.Email;
                  res.cookie("user", user);
                  res.redirect("/");
                }else{
                  res.render("lgin", {Message: "Incorrect Password!"});
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
    }else{
      User.findOne({mail: req.body.email},function(err,user){
           if(user != null){
              res.render("signUp",{message: "Email already exists!"});
           }else{
             bcrypt.hash(req.body.password,10,function(err,bHash){
               const newUser = new User({
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
                  var action = "/auth/" + newUser._id;
                  res.render("auth",{action: action});
             });
           }
      });
    }
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
  newToken.save();
  transporter.sendMail(options);
}

// authorization
app.post("/auth/:userId",function(req,res){
    var userId = req.params.userId;
    Token.findOne({userID: userId}, function(err, token){
           if(token.authCode === req.body.authCode){
              Token.findOneAndDelete({userID: userId});
              User.findOne({ _id: userId } ,function(err,user){
                   console.log(user);
                   if(err){
                     console.log(err);
                   }else{
                     user.active = true;
                     user.save();
                   }
              });
              res.render("lgin",{Message: "Successfully registered!"});
           }else{
              Token.findOneAndDelete({userID: userId});
              User.findOneAndDelete({_id: userId});
              res.render("signUp", {message: "SignUp falied. Try again!"});
           }
    });
});

// query Page
app.get("/home",function(req,res){
    const avatar = "/images/avatars/" + req.cookies.user.avatar + ".png";
    Query.find().sort({ _id: -1 }).exec(function(err,posts){
         if(!err){
           posts.forEach( que => {
                  Answer.find({ queId: que._id }).sort({ _id: -1 }).exec(function(error, answs){
                         if(error) console.log(error);
                         que.answers = answs;
                         que.save();
                  });
           });
           res.render("query",{user: req.cookies.user, avatar: avatar, queries: posts});
         }
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
     Query.findOne({ _id: queID},function(err,query){
           if(err) console.log(err);
           const user = req.cookies.user;
           const answer = new Answer({
                 queId: query._id,
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

    Query.find( { _id: { $in: ids} } ).sort({ _id: -1 }).exec(function(err,sQueries){
          var prf = "/prof/" + req.cookies.user._id;
          console.log(prf);
          if(!err) res.render("saved",{user: req.cookies.user, avatar: avatar, queries: sQueries, saved: 1, prof: prf });
    });
});

//profile page
app.get("/prof/:userId", function(req,res){

    if(req.params.userId === req.cookies.user._id){
      Query.find({mail: req.cookies.user.mail},function(err,ques){
            if(err) console.log(err);
            else res.render("profile", {user: req.cookies.user, queries: ques});
      });
    }else{
      User.findOne({ _id: req.params.userId }, function(err,userObj){
           if(err){
             console.log(err);
           }else{
             Query.find({mail: userObj.mail},function(err,ques){
                   if(err) console.log(err);
                   else res.render("otherProfile", {user: userObj, queries: ques, preUser: req.cookies.user});
             });
           }
      });
    }
});

// answers sec in profile page
app.post("/answers", function(req,res){
    Answer.find({ mail: req.body.mail.trim()}, function(err, ans){
           if(err) console.log(err);
           else res.send({ answers: ans });
    });
});

// changing user-name
app.post("/changeUser", function(req,res){
    User.findOne({mail: req.body.mail.trim()}, function(err,user){
         if(err){
           console.log(err);
           res.send({changed: false});
         }else if(user){
           user.userName = req.body.userName;
           user.save();

           Query.find( {mail: req.body.mail.trim()}, function(e,ques){
                 if(e) console.log(e);
                 ques.forEach( que =>{
                      que.postedBy = req.body.userName;
                      que.save();
                 });
           });

           Answer.find( {mail: req.body.mail.trim()}, function(er, answers){
                  if(er) console.log(er);
                  answers.forEach( ans =>{
                          ans.by = req.body.userName;
                          ans.save();
                  });
           });
           res.cookie("user", user);
           res.send({ changed: true });
         }
    });
});

// deleting account
app.post("/deleteAccount", function(req,res){

    var user = req.cookies.user;

    bcrypt.compare(req.body.password, req.cookies.user.passHash, function(err,result){
           if(err){
             console.log(err);
           }else if(result){
             User.deleteOne({ mail: user.mail }).then(function(){
                  res.clearCookie("user");
                  res.render("deleted",{});
             }).catch(function(err){
               res.send({ deleted: false });
             });
           }else{
             res.send({ deleted: false });
           }
    });
});

// changing avatar
app.post("/changeAvatar", function(req,res){
    var m = req.cookies.user.mail;
    var avt = req.body.avt;
    User.findOne({ mail: m }, function(err,user){
         if(err){
           console.log(err);
         }else{
           user.avatar = avt;
           user.save();
           res.cookie("user",user);
           Query.find({ mail: user.mail}, function(err,ques){
             ques.forEach( que =>{
                  que.avatar = user.avatar;
                  que.save();
             });
           });

           Answer.find({ mail: user.mail }, function(err,answ){
                  answ.forEach( ans =>{
                       ans.avatar = user.avatar;
                       ans.save();
                  });
           });
           res.send({ done: true });
         }
    });
});

// follow-button
app.post("/follow",function(req,res){
    var flag = Number(req.body.flag);
    var mail = req.body.userMail.trim();
    User.findOne({ mail: req.cookies.user.mail }, function(err,user){
         if(flag === 1){
             if(!user.following){
                user.following = [ mail ];
             }else{
                user.following.push(mail);
             }
             user.save();
             res.cookie("user",user);
             User.findOne({mail: mail}, function(err,us){
                  if(err){
                    console.log(err);
                  }else{
                    if(!us.followers){
                      us.followers = [ user.mail ];
                    }else{
                      us.followers.push(user.mail);
                    }
                    us.save();
                  }
             });
             res.send({done: true});
         }else{
            for(var i = 0; i < user.following.length; i++){
                if(user.following[i] === mail){
                   user.following.splice(i,1);
                   user.save();
                   res.cookie("user",user);
                   // console.log("Mail: " + mail);
                   User.findOne({ mail: mail }, function(err,us){
                        for(var j = 0; j < us.followers.length; j++){
                            if(us.followers[j] === user.mail){
                                  us.followers.splice(j,1);
                                  us.save();
                                  res.send({ done:true, len: us.followers.length });
                            }
                        }
                   });
                }
            }
         }
    });
});

// returning followees
app.post("/getFollowees", function(req,res){
        User.findOne({ mail: req.body.mail }, function(err,user){
          var ret = "";
          if(user.following.length === 0){
            if(req.cookies.user.mail === req.body.mail) res.cookie("user",user);
            res.send({ done: false,len: 0});
          }else{
            var ret = "";
            user.following.forEach( a => { ret += "<div class='usersFollowing'>" + a + "</div>"});
            if(req.cookies.user.mail === req.body.mail) res.cookie("user",user);
            res.send({done: true, tagString: ret, len: user.following.length});
          }
        });
});

// followers
app.post("/getFollowers", function(req,res){
      User.findOne({ mail: req.body.mail }, function(err,user){
        var ret = "";
        if(user.followers.length === 0){
          if(req.cookies.user.mail === req.body.mail) res.cookie("user",user);
          res.send( { done: false, len: 0 });
        }else{
          var ret = "";
          user.followers.forEach( a => { ret += "<div class='usersFollowing'>" + a + "</div>"});
          if(req.cookies.user.mail === req.body.mail) res.cookie("user",user);
          res.send({done: true, tagString: ret, len: user.followers.length});
        }
      });
});

app.get("/following",function(req,res){
    var mails = req.cookies.user.following;

    const avatar = "/images/avatars/" + req.cookies.user.avatar + ".png";
    Query.find({ mail: { $in: mails }}).sort( { _id: -1 }).exec(function(err,fQueries){
      if(!err) res.render("saved",{user: req.cookies.user, avatar: avatar, queries: fQueries, saved: 0 });
    });
});

//searching users
function escapeRegex(regex) {
    return regex.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.post("/search", function(req,res){
    const reg = new RegExp(escapeRegex(req.body.user),"gi");
    User.find({ userName: reg}, function(err,userObjs){
         if(err) {
           console.log(err);
         }else if(userObjs.length != 0) {
           res.send({ users: userObjs});
         }else{
           User.find({ mail: reg}, function(err, userObjs){
             if(err) {
               console.log(err);
             }else{
               res.send({ users: userObjs});
               sent = true;
             }
           });
         }
    });
});

// sending a query

app.post("/getQue", function(req,res){

    Query.findOne({ _id: req.body.queId }, function(err,que){
          if(err) {
            console.log(err);
          }else{
            res.send({que: que});
          }
    });

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
