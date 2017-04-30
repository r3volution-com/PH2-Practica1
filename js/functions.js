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
function ajaxPostRequest(data, action, callback, login) {
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
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    if(typeof login != "undefined"){
      xhttp.setRequestHeader("Authorization", login);
    }
  	xhttp.send(data);
}
function isJson(str) {
  if (str == "") return false;
  try {
      var json = JSON.parse(str);
      if (json == null) return false;
  } catch (e) {
      return false;
  }
  return true;
}
function openNav() {
  document.getElementById("overlay").style.width = "100%";
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
  document.getElementById("overlay").style.width = "0%";
  if (isJson(sessionStorage.getItem("login"))) location.href="index.html";
  else location.href="login.html";
}
function isLoggedIn(){
  if (isJson(sessionStorage.getItem("login")) && JSON.parse(sessionStorage.getItem("login")).RESULTADO == "ok"){
    var items = document.querySelectorAll(".loggedin");
    for (var item of items){
      item.style.display = "inline-block";
    }
    var items = document.querySelectorAll(".loggedout");
    for (var item of items){
      item.style.display = "none";
    }
  } else {
    var items = document.querySelectorAll(".loggedout");
    for (var item of items){
      item.style.display = "inline-block";
    }
    var items = document.querySelectorAll(".loggedin");
    for (var item of items){
      item.style.display = "none";
    }
  }
  document.getElementById("search-bar").addEventListener("keypress", function (evt){
    if (evt.keyCode == 13) location.href="buscar.html?nombre="+document.getElementById("search-bar").value;
  });
}
function logout(){
  sessionStorage.setItem("login", "");
  location.href=location.href;
}
function loadEntries(nEntradas, nPagina, extra){
  ajaxGetRequest("rest/entrada/", function(res){
    if (res.RESULTADO == "ok"){
      var nPaginas = Math.floor((res.FILAS.length / nEntradas))+1;
      var action = "rest/entrada/?pag="+(nPagina-1)+"&lpag="+nEntradas;
      if (typeof extra != "undefined") action += "&"+extra;
      ajaxGetRequest(action, function(res){ 
        if (res.RESULTADO == "ok"){
          let entradas = document.querySelectorAll('.a-container article')
          for (let entrada of entradas){
            entrada.remove();
          }
          let plantilla = document.querySelector('.articles template');
          for (let fila of res.FILAS){
            let elem = plantilla.content.cloneNode(true);
            
            elem.querySelector('.aheader a').href = 'entrada.html?id='+fila.id;
            elem.querySelector('.aheader img').src = 'fotos/'+fila.fichero;
            elem.querySelector('.aheader img').alt = 'fotos/'+fila.nombre;
            elem.querySelector('.abody a').href = 'entrada.html?id='+fila.id;
            elem.querySelector('.abody h3').innerHTML = fila.nombre;
            elem.querySelector('.abody .descripcion').innerHTML = fila.descripcion;
            elem.querySelector('.afooter .autor').innerHTML = fila.login;
            elem.querySelector('.afooter .numcom').innerHTML = fila.ncomentarios+"icono";
            elem.querySelector('.afooter .numfotos').innerHTML = fila.nfotos+"icono";
            elem.querySelector('.afooter .fecha').innerHTML = fila.fecha;

            document.querySelector('.a-container').appendChild(elem);
          }
        }
      });
      if (nPaginas > 1){
        if (nPagina == 1){
          document.querySelector('.a-pagination').innerHTML = '<b>'+nPagina+' de '+nPaginas+'</b><a href="#nPag='+(nPagina+1)+'" onclick="loadEntries('+nEntradas+','+(nPagina+1)+')">&gt;</a><a href="#nPag='+nPaginas+'" onclick="loadEntries('+nEntradas+','+nPaginas+')">&gt;&gt;</a>';
        } else if (nPagina == nPaginas) {
          document.querySelector('.a-pagination').innerHTML = '<a href="#nPag=1" onclick="loadEntries('+nEntradas+',1)">&lt;&lt;</a><a href="#nPag='+(nPagina-1)+'" onclick="loadEntries('+nEntradas+','+(nPagina-1)+')">&lt;</a><b>'+nPagina+' de '+nPaginas;
        } else {
          document.querySelector('.a-pagination').innerHTML = '<a href="#nPag=1" onclick="loadEntries('+nEntradas+',1)">&lt;&lt;</a><a href="#nPag='+(nPagina-1)+'" onclick="loadEntries('+nEntradas+','+(nPagina-1)+')">&lt;</a><b>'+nPagina+' de '+nPaginas+'</b><a href="#nPag='+(nPagina+1)+'" onclick="loadEntries('+nEntradas+','+(nPagina+1)+')">&gt;</a><a href="#nPag='+nPaginas+'" onclick="loadEntries('+nEntradas+','+nPaginas+')">&gt;&gt;</a>';
        }
      } else {
        document.querySelector('.a-pagination').innerHTML = '<b>'+nPagina+' de '+nPaginas+'</b>';
      }
    }
  });
}
function QueryString() {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}
function loadEntry(idEntry){
  ajaxGetRequest("rest/entrada/"+idEntry, function(res){
    if (res.RESULTADO == "ok"){
      let plantilla = document.querySelector('template#article');
      for (let fila of res.FILAS){
        let elem = plantilla.content.cloneNode(true);
        
        elem.querySelector('h2').innerHTML = fila.nombre;
        elem.querySelector('.aheader img').src = 'fotos/'+fila.fichero;
        elem.querySelector('.aheader img').alt = 'fotos/'+fila.nombre;
        elem.querySelector('.abody p').innerHTML = fila.descripcion;
        elem.querySelector('.afooter .autor').innerHTML = fila.login;
        elem.querySelector('.afooter .numcom').innerHTML = fila.ncomentarios+"icono";
        elem.querySelector('.afooter .numfotos').innerHTML = fila.nfotos+"icono";
        elem.querySelector('.afooter .fecha').innerHTML = fila.fecha;

        document.querySelector('.articles .article').appendChild(elem);
      }
    }
  });
  ajaxGetRequest("rest/comentario/?id_entrada="+idEntry, function(res){
    if (res.RESULTADO == "ok"){
      let plantilla = document.querySelector('template#comments');
      for (let fila of res.FILAS){
        let elem = plantilla.content.cloneNode(true);

        elem.querySelector('b').innerHTML = fila.titulo;
        elem.querySelector('p').innerHTML = fila.texto;
        elem.querySelector('.c-author').innerHTML = fila.login;
        elem.querySelector('.c-date').innerHTML = fila.fecha;

        document.querySelector('.comments').appendChild(elem);
      }
    }
  });
  ajaxGetRequest("rest/foto/?id_entrada="+idEntry, function(res){
    console.log(res);
    if (res.RESULTADO == "ok"){
      let plantilla = document.querySelector('template#images');
      for (let fila of res.FILAS){
        let elem = plantilla.content.cloneNode(true);

        elem.querySelector('img').src = "fotos/"+fila.fichero;
        elem.querySelector('img').alt = fila.texto;
        elem.querySelector('p').innerHTML = fila.texto;

        document.querySelector('.images').appendChild(elem);
      }
    }
  });
}
function loadComments(nComments){
  ajaxGetRequest("rest/comentario/?u="+nComments, function(res){
    if (res.RESULTADO == "ok"){
      let entradas = document.querySelectorAll('.comments div')
      for (let entrada of entradas){
        entrada.remove();
      }
      let plantilla = document.querySelector('.c-container template');
      for (let fila of res.FILAS){
        let elem = plantilla.content.cloneNode(true);

        elem.querySelector('a').href = 'entrada.html?id='+fila.id;
        elem.querySelector('h3').innerHTML = fila.nombre_entrada;
        elem.querySelector('b').innerHTML = fila.titulo;
        elem.querySelector('p').innerHTML = fila.texto;
        elem.querySelector('.c-author').innerHTML = fila.login;
        elem.querySelector('.c-date').innerHTML = fila.fecha;

        document.querySelector('.comments').appendChild(elem);
      }
    }
  });
}
      