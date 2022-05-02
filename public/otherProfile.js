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

// follow
document.querySelector(".followButton").addEventListener("click", function(){

         var btn = document.querySelector(".followButton");
         var fl = 0;
         const mail = document.querySelector(".details p:nth-child(2)").innerHTML;
         if( btn.innerHTML === "Follow" ) fl = 1; // flag = 1 if the user is not followed presently
         var req = {
             flag: fl,
             userMail: mail
         };
         $.post("/follow",req,function(res,status){
                var ini = document.querySelector(".follow p:nth-child(2)").innerHTML.trim().split(" ")[0];
                if(res.done){
                    if(btn.innerHTML === "Follow"){
                      btn.innerHTML = "Following";
                      document.querySelector(".follow p:nth-child(2)").innerHTML = Number(ini) + 1 + " Followers";
                    }else {
                      btn.innerHTML = "Follow";
                      document.querySelector(".follow p:nth-child(2)").innerHTML = Number(ini) - 1 + " Followers";
                    }
                }
         });
});

//followees
document.querySelector(".fa-users").addEventListener("click", function(){
  var userMail = document.querySelector(".details p:nth-child(2)").innerHTML.trim();
  $.post("/getFollowees", { mail: userMail}, function(res,status){
      if(res.done === true){
         document.querySelector(".followees").innerHTML = res.tagString;
      }else{
        document.querySelector(".followees").innerHTML = "<h1>None </h1><i class='fa fa-user-times' aria-hidden='true'></i>"
      }
  });
});

//followers
document.querySelector(".fa-gratipay").addEventListener("click", function(){
    var userMail = document.querySelector(".details p:nth-child(2)").innerHTML.trim();
    $.post("/getFollowers", { mail: userMail}, function(res,status){
        console.log(res.done);
        if(res.done === true){
           document.querySelector(".followers").innerHTML = res.tagString;
        }else{
          document.querySelector(".followers").innerHTML = "<h1>None </h1><i class='fa fa-user-times' aria-hidden='true'></i>"
        }
    });
});
