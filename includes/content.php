<?php

	function getContent($pId)
	{
		global $database, $db;
		
		$lReturn = '';
		
		$sql = "SELECT `id`, `name`, `content`, `upper` FROM ".$database['PRAEFIX']."contents WHERE `id`=?";
		
		$stmt = $db->prepare($sql);
		
		if($stmt === false) {
			trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
		}
		
		$stmt->bind_param('i', $pId);
		$stmt->execute();
		$res = $stmt->get_result();
		
		while($row = $res->fetch_array(MYSQLI_ASSOC)) {
			$lReturn['id'] = $row['id'];
			$lReturn['name'] = $row['name'];
			$lReturn['content'] = $row['content'];
		}
		
		return $lReturn;
	}
	
	function getContentByAlias($pAlias)
	{
		global $database, $db;
		
		$lReturn = '';
		
		$sql = "SELECT `id`, `name`, `content`, `upper` FROM ".$database['PRAEFIX']."contents WHERE `name`=? AND `upper`='0' LIMIT 0,1";
		
		$stmt = $db->prepare($sql);
		
		if($stmt === false) {
			trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
		}
		
		$stmt->bind_param('s', $pAlias);
		$stmt->execute();
		$res = $stmt->get_result();
		
		while($row = $res->fetch_array(MYSQLI_ASSOC)) {
			$lReturn['content'] = $row['content'];
			$lReturn['name'] = $row['name'];
			$lReturn['id'] = $row['id'];
		}
		
		return $lReturn;
	}
	
	function getUpperAliasByAlias($pAlias)
	{
		global $database, $db;
		
		
		// Get Upper Content
		$sql = "SELECT `id`,`upper` FROM ".$database['PRAEFIX']."contents WHERE `name`=?";
		
		$stmt = $db->prepare($sql);
		
		if($stmt === false) {
			trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
		}
		
		$stmt->bind_param('s', $pAlias);
		$stmt->execute();
		$res = $stmt->get_result();
		
		$lReturn;
		$i = 0;
		
		while($row = $res->fetch_array(MYSQLI_ASSOC)) {
			
			$stop = false;
			
			$lReturn[$i] = array($row['id'], '/'.getUpperStringById($pAlias, $row['upper']));
			
			$i++;
		}
		$stmt->fetch();
		$stmt->close();
		
		return $lReturn;
	}
	
	function getUpperAliasIdById($pId)
	{
		global $database, $db;
		
		// Get Upper Name
		$sql = "SELECT `upper`,`name` FROM ".$database['PRAEFIX']."contents WHERE `id`=? LIMIT 0,1";
		
		$stmt = $db->prepare($sql);
		
		if($stmt === false) {
			trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
		}
		
		$stmt->bind_param('i', $pId);
		$stmt->execute();
		$stmt->bind_result($id, $alias);
		$stmt->fetch();
		$stmt->close();
		
		$lReturn = array($id, $alias);
		return $lReturn;
	}
	
	function getUpperStringById($pString, $pUpper)
	{
		$upper = getUpperAliasIdById($pUpper);
		
		if($upper[0] != $pUpper)
		{
			$pString = $upper[1].'/'.$pString;
			
			$pString = getUpperStringById($pString, $upper[0]);
		}
		
		return $pString;
	}
	
	function getMenu($pId, $pUpper=0)
	{
		global $database, $db;
		
		// Get Upper Content
		$sql = "SELECT `id`,`name` FROM ".$database['PRAEFIX']."contents WHERE `upper`=? AND `hidden`='0'";
		
		$stmt = $db->prepare($sql);
		
		if($stmt === false) {
			trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $stmt->errno . ' ' . $stmt->error, E_USER_ERROR);
		}
		
		$stmt->bind_param('i', $pUpper);
		$stmt->execute();
		$res = $stmt->get_result();
		
		$lReturn = '<ul>';
		
		while($row = $res->fetch_array(MYSQLI_ASSOC)) {
			$lReturn .= '<li>';
			
			if($pId == $row['id'])
			{
				$lReturn .= '<a href="index.php?id='.$row['id'].'" class="active">';
			}
			else
			{
				$lReturn .= '<a href="index.php?id='.$row['id'].'">';
			}
			
			$lReturn .= $row['name'];
			$lReturn .= '</a>';
			
			$lReturn .= getMenu($pId, $row['id']);
			
			$lReturn .= '</li>';
		}
		$lReturn .= '</ul>';
		
		$stmt->fetch();
		$stmt->close();
		
		return $lReturn;
	}
	
	function getHead($pId)
	{
		return '<title>' . TITLE . '</title>';
	}
?>