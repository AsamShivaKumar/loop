// tracking the text entered into the search bar
         const div = document.querySelector(".matchedUsers");
document.querySelector(".searchBar input").addEventListener("input", function(evt){
         var req = { user: evt.target.value };
         if(evt.target.value.trim().length){
           $.post("/search", req, function(res,status){
              div.classList.add("showUsers");
              var html = "";
              for(var i = 0; i < res.users.length; i++){
                 html += "<a href='/prof/" + res.users[i]._id + "'><div class='searchedUser'><img src='/images/avatars/" + res.users[i].avatar + ".png'>" + res.users[i].userName + "</div></a>"
              }
              div.innerHTML = html;
           });
         }else{
           div.innerHTML = "";
           div.classList.remove("showUsers");
         }
});

document.querySelector(".searchBar input").addEventListener("blur",function(){
         if(document.querySelector(".searchBar input").value === ""){
           this.value = "";
           div.innerHTML = "";
           div.classList.remove("showUsers");
         }
});
