
// nav
var btns = document.querySelectorAll(".nav i");
btns.forEach(function(btn) {
  btn.addEventListener("click", function(evt) {
    btns.forEach(function(bt) {
      bt.classList.remove("active");
    });
    evt.target.classList.add("active");
    document.querySelectorAll(".content div").forEach(div => {
      div.classList.remove("display");
    });
    document.querySelector("." + evt.target.getAttribute("name")).classList.add("display");
  });
});

//answers section
document.querySelector(".fa-pencil-square-o").addEventListener("click", function() {
  var req = {
    mail: document.querySelector(".details p:nth-child(2)").textContent
  };
  console.log("req: " + req.mail);
  $.post("/answers", req, function(res, status) {
    const div = document.createElement("div");
    document.querySelector(".answers").innerHTML = "";
    document.querySelector(".answers").appendChild(div);
          if(res.answers.length == 0){
             document.querySelector(".answers div").innerHTML = "<h1>None</h1>";
             document.querySelector(".answers div").classList.add("empty");
          }else{
            for (var k = 0; k < res.answers.length; k++) {
              const html = "<div class='answer'><div class='ans'>" + res.answers[k].answer + "</div><div class='likes'>" +  "<i class='fa fa-heart' aria-hidden='true'></i>" + res.answers[k].likes + "</div></div>";
              document.querySelector(".answers div").innerHTML += html;
            }
          }
  });
});

// queries section
if(document.querySelector(".queries").innerHTML === "None"){
     document.querySelector(".queries").classList.add("empty");
}


// changing avatar
document.querySelector(".changeAvatar button").addEventListener("click", function(){
         document.querySelector(".avatars").classList.toggle("show");
});

// document.querySelector(".changeAvatar button").addEventListener("click", function(){
//   const div = document.createElement("div");
//   document.querySelector(".answers").appendChild(div);
//   document.querySelector(".answers div").innerHTML = "<h1>None</h1>";
//   document.querySelector(".answers div").classList.add("empty");
// });

// var ques = document.querySelectorAll(".queries div");
// var queWinds = document.querySelectorAll(".queries .que");
// for (let j = 0; j < ques.length; j++) {
//   ques[j].addEventListener("click", function(evt) {
//     let ind = Number(evt.target.getAttribute("name"));
//     console.log(ind);
//     queWinds[ind].classList.remove("hide");
//     queWinds[ind].style.display = "block";
//   });
// }

// request for changing user-name
document.querySelector(".userName button").addEventListener("click", function(){
         var req = {
             mail: document.querySelector(".details p:nth-child(2)").textContent,
             userName: document.querySelector(".userName input").value
         }
         $.post("/changeUser",req,function(res,status){
           if(res.changed == true){
              document.querySelector(".details p:nth-child(1)").innerHTML = document.querySelector(".userName input").value;
              document.querySelector(".userName input").placeholder = "Changed to - " + document.querySelector(".userName input").value;
           }else{
             document.querySelector(".userName input").placeholder = "Failed.Try again";
           }
               document.querySelector(".userName input").value = "";
         });
});

//deleting account and query
document.querySelector(".delete").addEventListener("click", function(){
  document.querySelector(".pass span").innerHTML = "Enter password:"
  document.querySelector(".deleteAccount").classList.add("openDelete");
});

document.querySelector(".deleteAccount .close").addEventListener("click",function(){
         document.querySelector(".deleteAccount").classList.remove("openDelete");
});

document.querySelector(".cancel").addEventListener("click",function(){
         document.querySelector(".deleteAccount").classList.remove("openDelete");
});

document.querySelector(".deleteButton").addEventListener("click", function(){

         if(document.querySelector(".pass span").innerHTML === "Enter password:"){
             var req = { password: document.querySelector(".pass input").value };
             $.post("/deleteAccount",req,function(res,status){

             if(res.deleted === false){
                 document.querySelector(".message").textContent = "Check password and try again!";
                 setTimeout(function(){
                   document.querySelector(".message").textContent = "";
                 }, 3000);
             }else{
                 $('body').html(res);
                 document.querySelector("body").classList.add("deletedBody");
             }
           });
         }else{
            var req = {
                queId: document.querySelector(".pass span").getAttribute("name"),
                password: document.querySelector(".pass input").value
            }
            console.log("Req: " + req);
            $.post("/deleteQuery",req,function(res,status){
                  if(res.done === false){
                    document.querySelector(".message").textContent = "Check password and try again!";
                    setTimeout(function(){
                      document.querySelector(".message").textContent = "";
                    }, 3000);
                  }else{
                    var html = "";
                    res.queries.forEach( que =>{
                         html = "<div class='queDiv'><div class='questio'>" + que.que + "</div><i class='fa fa-pencil' aria-hidden='true' name='" + que._id + "'></i><i class='fa fa-trash-o' aria-hidden='true' name='" + que._id + "'></i></div>" + html;
                    });
                    document.querySelector(".queries").innerHTML = html;
                    document.querySelector(".deleteAccount").classList.remove("openDelete");
                  }
            });
         }

});
// end of managing deletion of account!

// deleting query

document.querySelector(".fa-trash-o").addEventListener("click", function(evt){
         document.querySelector(".pass span").innerHTML = "Enter password to delete query:"
         document.querySelector(".pass span").setAttribute("name", evt.target.getAttribute("name"));
         document.querySelector(".deleteAccount").classList.add("openDelete");
});

// editing query
document.querySelector(".editQuery .close").addEventListener("click",function(){
         document.querySelector(".editQuery").classList.remove("openEdit");
});

document.querySelector(".editCancel").addEventListener("click",function(){
         document.querySelector(".editQuery").classList.remove("openEdit");
});

document.querySelectorAll(".fa-pencil").forEach( pencil =>{
         pencil.addEventListener("click", function(evt){
                  var selec = ".queDiv:nth-last-child(" + (Number(evt.target.getAttribute("ind")) + 1) + ")";
                  console.log(selec);
                  document.querySelector(".queryEdit").value = document.querySelector(selec).childNodes[1].innerHTML.trim();
                  document.querySelector(".edit").setAttribute("name", document.querySelector(selec).childNodes[3].getAttribute("name"));
                  document.querySelector(".editQuery").classList.add("openEdit");
         });
});

document.querySelector(".edit").addEventListener("click", function(evt){
         var req = {
             queId: evt.target.getAttribute("name"),
             newQuery: document.querySelector(".queryEdit").value
         }

         $.post("/editQuery",req, function(res,status){
              document.querySelector(".editQuery").classList.remove("openEdit");
         });
});

// changing the avatar
document.querySelectorAll(".image img").forEach(img =>{
         img.addEventListener("click", function(evt){
             var req = {
               avt: evt.target.getAttribute("title")
             };
             $.post("/changeAvatar",req,function(res,status){
                  document.querySelector(".profile img").setAttribute("src","/images/avatars/" + req.avt + ".png");
                  document.querySelector(".span").innerHTML = "Avatar changed!";
                  document.querySelector(".avatars").classList.toggle("show");
                  setTimeout(function(){
                      document.querySelector(".span").innerHTML = "Change Avatar";
                  },3000);
             });
         });
})

//followees
document.querySelector(".fa-users").addEventListener("click", function(){
  var userMail = document.querySelector(".details p:nth-child(2)").innerHTML.trim();
  $.post("/getFollowees", { mail: userMail }, function(res,status){
      if(res.done){
         document.querySelector(".follow p:nth-child(1)").innerHTML = res.len + " Followees";
         document.querySelector(".followees").innerHTML = res.tagString;
      }else{
        document.querySelector(".follow p:nth-child(1)").innerHTML = "0 Followees";
      }
  });
});

//followers
document.querySelector(".fa-gratipay").addEventListener("click", function(){
    var userMail = document.querySelector(".details p:nth-child(2)").innerHTML.trim();
    $.post("/getFollowers", { mail: userMail}, function(res,status){
        if(res.done){
          document.querySelector(".follow p:nth-child(2)").innerHTML = res.len + " Followers";
          document.querySelector(".followers").innerHTML = res.tagString;
        }else{
          document.querySelector(".follow p:nth-child(2)").innerHTML = "0 Followers";
        }
    });
});

// displaying and closing queryDiv
//
// document.querySelectorAll(".questio").forEach( que => {
//          que.addEventListener("click", function(evt){
//              var req = {
//                  queId: evt.target.getAttribute("name")
//              }
//              console.log(req);
//              $.post("/getQue",req, function(res,status){
//                    var html = "";
//                    html += "<button class='close'><i class='fa fa-times-circle' aria-hidden='true'></i></button>";
//                    html += "<div class='queryPost'><div class='que'><div class='question'>" + res.que.que + "</div>"
//                    html += "<div class='postedBy'><img class='avatar' src='/images/avatars/" + res.que.avatar + ".png' />";
//                    html += "<div class='usersData'><p>" + res.que.postedBy + "</p><p>" + res.que.mail + "</p></div></div></div>";
//                    html += "<div class='answers'>";
//
//                    res.que.answers.forEach( ans => {
//                        html += "<div class='answer'><p>" + ans.answer + "</p>";
//                        html += "<div class='likep'><div class='postedBy'><img class='avatar' src='/images/avatars/" + ans.avatar + ".png' /><div class='userData'><p>" + ans.by  + "</p><p>" +  ans.mail + "</p></div></div></div></div>";
//                    });
//                    html += "</div></div>";
//                    document.querySelector(".queryDiv").innerHTML = html;
//                    document.querySelector(".queryDiv").classList.add("openDiv");
//              });
//          });
// });
//
// document.querySelector(".queryDiv .close").addEventListener("click", function(){
//     alert("Clicked!");
//     document.querySelector(".queryDiv").classList.remove("openDiv");
// });
