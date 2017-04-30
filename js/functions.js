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
function isJson(str) {
    if (str == "") return false;
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function isLoggedIn(){
  if (isJson(sessionStorage.getItem("login")) && JSON.parse(sessionStorage.getItem("login")).RESULTADO == "ok"){
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
      item.style.display = "block";
    }
    var items = document.querySelectorAll(".loggedin");
    for (var item of items){
      item.style.display = "none";
    }
  }
}
function logout(){
  sessionStorage.setItem("login", "");
  location.href=location.href;
}