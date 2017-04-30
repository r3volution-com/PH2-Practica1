function ajaxGetRequest(action, callback) {
  	var xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
   		if (this.readyState == 4) {
        if (this.status == 200){
     			var obj = JSON.parse(this.responseText);
  	     	callback(obj);
        } else callback({RESULTADO: "error", CODIGO: this.status});
    	}
 	};
  	xhttp.open("GET", action, true);
  	xhttp.send();
}
function ajaxPostRequest(data, action, callback) {
  	var xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200){
          var obj = JSON.parse(this.responseText);
          callback(obj);
        } else callback({RESULTADO: "error", CODIGO: this.status});
      }
 	};
  	xhttp.open("POST", action, true);
  	xhttp.send(data);
}
function isLoggedIn(){
  if (sessionStorage.getItem("login")){
    var items = document.querySelectorAll(".loggedin");
    for (var item of items){
      item.style.display = "block";
    }
    var items = document.querySelectorAll(".loggedout");
    for (var item of items){
      item.style.display = "none";
    }
  } else {
    var items = document.querySelectorAll(".loggedout");
    for (var item of items){
      item.style.display = "none";
    }
    var items = document.querySelectorAll(".loggedin");
    for (var item of items){
      item.style.display = "block";
    }
  }
}
function logout(){
  sessionStorage.setItem("login", false);
  location.href=location.href;
}