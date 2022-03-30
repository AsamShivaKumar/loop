
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
    for (var k = 0; k < res.answers.length; k++) {
      const div = document.createElement("div");
      document.querySelector(".answers").appendChild(div);
      const html = "<p>" + res.answers[k].answer + "</p><br /><p>" + res.answers[k].likes + "<i class='fa fa-heart' aria-hidden='true'></i></p>";
      document.querySelector(".answers div").innerHTML += html;
    }
  });
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
