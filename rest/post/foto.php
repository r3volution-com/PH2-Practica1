<?php
// FICHERO: rest/post/foto.php

$METODO = $_SERVER['REQUEST_METHOD'];
// EL METODO DEBE SER POST. SI NO LO ES, NO SE HACE NADA.
if($METODO<>'POST') exit();
// PETICIONES POST ADMITIDAS:
//   rest/foto/

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
// Se supone que si llega aquí es porque todo ha ido bien y tenemos los datos correctos:
$PARAMS      = $_POST;
$clave       = $headers['Authorization'];
$login       = sanatize($PARAMS['login']);
$id_entrada  = sanatize($PARAMS['id_entrada']);
$texto       = sanatize(nl2br($PARAMS['texto']));

if( !comprobarSesion($login,$clave) )
{
  $RESPONSE_CODE = 401;
    $R = array('RESULTADO' => 'ok',  "CODIGO" => '401', 'DESCRIPCION' => 'Tiempo de sesión agotado.');
}
else
{
  try{
    // Se sube el fichero:
    // SI HAY FOTO, HAY QUE COPIARLA
    if( count($_FILES['foto']['name']) == 1)
    {
      if($_FILES['foto']['size'] > $max_uploaded_file_size)
      { // Tamaño de fichero demasiado grande
        $R = array('RESULTADO' => 'error', 'CODIGO' => '401', 'TAMANYO_FICHERO' => $_FILES['foto']['size'], 'MAX_TAMANYO' => $max_uploaded_file_size,'DESCRIPCION' => $_FILES["foto"]["error"]);
      }
      else
      { // Hay que guardar la foto
        if( mysqli_query($link,'BEGIN') )
        {
          $mysql  ='insert into foto(id_entrada,texto) values(' . $id_entrada . ',"' . $texto . '")';

          if( mysqli_query( $link, $mysql ) )
          {
            $mysql = 'select MAX(id) as id from foto';
            if( $res=mysqli_query( $link, $mysql ) )
            {
              $row = mysqli_fetch_assoc($res);
              $ID = $row['id'];
              // Se copia el fichero.
              // Nota: Hay que tener en cuenta que la carpeta de destino debe tener permisos de
              // escritura. En Windows no hay problema, pero en linux y mac hay que comprobarlo.
              $ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION); // extensión del fichero
              $uploadfile = $uploaddir . $ID . '.' . $ext; // path fichero destino
              // Se crea el directorio si no existe
              if (!file_exists($uploaddir)) {
                  mkdir($uploaddir, 0777, true);
              }
              if(move_uploaded_file($_FILES['foto']['tmp_name'], $uploadfile)) // se sube el fichero
              {
                $mysql = 'update foto set fichero="' . $ID . '.' . $ext . '" where ID=' . $ID;
                mysqli_query( $link, $mysql );
                // ===============================================================
                // Se ha subido la foto correctamente.
                $R = array('RESULTADO' => 'ok', 'CODIGO' => '200', 'id' => $ID);
                // ===============================================================
              }
              else // if(move_uploaded_file($_FILES['foto']['tmp_name'], $uploadfile))
              {
                $mysql = 'delete from foto where id=' . $ID; // se borrar el registro
                mysqli_query( $link, $mysql );
                $R = array('RESULTADO' => 'error', 'CODIGO' => '500', 'id' => $ID , 'DESCRIPCION' => $_FILES["foto"]["error"]);
              }
            }

          }
          // ******** FIN DE TRANSACCION **********
          mysqli_query($link,'COMMIT');
        }
        else
        {
          mysqli_query($link,'ROLLBACK');
        }
      } // if($_FILES['foto']['size'] > $max_uploaded_file_size)
    } // if( count($_FILES['f']['name']) == 1)
  } catch(Exception $e){
    // Se ha producido un error, se cancela la transacción.
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