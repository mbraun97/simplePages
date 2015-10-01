<?php
	$siteurl = BASENAME;
?>

<html>
	<head>
		<?php echo HEAD; ?>
		<link rel="stylesheet" href="<?php echo BASENAME; ?>/templates/tmp_standard/css/general.css">
	</head>
	<body>
		<section id="menubar">
			<ul>
				<li>
					<a class="menubutton" href="#menu"><img src="<?php echo BASENAME; ?>/templates/tmp_standard/images/menu.png" /></a>
				</li>
			</ul>
		</section>
		
		<header>
			<a href="<?php echo BASENAME; ?>"><h1><?php echo SITENAME; ?></h1></a>
		</header>
		
		<nav class="nav" id="menu">
			<?php echo MENU; ?>
		</nav>
		
		<section id="main">
			<article>
				<h1 id="heading"><?php echo TITLE; ?></h1>
				
				<div id="content">
					<?php echo CONTENT; ?>
				</div>
			</article>
		</section>
		
		<footer>
			<ul>
				<li>&copy; 2015 simplePages</li>
				<li>Kontakt</li>
				<li>Lizenzen</li>
			</ul>
		</footer>
	</body>
</html>