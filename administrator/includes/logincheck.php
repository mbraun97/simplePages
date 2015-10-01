<?php
session_start();

$username = getUsername();
//$id = $_SESSION['id'];
$id = "1";
$passwordHash = hashPassword("123456");

function isLoggedIn()
{
	global $username, $password, $id;
	
	if(!empty($username) && !empty($id))
	{
		return true;
	}
	else
	{
		return false;
	}
	
	echo $_SESSION['username'].":test";
}

function loginUser($pUsername, $pPassword)
{
	require_once dirname(dirname(__file__)).'/includes/database.php';
	require_once dirname(dirname(__file__)).'/config/database.php';
	
	global $username, $passwordHash, $id;
	
	$praefix = $database['PRAEFIX'];
	
	$sql = "SELECT `id`, `password` FROM ".$praefix."user WHERE `username`=?";
	$stmt = $db->prepare($sql);
	
	if($stmt === false) {
		trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
	}
	
	$stmt->bind_param('s', $pUsername);
	$stmt->execute();
	$stmt->bind_result($id, $passwordHash);
	$stmt->fetch();
	$stmt->close();
	
	//$hashPassword = hashPassword($password);
	if(testPassword($pPassword, $passwordHash))
	{
		$_SESSION['id'] = $id;
		$_SESSION['username'] = $pUsername;
		$_SESSION['password'] = $passwordHash;
		return true;
	}
	return false;
}

function logoutUser()
{
	$_SESSION['id'] = "";
	$_SESSION['username'] = "";
	$_SESSION['password'] = "";
	unset($_SESSION);
}

function hashPassword($pString)
{
	require dirname(dirname(__file__)).'/config/configuration.php';
	
	return hash($conf['pwdAlgo'], $pString);
}

function testPassword($pPassword1, $pPassword2)
{
	if(hashPassword($pPassword1) == $pPassword2)
	{
		return true;
	}
	return false;
}

function getUsername()
{
	if(isset($_SESSION['username']))
	{
		return $_SESSION['username'];
	}
	return "";
}

?>