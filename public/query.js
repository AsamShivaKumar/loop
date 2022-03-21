
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

document.querySelectorAll(".likep i").forEach(function(like){
         like.addEventListener("click", function(evt){
              like.style.color = "white";
              like.style.filter = "none";
         });
});
