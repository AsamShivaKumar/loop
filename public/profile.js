
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
          if(res.answers.length == 0){
             document.querySelector(".answers").innerHTML = "<h1>None</h1>";
          }else{
            for (var k = 0; k < res.answers.length; k++) {
              const div = document.createElement("div");
              document.querySelector(".answers").appendChild(div);
              const html = "<div class='answer'><div class='ans'>" + res.answers[k].answer + "</div><div class='likes'>" +  "<i class='fa fa-heart' aria-hidden='true'></i>" + res.answers[k].likes + "</div></div>";
              document.querySelector(".answers div").innerHTML += html;
            }
          }
  });
});

// changing avatar
document.querySelector(".changeAvatar button").addEventListener("click", function(){
         document.querySelector(".avatars").classList.toggle("show");
});

var ques = document.querySelectorAll(".queries div");
var queWinds = document.querySelectorAll(".queries .que");
for (let j = 0; j < ques.length; j++) {
  ques[j].addEventListener("click", function(evt) {
    let ind = Number(evt.target.getAttribute("name"));
    console.log(ind);
    queWinds[ind].classList.remove("hide");
    queWinds[ind].style.display = "block";
  });
}

// request for changing user-name
document.querySelector(".userName button").addEventListener("click", function(){
         var req = {
             mail: document.querySelector(".details p:nth-child(2)").textContent,
             userName: document.querySelector(".userName input").value
         }
         $.post("/changeUser",req,function(res,status){
           if(res.changed == true){
              document.querySelector(".userName input").placeholder = "Changed to - " + document.querySelector(".userName input").value;
           }else{
             document.querySelector(".userName input").placeholder = "Failed.Try again";
           }
               document.querySelector(".userName input").value = "";
         });
});

//deleting account
document.querySelector(".delete").addEventListener("click", function(){
  document.querySelector(".deleteAccount").classList.add("openDelete");
});

document.querySelector(".close").addEventListener("click",function(){
         document.querySelector(".deleteAccount").classList.remove("openDelete");
});

document.querySelector(".cancel").addEventListener("click",function(){
         document.querySelector(".deleteAccount").classList.remove("openDelete");
});

document.querySelector(".deleteButton").addEventListener("click", function(){

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
});
// end of managing deletion of account!

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
