<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once 'includes/database.php';
require_once 'includes/logincheck.php';

if(!isLoggedIn())
{
	die();
}


if(!empty($_GET['view']) && $_GET['view'] == "all")
{
	$output = str_replace(",[]", "", getUpper(0));
	echo $output;
}
else if(!empty($_GET['view'])) {
	echo getContent($_GET['view']);
}

if(!empty($_GET['action']) && $_GET['action'] == "change")
{
	if(!empty($_POST['name']) AND !empty($_POST['content']) AND !empty($_POST['id']))
	{
		echo changeContent($_POST['id'], $_POST['name'], $_POST['content']);
	}
}
else if(!empty($_GET['action']) && $_GET['action'] == "create")
{
	if(!empty($_POST['name']))
	{
		$name = $_POST['name'];
		
		if(!empty($_POST['upper']))
		{
			$upper = $_POST['upper'];
		}
		else {
			$upper = 0;
		}
		
		echo "0";
		echo createContent($name, $upper);
	}
}
else if(!empty($_GET['action']) && $_GET['action'] == "delete" && !empty($_GET['id']))
{
	if(!empty($_POST['delete']) && $_POST['delete'] == "true")
	{
		echo deleteContent($_GET['id']);
	}
	else
	{
		echo "2";
	}
}
else if(!empty($_GET['action']) && $_GET['action'] == "selectUpper" && !empty($_GET['id']))
{
	if(!empty($_POST['upper']))
	{
		echo setUpper($_GET['id'], $_POST['upper']);
	}
	else
	{
		echo setUpper($_GET['id'], '0');
	}
}
else if(!empty($_GET['action']) && $_GET['action'] == "hide" && !empty($_GET['id']))
{
	echo hideContent($_GET['id'], '1');
}
else if(!empty($_GET['action']) && $_GET['action'] == "show" && !empty($_GET['id']))
{
	echo hideContent($_GET['id'], '0');
}



function getUpper($pUpper)
{	
	global $database, $db;
	
	$sql = "SELECT `id`, `name`, `upper`, `hidden` FROM ".$database['PRAEFIX']."contents WHERE `upper`=".$pUpper;
	
	$db_erg = $db->query($sql);
	
	if (!$db_erg)
	{
		die('Ungültige Abfrage: ' . $db->error);
	}
	
	$lReturn = '[';
	while ($zeile = mysqli_fetch_array( $db_erg, MYSQL_ASSOC))
	{
		$output = str_replace("[[]]", "", getUpper($zeile['id']));
		
		if($output != "")
		{
			$lReturn .= "[";
		}
		
			$lReturn .= "[";
			$lReturn .= '"'. $zeile['name'] . '",';
			$lReturn .= '"admin",';
			$lReturn .= '"0",';
			$lReturn .= '"'. $zeile['id'] . '",';
			$lReturn .= '"'. $zeile['hidden'] . '"';
			$lReturn .= "],";
		  
		if($output != "")
		{
			$lReturn .= $output."],";
		}
	}
	$lReturn .= "[]]";
	 
	mysqli_free_result( $db_erg );
	
	return $lReturn;
}

$db->close();

function getName($pId)
{
	global $database, $db;
	// Get upper Element
	$sql = "SELECT `name` FROM ".$database['PRAEFIX']."contents WHERE `id`=? LIMIT 0,1";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('i', $pId);
	$stmt->execute();
	$stmt->bind_result($name);
	$stmt->fetch();
	$stmt->close();
	
	return $name;
}

function getContent($pId)
{
	global $database, $db;
	
	$lReturn = "{";
	
	$sql = "SELECT `id`, `name`, `content`, `upper`, `hidden` FROM ".$database['PRAEFIX']."contents WHERE `id`=?";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('i', $pId);
	$stmt->execute();
	$stmt->bind_result($id, $name, $content, $upper, $hidden);
	$stmt->fetch();
	$stmt->close();
	
	$lReturn .= '"id" : '.json_encode($id).',';
	$lReturn .= '"name" : '.json_encode($name).',';
	$lReturn .= '"upper" : '.json_encode($upper).',';
	$lReturn .= '"uppername" : '.json_encode(getName($upper)).',';
	$lReturn .= '"hidden" : '.json_encode($hidden).',';
	
	$content = demask($content);
	
	if (get_magic_quotes_gpc()) {
		$content = stripslashes($content);
	} 
		
	$lReturn .= '"content" : '.json_encode($content);
	$lReturn .= "}";
	
	return $lReturn;
}

function demask($pString)
{
	//$pString = preg_replace("/\r\n|\r|\n/",'<br/>',$pString);
	$pString = str_replace("'", "''", $pString);
	return $pString;
}

function changeContent($pId, $pName, $pContent)
{
	global $database, $db;
	
	$suchmuster = '#<img.+?src="([^"]*)".*?/?>#';
	preg_match_all($suchmuster, $pContent, $treffer, PREG_OFFSET_CAPTURE);
	
	for($i = 0; $i < count($treffer[1]); $i++)
	{
		if(strpos($treffer[1][$i][0], 'base64') !== false)
		{
			preg_match('#data:([^"]*);base64,([^"]*)#', $treffer[1][$i][0], $treffer2, PREG_OFFSET_CAPTURE);
			
			if(!empty($treffer2[1][0]))
			{
				$mime = $treffer2[1][0];
				$mimeTypes = Array("image/png" => ".png", "image/gif" => ".gif", "image/jpeg" => ".jpg");
				
				$filename = uniqid() . $mimeTypes[$mime];
				
				$datei = fopen(dirname(dirname(__file__)).'/images/'.$pId.'/'.$filename,"w+");
				fwrite($datei, base64_decode($treffer2[2][0]));
				fclose($datei);
				
				$htmlFilenmae = 'http://'.dirname(dirname($_SERVER['SERVER_NAME'] . $_SERVER['PHP_SELF'])).'/images/'.$pId.'/'.$filename;
				$pContent = str_replace($treffer[1][$i][0], $htmlFilenmae, $pContent);
			}
		}
	}
	
	//$db = connectDatabase();
	
	$sql = "UPDATE ".$database['PRAEFIX']."contents SET `name`=?, `content`=? WHERE `id`=?";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->errno . ' ' . $db->error, E_USER_ERROR);
	}
	
	if (get_magic_quotes_gpc()) {
		$pContent = stripslashes($pContent);
	}
	//$content = $db->real_escape_string($pContent);
	$content = $pContent;
	
	$stmt->bind_param('ssi', $pName, $content, $pId);
	$stmt->execute();
	$affected = $stmt->affected_rows;
	
	return $affected;
}

function createContent($pName, $pUpper)
{
	global $database, $db;
	
	$sql = "INSERT INTO ".$database['PRAEFIX']."contents SET `name`=?, `content`='', `upper`=?";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->errno . ' ' . $db->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('si', $pName, $pUpper);
	$stmt->execute();
	
	return $stmt->affected_rows;
}

function deleteContent($pId)
{
	global $database, $db;
	// Get upper Element
	$sql = "SELECT `upper` FROM ".$database['PRAEFIX']."contents WHERE `id`=? LIMIT 0,1";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('i', $pId);
	$stmt->execute();
	$stmt->bind_result($upper);
	$stmt->fetch();
	$stmt->close();
	
	
	// DELETE Element
	$sql = "DELETE FROM ".$database['PRAEFIX']."contents WHERE `id`=?";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->errno . ' ' . $db->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('i', $pId);
	$stmt->execute();
	$affected = $stmt->affected_rows;
	$stmt->close();
	
	
	// Change all Elements
	$sql = "UPDATE ".$database['PRAEFIX']."contents SET `upper`=? WHERE `upper`=?";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->errno . ' ' . $db->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('ii', $upper, $pId);
	$stmt->execute();
	
	
	if($affected > 0)
	{
		return "1";
	}
}

function setUpper($pId, $pUpper)
{
	global $database, $db;
	
	// Get upper Element
	$sql = "SELECT `name` FROM ".$database['PRAEFIX']."contents WHERE `id`=? LIMIT 0,1";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('i', $pUpper);
	$stmt->execute();
	$stmt->bind_result($name);
	$stmt->fetch();
	$stmt->close();
	
	if($pUpper == 0) // Work-Around for uppest level ($pUpper == 0)
	{
		$name = "oben";
	}
	
	if(!empty($name))
	{
		// Change all Elements
		$sql = "UPDATE ".$database['PRAEFIX']."contents SET `upper`=? WHERE `id`=?";
		
		$stmt = $db->prepare($sql);
		
		if($stmt === false) {
			trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->errno . ' ' . $db->error, E_USER_ERROR);
		}
		
		$stmt->bind_param('ii', $pUpper, $pId);
		$stmt->execute();
		
		if($stmt->affected_rows > 0)
		{
			return "1";
		}
	}
	else
	{
		return "0";
	}
}

function hideContent($pId, $value)
{
	global $database, $db;
		
	$sql = "UPDATE ".$database['PRAEFIX']."contents SET `hidden`=? WHERE `id`=?";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->errno . ' ' . $db->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('ii', $value, $pId);
	$stmt->execute();
	
	return $stmt->affected_rows;
}

?>