<?php
	header("Content-Type: text/html; charset=utf-8");
	
	require_once dirname(dirname(__file__)).'/config/database.php';
	
	$db = connectDatabase();
	
	function connectDatabase()
	{
		require dirname(dirname(__file__)).'/config/database.php';
	
		$db = mysqli_connect($database['HOST'], $database['USER'], $database['PASSWD'], $database['DB']);
		
		if(!$db)
		{
		    die('keine Verbindung möglich: ' . mysqli_error());
		}
		
		$db->set_charset('utf-8');
		
		unset($database['USER']);
		unset($database['PASSWD']);
		
		return $db;
	}
?>