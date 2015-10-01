<?php

require_once 'database.php';

$praefix = $database['PRAEFIX'];

	$sql="CREATE TABLE IF NOT EXISTS ".$praefix."contents
		(`id` int(255) NOT NULL auto_increment,
		`name` varchar(50) NOT NULL,
		`content` text NOT NULL,
		`upper` int(255) DEFAULT '0',
		`hidden` = tinyint(1) DEFAULT '0',
		PRIMARY KEY (`id`))
		CHARACTER SET=utf8;";
	
	if ($db->query($sql) === TRUE) {
		printf("Table contents successfully created.\n");
	}
	else
	{
		printf($db->error);
	}
	
	$sql="CREATE TABLE IF NOT EXISTS ".$praefix."user
		(`id` int(255) NOT NULL auto_increment,
		`username` varchar(50) NOT NULL,
		`password` text NOT NULL,
		`email` varchar(100) NOT NULL,
		`level` int(1) DEFAULT '0',
		PRIMARY KEY (`id`))
		CHARACTER SET=utf8;";
	
	if ($db->query($sql) === TRUE) {
		printf("Table contents successfully created.\n");
	}
	else
	{
		printf($db->error);
	}
?>