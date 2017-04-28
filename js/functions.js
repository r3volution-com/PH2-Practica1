function ajaxGetRequest(action, callback) {
  	var xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
   		if (this.readyState == 4 && this.status == 200) {
   			var obj = JSON.parse(this.responseText);
   			if (obj.RESULTADO == "ok" && obj.CODIGO == "200"){
	     		callback(obj);
	     	} else console.log("Error: la consola no se ha realizado correctamente. "+this.responseText);
    	}
 	};
  	xhttp.open("GET", action, true);
  	xhttp.send();
}
function ajaxPostRequest(data, action, callback) {
  	var xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
   		if (this.readyState == 4 && this.status == 200) {
   			var obj = JSON.parse(this.responseText);
   			if (obj.RESULTADO == "ok" && obj.CODIGO == "200"){
	     		callback(obj);
	     	} else console.log("Error: la consola no se ha realizado correctamente. "+this.responseText);
    	}
 	};
  	xhttp.open("POST", action, true);
  	xhttp.send(data);
}