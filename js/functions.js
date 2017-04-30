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
function ajaxHTMLRequest(action, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200){
          callback(this.responseText);
        } else callback("Error 404");
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
        elem.querySelector('a').onclick = function () { reply(fila.titulo) };

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
function reply(comment){
  document.querySelector("#titulo").value="Re:"+comment;
  document.querySelector("#comentario").focus();
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
        function titulo(){ 
          var cosa=document.getElementById("title").value;
          var title = false;
          if(cosa != ""){
            title = true;
          }
          return title;
        }
        function texto(){ 
          var cosa=document.getElementById("text").value;
          var text = false;
          if(cosa != ""){
            text = true;
          }
          return text;
        }
        function autor(){ 
          var cosa=document.getElementById("autor").value;
          var author = false;
          if(cosa != ""){
            author = true;
          }
          return author;
        }
        function desde(){
          var cosa=document.getElementById("datepicker").value;
          var since = false;
          if(cosa != ""){
            since = true;
          }
          return since;
        }         
        function hasta(){ 
          var cosa=document.getElementById("datepicker2").value;
          var to = false;
          if(cosa != ""){
            to = true;
          }
          return to;
        }
      function consulta(){
        var string1 = "";
        if(titulo()== true){
          string1 = string1+"n="+document.getElementById("title").value;
        }
        if(texto()==true){
          if(string1 !=""){string1= string1+"&";}
          string1 = string1+"d="+document.getElementById("text").value;
        }
        if(autor()==true){
          if(string1 !=""){string1= string1+"&";}
          string1 = string1+"l="+document.getElementById("autor").value;
        }
        if(desde()==true){
          if(string1 !=""){string1= string1+"&";}
          string1 = string1+"ff="+document.getElementById("datepicker").value;
        }
        if(hasta()==true){
          if(string1 !=""){string1= string1+"&";}
          string1 = string1+"fi="+document.getElementById("datepicker2").value;
        }
        return string1;
      }
      
      function clickFoto(evt){
            evt.parentNode.querySelector('.file').click();
          }
            function anadirFoto(){
              var temp = document.getElementById("template-foto");
              var Foto = document.getElementById("Fotos");
              Foto.appendChild(temp.content.cloneNode(true));
              Foto.querySelector('.file').addEventListener('change', handleFileSelect, false);
            }
            
            function borrarFoto(exp){
              let div = exp.parentNode.parentNode;
              div.remove();
            }
            function handleFileSelect(evt) {
              var valido=true;
              var x;
                var files = evt.target.files; // FileList object
                  // Loop through the FileList and render image files as thumbnails.
                for (var i = 0, f; f = files[i]; i++) {
                    if (!f.type.match('image.*')) {
                      continue;
                    }
                    if(files[i].size/1024<500){
                      //evt.target.parentNode.querySelector('.file').value= "";
                      //alert("El archivo es demasiado grande, debe pesar menos de 500KB");
                      //x = evt.target.parentNode.querySelector('img');
                      //x.parentNode.removeChild(x);
                      revelar(evt.target);
                      document.getElementById("aviso").innerHTML="Advertencia la foto no debe pesar mas de 500Kb";
                      evt.target.parentNode.querySelector(".validacion").value="true";
                    }
                    else{
                      document.getElementById("aviso").innerHTML="AVISO LA IMAGEN PESA MAS DE 500KB";
                      ocultar(evt.target);
                      evt.target.parentNode.querySelector(".validacion").value="false";
                    } 
                    var reader = new FileReader();
                      // Closure to capture the file information.
                      reader.onload = (function(theFile) {
                        return function(e) {
                          // Render thumbnail.
                          evt.target.parentNode.querySelector('.list').innerHTML= ['<img class="thumb" src="', e.target.result,
                          '" title="', escape(theFile.name), '"/>'].join('');

                        };
                      })(f);
                    // Read in the image file as a data URL.
                    reader.readAsDataURL(f);
                  }
                }
                function openNav(){
                  document.getElementById('overlay').style.width = "100%";
                }
                function sendForm(event, form){

                  event.preventDefault();
                  var obj = JSON.parse(sessionStorage.getItem("login"));
                  var clave = obj.clave;
                  var nombre = document.getElementById("nombre").value;
                  var descripcion = document.getElementById("descripcion").value;
                  var login = obj.login;
                  ajaxPostRequest("nombre="+nombre+"&descripcion="+descripcion+"&login="+login, 'rest/entrada/', function(response){
                    if(response.RESULTADO=='ok'){
                      var fotos = document.querySelectorAll(".tempFoto");
                      for(let foto of fotos){
                        let img = foto.querySelector("input.file");
                        let text = foto.querySelector("textarea");
                        ajaxPostRequest("login="+login+"&id_entrada="+response.id+"&texto="+text+"&foto="+img.files[0],"rest/foto/",function(response){
                        },clave);

                      }
                      //openNav();
                    }
                    else{
                      console.log(response);  
                    }
                  },clave);

                }
                function ocultar(ejm){
                  document.querySelector('#aviso').style.backgroundColor="red";
                }
                function revelar(ejm){
                  document.querySelector('#aviso').style.backgroundColor="transparent";
                }
