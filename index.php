<?php
	require_once 'administrator/includes/database.php';
	require_once 'administrator/config/configuration.php';
	require_once 'includes/content.php';
	
	// Komprimiere Datei
	if($conf['gzip'])
	{
		if(extension_loaded("zlib") AND strstr($_SERVER["HTTP_ACCEPT_ENCODING"],"gzip"))
		@ob_start("ob_gzhandler");
		header('Vary: Accept Encoding');
	}
	
	// Cache Datei
	if($conf['cache'])
	{
		if(file_exists('cache' . $_SERVER['PHP_SELF'] . '+' . $_SERVER['QUERY_STRING'] . '.html')
			&& time()-filemtime('cache' . $_SERVER['PHP_SELF'] . '+' . $_SERVER['QUERY_STRING'] . '.html')<24*3600)
		{
			echo file_get_contents('cache' . $_SERVER['PHP_SELF'] . '+' . $_SERVER['QUERY_STRING'] . '.html');
			exit();
		}
		
		ob_start();
	}
	
	$id = 0; // ID des Beitrags
	
	if(empty($_GET['id']))
	{
		if(!empty($_SERVER['PATH_INFO']))
		{
			$pathinfo = explode("/", $_SERVER['PATH_INFO']);
			
			if(empty($pathinfo[0]))
			{
				$pathinfonew;
				
				for($i = 1; $i < count($pathinfo); $i++)
				{
					$pathinfonew[$i-1] = $pathinfo[$i];
				}
				
				$pathinfo = $pathinfonew;
			}
			
			if(empty($pathinfo[count($pathinfo)-1]))
			{
				unset($pathinfo[count($pathinfo)-1]);
			}
			
			if(count($pathinfo) == 1)
			{
				if($pathinfo[0] > 0)
				{
					$content = getContent($pathinfo[0]);
				}
				else
				{
					$content = getContentByAlias($pathinfo[0]);
				}
			}
			else if(count($pathinfo) == 0)
			{
				$content = getContent('1');
			}
			else
			{
				$arrays = getUpperAliasByAlias($pathinfo[count($pathinfo)-1]);
				
				foreach($arrays as $array)
				{
					if($array[1] == $_SERVER['PATH_INFO'])
					{
						$content = getContent($array[0]);
					}
				}
			}
		}
		else
		{
			$content = getContent(1);
		}
	}
	else
	{
		$content = getContent($_GET['id']);
	}
	
	define("CONTENT", $content['content']);
	define("MENU", getMenu($content['id']));
	define("TITLE", $content['name']);
	define("HEAD", getHead($content['id']));
	define("SITENAME", $conf['SITENAME']);
	define("BASENAME", 'http://'.dirname($_SERVER['SERVER_NAME'] . $_SERVER['PHP_SELF']));
	
	require('templates/tmp_standard/index.php');

	if($conf['cache'])
	{
		$content = ob_get_clean();
		
		if(!is_dir('cache'))
		{
			mkdir('cache');
		}
		
		if(!empty($id))
		{
			$fh = fopen('cache' . $_SERVER['PHP_SELF'] . '+' . $_SERVER['QUERY_STRING'] . '.html',"w");
			fputs($fh, $content);
			fclose($fh);
		}
		
		echo $content;
	}
	
	$db->close();
?>