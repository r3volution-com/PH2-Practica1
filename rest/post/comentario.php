<?php
// FICHERO: rest/post/comentario.php

$METODO = $_SERVER['REQUEST_METHOD'];
// EL METODO DEBE SER POST. SI NO LO ES, NO SE HACE NADA.
if($METODO<>'POST') exit();
// PETICIONES POST ADMITIDAS:
//   rest/comentario/

// =================================================================================
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
   require_once('../configbd.php');
// =================================================================================
// =================================================================================

// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json");
// =================================================================================
// Se pillan las cabeceras de la petición y se comprueba que está la de autorización
// =================================================================================
$headers = apache_request_headers();
if(!isset($headers['Authorization']))
{ // Acceso no autorizado
  $R = array('RESULTADO' => 'error', 'CODIGO' => '401', 'DESCRIPCION' => 'Falta autorización');
  http_response_code(401); // 401 - Unauthorized access
  print json_encode($R);
  exit();
}
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R = []; // Almacenará el resultado.
$RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
// =================================================================================
// =================================================================================
$PARAMS      = $_POST;
$clave       = $headers['Authorization'];
$login       = sanatize($PARAMS['login']);
$titulo      = sanatize($PARAMS['titulo']);
$texto       = sanatize(nl2br($PARAMS['texto'],false));
$id_entrada  = sanatize($PARAMS['id_entrada']);

if( !comprobarSesion($login,$clave) )
{
	$RESPONSE_CODE = 401;
  	$R = array('RESULTADO' => 'ok',  "CODIGO" => '401', 'DESCRIPCION' => 'Tiempo de sesión agotado.');
}
else
{
	try{
		mysqli_query($link, 'BEGIN'); // Inicio de transacción
		$mysql  = 'insert into comentario(id_entrada,login,titulo,texto)';
		$mysql .= 'values(' . $id_entrada . ',"' . $login . '","' . $titulo . '","' . $texto . '")';

		if(mysqli_query($link, $mysql))
		{
			$mysql = 'select MAX(id) as id from comentario';
			if( $res = mysqli_query($link,$mysql) )
      		{
		        $row = mysqli_fetch_assoc($res);
		        $ID = $row['id'];
		  		$R = array('RESULTADO' => 'ok', 'CODIGO' => '200', 'id' => $ID);
		  	}
		}
		else
		{
			$RESPONSE_CODE = 500;
	    	$R = array('RESULTADO' => 'error', 'CODIGO' => '500', 'DESCRIPCION' => 'Error de servidor.');
		}
		mysqli_query($link, "COMMIT");
	}catch(Exception $e){
	  mysqli_query($link, "ROLLBACK");
	}
}
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
mysqli_close($link);
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
try {
    // Here: everything went ok. So before returning JSON, you can setup HTTP status code too
    http_response_code($RESPONSE_CODE);
    print json_encode($R);
}
catch (SomeException $ex) {
    $rtn = array('RESULTADO' => 'error', 'CODIGO' => '500', 'DESCRIPCION' => "Se ha producido un error al devolver los datos.");
    http_response_code(500);
    print json_encode($rtn);
}
?>