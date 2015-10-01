<?php

require_once 'includes/logincheck.php';

if(!isLoggedIn())
{
	die();
}

$homepage = 'http://'.dirname(dirname($_SERVER['SERVER_NAME'] . $_SERVER['PHP_SELF']));

if(!empty($_GET['view']))
{
	$path = '/images/'.$_GET['view'].'/';
	
	if(is_dir('..'.$path))
	{
		echo getFiles($path);
	}
	else
	{
		echo "[[]]";
	}
}

if(!empty($_GET['action']))
{
	if($_GET['action'] == "upload")
	{
		if(isset($_FILES[0]) && $_POST['id'])
		{
			for($i=0; $i < count($_FILES); $i++)
    		{
    			if(!is_dir("../images/".$_POST['id']."/"))
				{
					mkdir("../images/".$_POST['id']."/");
				}
				
				if(!empty($_FILES[$i]["tmp_name"]))
				{
					uploadFile($_FILES[$i]);
				}
			}
		}
	}
}

$db->close();

function uploadFile($pFile)
{
	$check = getimagesize($pFile["tmp_name"]);
	
	if($check !== false) {
		$moveResult = move_uploaded_file($pFile['tmp_name'], "../images/".$_POST['id']."/".$pFile['name']);
		
		if ($moveResult == true) {
			echo "";
		} else {
			echo "1";
		}
	}
}

function getFiles($pPath)
{
	global $homepage;
	
	$files = scandir('..'.$pPath);
	
	$lReturn = "[";
	
	foreach ($files as $file)
	{
		if($file != '..' && $file != '.')
		{
			$lReturn .= '['.json_encode($homepage.$pPath.$file).'],';
		}
	};
	
	$lReturn .= "[]]";
	
	return str_replace(",[]", "", $lReturn);
}

?>