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
        var json = JSON.parse(str);
        if (json == null) return false;
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
function loadEntries(nEntradas, nPagina, extra){
  ajaxGetRequest("rest/entrada/", function(res){
    if (res.RESULTADO == "ok"){
      var nPaginas = Math.floor((res.FILAS.length / nEntradas))+1;
      var action = "rest/entrada/?pag="+(nPagina-1)+"&lpag="+nEntradas;
      if (typeof extra != "undefined") action += "&"+extra;
      console.log(action);
      ajaxGetRequest(action, function(res){ 
        if (res.RESULTADO == "ok"){
          let entradas = document.querySelectorAll('.a-container article')
          for (let entrada of entradas){
            entrada.remove();
          }
          let plantilla = document.querySelector('.articles template');
          for (let fila of res.FILAS){
            let elem = plantilla.content.cloneNode(true);
            
            elem.querySelector('.aheader a').href = 'entradas.html?id='+fila.id;
            elem.querySelector('.aheader img').src = 'fotos/'+fila.fichero;
            elem.querySelector('.aheader img').alt = 'fotos/'+fila.nombre;
            elem.querySelector('.abody a').href = 'entradas.html?id='+fila.id;
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

        elem.querySelector('a').href = 'entradas.html?id='+fila.id;
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
      