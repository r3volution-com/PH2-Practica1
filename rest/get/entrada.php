<?php
// FICHERO: rest/get/entrada.php
// =================================================================================
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
   require_once('../configbd.php');
// =================================================================================
// =================================================================================
$METODO = $_SERVER['REQUEST_METHOD'];
// EL METODO DEBE SER GET. SI NO LO ES, NO SE HACE NADA.
if($METODO<>'GET') exit();
// PETICIONES GET ADMITIDAS:
//   rest/entrada/{ID_entrada} -------------> devuelve toda la información de la entrada
//   rest/entrada/{ID_entrada}/fotos -------> devuelve todas las fotos de la entrada
//   rest/entrada/{ID_entrada}/comentarios -> devuelve todos los comentarios de la entrada
//	 rest/entrada/?u={número} --------------> devuelve las últimas 'número' entradas, ordenadas de más a menos recientes
//	PARÁMETROS PARA LA BÚSQUEDA. DEVUELVE LOS REGISTROS QUE CUMPLAN
//  TODOS LOS CRITERIOS DE BÚSQUEDA (OPERADOR AND).
//	 rest/entrada/?n={nombre}
//	 rest/entrada/?d={descripción}
//	 rest/entrada/?l={login}
//   rest/entrada/?fi={aaaa-mm-dd} -> entradas con fecha de inicio posterior o igual a fi
//   rest/entrada/?ff={aaaa-mm-dd} -> entradas con fecha de fin anterior o igual a ff
//	 rest/entrada/?pag={pagina}&lpag={número de registros por pagina} -> devuelve los registros que están en la página que se le pide, tomando como tamaño de página el valor de lpag

$RECURSO = explode("/", $_GET['prm']);
$PARAMS = array_slice($_GET, 1, count($_GET) - 1,true);
$ID = array_shift($RECURSO);

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
$mysql  = 'select e.*,';
$mysql .= '(select f.fichero from foto f where f.id_entrada=e.id order by f.id LIMIT 0,1) as fichero,';
$mysql .= '(select f.texto from foto f where f.id_entrada=e.id order by f.id LIMIT 0,1) as descripcion_foto,';
$mysql .= '(select count(*) from foto f where f.id_entrada=e.id) as nfotos,';
$mysql .= '(select count(*) from comentario c where c.id_entrada=e.id) as ncomentarios';
$mysql .= ' FROM entrada e';

if(is_numeric($ID)) // Se debe devolver toda la información de la entrada
{
    if(count($RECURSO)<1)
        $mysql .= ' where id=' . sanatize($ID);
    else
    {
        switch (array_shift($RECURSO)) {
            case 'fotos':
                    $mysql = 'select * from foto where id_entrada=' . sanatize($ID);
                break;
            case 'comentarios':
                    $mysql = 'select * from comentario where id_entrada=' . sanatize($ID) . ' order by fecha desc';
                break;
        }
    }
}
else 
{ // Se utilizan parámetros
    // Se piden los últimos viajes subidos
    if(isset($PARAMS['u']) && is_numeric($PARAMS['u'])){
        $mysql .= ' order by e.fecha desc';
        $PARAMS['pag']  = 0;
        $PARAMS['lpag'] = sanatize($PARAMS['u']);
    }
    else if(count($PARAMS)>0)
    {
        $mysql .= ' where';
        // BÚSQUEDA POR NOMBRE
        if( isset($PARAMS['n']) )
            $mysql .= ' nombre like "%' . sanatize($PARAMS['n']) . '%"';
        // BÚSQUEDA POR DESCRIPCIÓN
        if( isset($PARAMS['d']) )
        {
            if(substr($mysql, -5) != 'where') $mysql .= ' and';
                $mysql .= ' descripcion like "%' . sanatize($PARAMS['d']) . '%"';
        }
        // BÚSQUEDA POR AUTOR (LOGIN)
        if( isset($PARAMS['l']) )
        {
            if(substr($mysql, -5) != 'where') $mysql .= ' and';
            $mysql .= ' login like "%' . sanatize($PARAMS['l']) . '%"';
        }
        // BÚSQUEDA POR FECHA
        if(isset($PARAMS['fi']) && es_fecha($PARAMS['fi']) )
        {
            if(substr($mysql, -5) != 'where') $mysql .= ' and';
            $mysql .= ' (CONVERT("' . sanatize($PARAMS['fi']) . '",DATE) <= fecha)';
        }
        if(isset($PARAMS['ff']) && es_fecha($PARAMS['ff']) )
        {
            if(substr($mysql, -5) != 'where') $mysql .= ' and';
            $mysql .= ' (CONVERT("' . sanatize($PARAMS['ff']) . '",DATE) >= fecha)';
        }
    }

    // =================================================================================
    // PAGINACIÓN
    // =================================================================================
    if(isset($PARAMS['pag']) && is_numeric($PARAMS['pag'])      // Página a listar
        && isset($PARAMS['lpag']) && is_numeric($PARAMS['lpag']))   // Tamaño de la página
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
if( strlen($mysql)>0 && count($R)==0 && $res=mysqli_query( $link, $mysql ) )
{
    $AA = array('RESULTADO' => 'ok', 'CODIGO' => '200');
    if($TOTAL_COINCIDENCIAS>-1)
    {
        $AA['TOTAL_COINCIDENCIAS'] = $TOTAL_COINCIDENCIAS;
        $AA['PAGINA'] = $pagina;
        $AA['REGISTROS_POR_PAGINA'] = $regsPorPagina;
    }
    if( substr($mysql, 0, 6) == 'select' )
    {
        while( $row = mysqli_fetch_assoc( $res ) )
          $R[] = $row;
        mysqli_free_result( $res );

        $R = array_merge( $AA, array('FILAS' => $R) );
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