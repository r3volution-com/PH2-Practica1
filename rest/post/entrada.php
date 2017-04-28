<?php
// FICHERO: rest/post/entrada.php

$METODO = $_SERVER['REQUEST_METHOD'];
// EL METODO DEBE SER POST. SI NO LO ES, NO SE HACE NADA.
if($METODO<>'POST') exit();
// PETICIONES POST ADMITIDAS:
//   rest/entrada/

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
$R             = [];  // Almacenará el resultado.
$RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
// =================================================================================

// =================================================================================
// Se supone que si llega aquí es porque todo ha ido bien y tenemos los datos correctos
// de la nueva entrada, NO LAS FOTOS. Las fotos se suben por separado una vez se haya
// confirmado la creación correcta de la entrada.
$PARAMS      = $_POST;
$clave       = $headers['Authorization'];
$login       = sanatize($PARAMS['login']);
$nombre      = sanatize($PARAMS['nombre']);
$descripcion = sanatize(nl2br($PARAMS['descripcion'],false));

if( !comprobarSesion($login,$clave) )
  $R = array('RESULTADO' => 'ok', 'CODIGO' => '200', 'DESCRIPCION' => 'Tiempo de sesión agotado.');
else
{
    // =================================================================================
    try{
      mysqli_query($link, "BEGIN");
      $mysql  = 'insert into entrada(login,nombre,descripcion) ';
      $mysql .= 'values("' . $login .'","' . $nombre . '","' . $descripcion . '")';
      if( mysqli_query($link,$mysql) )
      { // Se han insertado los datos del registro
        // Se saca el id del nuevo registro
        $mysql = "select MAX(id) as id from entrada";
        if( $res = mysqli_query($link,$mysql) )
        {
          $registro = mysqli_fetch_assoc($res);
          $id_registro = $registro['id'];
        }
        else $id_registro = -1;
        $R = array('RESULTADO' => 'ok', 'CODIGO' => '200', 'id' => $id_registro);
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
} // if( !comprobarSesion($login,$clave) )

// =================================================================================
// SE HACE LA CONSULTA
// =================================================================================
if( count($R)==0 && $res = mysqli_query( $link, $mysql ) )
{
  if( substr($mysql, 0, 6) == "select" )
  {
    while( $row = mysqli_fetch_assoc( $res ) )
      $R[] = $row;
    mysqli_free_result( $res );
  }
  else $R[] = $res;
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