// tracking the text entered into the search bar
document.querySelector(".searchBar input").addEventListener("input", function(evt){
         var req = { user: evt.target.value };
         const div = document.querySelector(".matchedUsers");
         if(evt.target.value !== ""){
           $.post("/search", req, function(res,status){
              console.log(res.users);
              div.classList.add("showUsers");
              var html = "";
              for(var i = 0; i < res.users.length; i++){
                 html += "<a href='/prof/" + res.users[i]._id + "'><div class='searchedUser'><img src='/images/avatars/" + res.users[i].avatar + ".png'>" + res.users[i].userName + "</div></a>"
              }
              div.innerHTML = html;
           });
         }else{
           div.classList.remove("showUsers");
         }
});
