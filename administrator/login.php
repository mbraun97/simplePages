<?php

require 'includes/logincheck.php';

if(isLoggedIn())
{
	if(!empty($_GET['action']) && $_GET['action'] == "isLoggedIn")
	{
		echo "logged in";
	}
	
	if(!empty($_GET['action']) && $_GET['action'] == "logout")
	{
		logoutUser();
		header('Location: /');
	}
}
else
{
	if(!empty($_GET['action']) && $_GET['action'] == "isLoggedIn")
	{
		echo "not logged in";
	}
	
	if(!empty($_GET['action']) && $_GET['action'] == "login")
	{
		if(!empty($_POST['username']) && !empty($_POST['password']))
		{
			if(loginUser($_POST['username'], $_POST['password']))
			{
				echo "logged in";
			}
			else {
				echo "false user";
			}
		}
	}
}

?>