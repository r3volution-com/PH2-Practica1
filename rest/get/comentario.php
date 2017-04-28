<?php
// FICHERO: rest/get/comentario.php

$METODO = $_SERVER['REQUEST_METHOD'];
// EL METODO DEBE SER GET. SI NO LO ES, NO SE HACE NADA.
if($METODO<>'GET') exit();
// PETICIONES GET ADMITIDAS:
//   rest/comentario/{ID_COMENTARIO} -> devuelve toda la información del comentario
//   rest/comentario/?u={número} -> devuelve un array con los últimos (número) comentarios ordenados por fecha descendente
//   rest/comentario/?id_entrada={ID_ENTRADA}  -> devuelve un array con todos los comentarios de la entrada cuyo id es el que se le pasa
//   rest/comentario/?pag={pagina}&lpag={número de registros por pagina} -> devuelve los registros que están en la página que se le pide, tomando como tamaño de página el valor de lpag

// =================================================================================
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
   require_once('../configbd.php');
// =================================================================================
// =================================================================================
$RECURSO = explode("/", $_GET['prm']);
$PARAMS  = array_slice($_GET, 1, count($_GET) - 1,true);
$ID      = array_shift($RECURSO);
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json");
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R                   = [];  // Almacenará el resultado.
$RESPONSE_CODE       = 200; // código de respuesta por defecto: 200 - OK
$mysql               = '';  // para el SQL
$TOTAL_COINCIDENCIAS = -1;  // Total de coincidencias en la BD
// =================================================================================
if(is_numeric($ID))
{ // Se debe devolver la información del registro cuyo ID se indica
	$mysql  = 'select * from comentario where id=' . sanatize($ID);
}
else
{ // Se utilizan parámetros
	if(isset($PARAMS['id_entrada']) && is_numeric($PARAMS['id_entrada']))
	{ // se piden todos los comentarios de un viaje
		$mysql = 'select * from comentario where id_entrada=' . sanatize($PARAMS['id_entrada']) . ' order by fecha desc';
	}
  elseif(isset($PARAMS['u']) && is_numeric($PARAMS['u']))
  {
    $mysql = 'select c.*,e.nombre as nombre_entrada from comentario c, entrada e where c.id_entrada=e.id order by fecha desc LIMIT 0,' . sanatize($PARAMS['u']);
  }
	else
	{
		$RESPONSE_CODE = 400; // Los parámetros no son correctos
		$R = array("RESULTADO" => "error", "CODIGO" => "400", "DESCRIPCION" => "Los parámetros no son correctos");
	}

  // =================================================================================
  // PAGINACIÓN
  // =================================================================================
  if($mysql != '' && isset($PARAMS['pag']) && is_numeric($PARAMS['pag']) && isset($PARAMS['lpag']) && is_numeric($PARAMS['lpag']) ) // Si se va a realizar la consulta y se pide paginación ...
  {
    $pagina = sanatize($PARAMS['pag']);
    $regsPorPagina = sanatize($PARAMS['lpag']);
    $ELEMENTO_INICIAL = $pagina * $regsPorPagina;
    
    if(substr($mysql, -5) == 'where')
      $mysql = substr($mysql,0,strlen($mysql) - 6);

    // =================================================================================
    // Para sacar el total de coincidencias que hay en la BD:
    // =================================================================================
    if( $res = mysqli_query( $link, $mysql ) )
    {
        $TOTAL_COINCIDENCIAS = mysqli_num_rows($res);
        mysqli_free_result( $res );
    }
    $mysql .= ' LIMIT ' . $ELEMENTO_INICIAL . ',' . $regsPorPagina;
  }

}
// =================================================================================
// SE HACE LA CONSULTA
// =================================================================================
if( strlen($mysql)>0 && count($R)==0 && $res = mysqli_query( $link, $mysql ) )
{
  $AA = array("RESULTADO" => "ok", "CODIGO" => "200");
  if($TOTAL_COINCIDENCIAS>-1)
  {
      $AA['TOTAL_COINCIDENCIAS'] = $TOTAL_COINCIDENCIAS;
      $AA['PAGINA'] = $pagina;
      $AA['REGISTROS_POR_PAGINA'] = $regsPorPagina;
  }
  if( substr($mysql, 0, 6) == "select" )
  {
    while( $row = mysqli_fetch_assoc( $res ) )
      $R[] = $row;
    mysqli_free_result( $res );

    $R = array_merge( $AA, array("FILAS" => $R) );
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