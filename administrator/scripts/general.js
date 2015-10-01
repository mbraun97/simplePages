// Variables
var topSize; //Size before scrolling

var lastTextarea = null;
var contents = null;
var changeContent;

// Adding Listener
jQuery(window).resize(checkSizes);

$(document).ready(function() {
	
	$('.menubutton').click(function () {
		$('nav').slideToggle('slow');
	});
	
	checkSizes();
	
	login();
});

$(document).scroll(function() {
	var currentScroll = $(window).scrollTop();
	
	if(currentScroll > topSize+1)
	{
		$('nav').addClass("fixed");
	}
	else if(currentScroll < topSize-1)
	{
		$('nav').removeClass("fixed");
	}
});

function login()
{
	openLightbox('<h2>Anmeldung am Server</h2>');
	disableLightboxClose();
	
	
	$.ajax('login.php', {
	    data: {
	        action: "isLoggedIn"
	    }
	})
	.then(
	    function success(pContent) {
	        //var content = JSON.parse(pContent);
	        
	        if(pContent == "logged in")
	        {
	        	getLoginScripts();
	        }
	        else
	        {
	        	showLogin();
	        }
	    },
	
	    function fail(data, status) {
	        alert('Request failed.  Returned status of ' + status);
	    }
	);
	
	//getLoginScripts();
}

function showLogin()
{
	var html = '<form id="login" action="login.php?action=login" method="POST">';
		html += '<h2>Anmeldung</h2>';
		html += '<label for="loginUsername">Benutzername:<br /><input id="loginUsername" type="text" name="username" maxlength="50"></label><br /><br />';
		html += '<label for="loginPassword">Kennwort:<br /><input id="loginPassword" type="password" name="password" maxlength="50"></label><br /><br /><br />';
		html += '<input type="submit" value="Anmelden">';
		html += '</form>';
	
	changeLightbox(html);
	
	$('#login').submit(function(event) {
		event.preventDefault();
    
		var form = $(this);
		var action = form.attr("action"),
			method = form.attr("method"),
			data   = form.serialize(); // baut die Daten zu einem String nach dem Muster vorname=max&nachname=Müller&alter=42 ... zusammen
        
        showLoading();
        
		$.ajax({
			url : action,
			type : method,
			data : data
		}).then(
			function success(pContent) {
				if(pContent == "logged in")
				{
					hideLoading();
					closeLightbox();
					getLoginScripts();
				}
				else if(pContent == "false user")
				{
					openAlertLightbox("Der Benutzername oder das Kennwort sind falsch.");
					hideLoading();
				}
			},
			
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	});
}

function getLoginScripts()
{
	$.getScript("scripts/general.php")
	.done(function( script, textStatus ) {
		$(window).bind('hashchange', hashchanged);
		hashchanged();
		
		closeLightbox();
	})
	.fail(function( jqxhr, settings, exception ) {
		
	});
}

function hashchanged() // Listener für Änderung des hashs
{
	//var hash = location.hash.replace( /^#/, '' );
	
	var anchor = document.location.hash;
	var variables = getGetVariables(anchor);
	
	$('nav a').removeClass("active");
	
	if(anchor.indexOf('home') != -1 || anchor == '')
	{
		$('nav a[href*="#home"]').addClass("active");
		openHome();
	}
	else if(anchor.indexOf('contents') != -1)
	{
		$('nav a[href*="#contents"]').addClass("active");
		
		if(variables['id'] != null)
		{
			openContent(variables['id']);
		}
		else
		{
			openContents();
		}
	}
	else if(anchor.indexOf('user') != -1)
	{
		$('nav a[href*="#user"]').addClass("active");
		
		if(variables['id'] != null)
		{
			openUser(variables['id']);
		}
		else
		{
			openUsers();
		}
	}
	else if(anchor.indexOf('licence') != -1)
	{
		openLicence();
	}
}

function openLicence()
{
	setTitle('Lizenzen');
	var pHtml = '<p><b>Tiny-MCE</b>';
	pHtml += '<iframe src="scripts/tinymce/license.txt" style="width:100%; height: 500px; border: none;"></iframe>';
	pHtml += 'Quelle: <a href="http://www.tinymce.com/js/tinymce/jscripts/tiny_mce/license.txt">http://www.tinymce.com/js/tinymce/jscripts/tiny_mce/license.txt</a></p>';
	$('#content').html(pHtml);
}
