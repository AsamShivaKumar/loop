
//event listener to open sidebar
document.querySelector(".sideBarButton").addEventListener("click", function() {
  document.querySelector(".sideBar").classList.toggle("click");
  var btn = document.querySelector(".sideBarButton");
  btn.classList.toggle("click");

  if (btn.innerHTML == "<span>▶</span>") btn.innerHTML = "<span>◀</span>"
  else btn.innerHTML = "<span>▶</span>"
});

//navbar
document.querySelector(".menuButton").addEventListener("click", clicked);

function clicked(){
         document.querySelector(".menuButton").classList.toggle("clicked");
         document.querySelector(".navbar").classList.toggle("display");
         document.querySelector(".sideBar").classList.toggle("hide");
         var buttn = document.querySelector(".sideBarButton");
         if(buttn.style.display === "none") buttn.style.display = "block";
         else buttn.style.display = "none";
}

// new post window-open
document.querySelector(".postQue").addEventListener("click",function(){
        document.querySelector(".newPost").classList.add("open");
});

// new post window-close
document.querySelector(".close").addEventListener("click", function(){
         document.querySelector(".newPost").classList.remove("open");
});

// new answer window-open
document.querySelectorAll(".answerQuery").forEach(function(ans){
          ans.addEventListener("click",function(event){
                  var queID = event.target.getAttribute("name");
                  document.querySelector(".hiddenInput").setAttribute("value",queID)
                  document.querySelector(".newAnswer").classList.add("open");
          });
});

// new answer window-close
document.querySelectorAll(".close")[1].addEventListener("click", function(){
         document.querySelector(".newAnswer").classList.remove("open");
});

// updating likes

var likes = document.querySelectorAll(".likep i");
for(let i = 0; i < likes.length; i++){
    likes[i].addEventListener("click", function(evt){
         var req;
         var que = document.querySelectorAll(".likep")[i].getAttribute("name");
         if(likes[i].classList[2] === "liked"){
            req = { id: evt.target.getAttribute("name"), like: "true", queID: que};
         }else{
            req = { id: evt.target.getAttribute("name"), like: "false", queID: que};
         }
         likes[i].classList.toggle("unliked");
         likes[i].classList.toggle("liked");
         $.post("/like", req, function(res,status){
              if(res.likeCount != -1) document.querySelectorAll(".numLikes")[i].innerHTML = res.likeCount;
         });
    });
}

// saving & deleting posts
var add = document.querySelectorAll(".follow");
var ques  = document.querySelectorAll(".answerQuery");

for(var i = 0; i < add.length; i++){
    const queID = {id: ques[i].getAttribute("name")};
    add[i].addEventListener("click",function(evt){
           if(evt.target.getAttribute("title") === "Save Post"){
                  $.post("/savePost",queID,function(res,status){
                    if(res){
                      evt.target.classList.add("saved");
                      evt.target.setAttribute("title","Saved");
                    }
                  });
           }else{
             $.post("/deleteFromSaved",queID,function(res,status){
               if(res){
                 evt.target.classList.remove("saved");
                 evt.target.setAttribute("title","Save Post");
               }
             });
           }
    });
}
