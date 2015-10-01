<?php

require_once 'includes/database.php';

require_once '/includes/logincheck.php';

if(!isLoggedIn())
{
	die();
}

if(!empty($_GET['view']))
{
	if($_GET['view'] == "all")
	{
		echo getUsers();
	}
	else
	{
		echo getUser($_GET['view']);
	}
}
else if(!empty($_GET['action']))
{
	if($_GET['action'] == "create")
	{
		if(!empty($_POST['username']) && !empty($_POST['email']) && !empty($_POST['password1']) && !empty($_POST['password2']))
		{
			if($_POST['password1'] == $_POST['password2'])
			{
				echo createUser($_POST['username'], $_POST['password1'], $_POST['email']);
			}
			else {
				echo "passwords do not match";
			}
		}
		else {
			echo "something is not there";
		}
	}
	
	
	if($_GET['action'] == "delete" && !empty($_GET['id']))
	{
		if(!empty($_POST['delete']) && $_POST['delete'] == "true")
		{
			echo deleteUser($_GET['id']);
		}
		else
		{
			echo "2";
		}
	}
	
	if($_GET['action'] == "change" && !empty($_POST['id']))
	{
		if(!empty($_POST['email']) && !empty($_POST['username']))
		{
			echo changeUser($_POST['id'], $_POST['username'], $_POST['email'], $_POST['level']);
		}
		else
		{
			echo "2";
		}
	}
}

$db->close();

function getUsers()
{
	global $database, $db;
	
	$lReturn = "[";
	
	$sql = "SELECT `id`, `username`, `level` FROM ".$database['PRAEFIX']."user";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
	}
	
	$stmt->execute();
	$res = $stmt->get_result();
	
	while($row = $res->fetch_array(MYSQLI_ASSOC)) {
		$lReturn .= '[';
		$lReturn .= json_encode($row['id']).',';
		$lReturn .= json_encode($row['username']).',';
		$lReturn .= json_encode($row['level']).'';
		$lReturn .= '],';
	}
	$lReturn .= '[]';
	$lReturn .= "]";
	
	$lReturn = str_replace(",[]", "", $lReturn);
	
	return $lReturn;
}

function getUser($pId)
{
	global $database, $db;
	
	$lReturn = "{";
	
	$sql = "SELECT `id`, `username`, `email`, `level` FROM ".$database['PRAEFIX']."user WHERE `id`=?";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('i', $pId);
	$stmt->execute();
	$res = $stmt->get_result();
	
	while($row = $res->fetch_array(MYSQLI_ASSOC)) {
		$lReturn .= '"id" : '.json_encode($row['id']).',';
		$lReturn .= '"username" : '.json_encode($row['username']).',';
		$lReturn .= '"email" : '.json_encode($row['email']).',';
		$lReturn .= '"level" : '.json_encode($row['level']);
	}
	
	$lReturn .= "}";
	
	return $lReturn;
}

function createUser($pUsername, $pPassword, $pEmail)
{
	global $database, $db;
	
	$sql = "SELECT `username` FROM ".$database['PRAEFIX']."user WHERE `username`=? LIMIT 0,1";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('s', $pUsername);
	$stmt->execute();
	$stmt->bind_result($username);
	$stmt->fetch();
	$stmt->close();
	
	if($pUsername == $username)
	{
		return "user exists";
	}
	else
	{
		$pPassword = hashPassword($pPassword);
		
		$sql = "INSERT INTO ".$database['PRAEFIX']."user SET `username`=?, `password`=?, `email`=?";
		
		$stmt = $db->prepare($sql);
		
		if($stmt === false) {
			trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->errno . ' ' . $db->error, E_USER_ERROR);
		}
		
		$stmt->bind_param('sss', $pUsername, $pPassword, $pEmail);
		$stmt->execute();
		
		return $stmt->affected_rows;
		
		return $pPassword;
	}
}

function deleteUser($pId)
{
	global $database, $db;
	
	// DELETE Element
	$sql = "DELETE FROM ".$database['PRAEFIX']."user WHERE `id`=?";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->errno . ' ' . $db->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('i', $pId);
	$stmt->execute();
	$affected = $stmt->affected_rows;
	$stmt->close();
	
	if($affected > 0)
	{
		return "1";
	}
}

function changeUser($pId, $pUserame, $pEmail, $pLevel)
{
	global $database, $db;
		
	$sql = "UPDATE ".$database['PRAEFIX']."user SET `username`=?, `email`=?, `level`=? WHERE `id`=?";
	
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->errno . ' ' . $db->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('ssii', $pUserame, $pEmail, $pLevel, $pId);
	$stmt->execute();
	
	return $stmt->affected_rows;
}

?>