// Lightbox
function openLightbox(pHtml) // Lightbox öffnen
{
	if(!$("#lightbox").length)
	{		
		var lightboxContent = jQuery('<div/>', {
		    class: 'lightboxContent',
		    html: pHtml
		}).click(function (event) { prevent(event); });
		
		var lightbox = jQuery('<div/>', {
		    id: 'lightbox',
		    class: 'lightbox'
		}).click(closeLightbox).append(lightboxContent).appendTo('body');
	}
	else
	{
		$('#lightbox .lightboxContent').html(pHtml);
		$('#lightbox').click(closeLightbox);
	}
	
	$('#lightbox').fadeIn('medium');
	
	$('body').css('overflow', 'hidden');
}

function disableLightboxClose()
{
	$('#lightbox').prop('onclick',null).off('click');
}

function changeLightbox(pHtml)
{
	$('#lightbox .lightboxContent').html(pHtml);
}

function closeLightbox()
{
	$('body').css('overflow', 'auto');
	
	$('#lightbox').fadeOut('medium');
	window.setTimeout(function () { $('#lightbox .lightboxContent').html(''); }, 250);
}

// Lightbox-Alert
function openAlertLightbox(pMessage) // Lightbox öffnen
{
	var html = "<h2 style=\"text-align: center\">Achtung</h2>"+pMessage+"<br /><right><input type=\"button\" value=\"OK\"></right>";
	
	if(!$("#alertlightbox").length)
	{		
		var lightboxContent = jQuery('<div/>', {
		    class: 'alertlightboxContent',
		    html: html
		});
		
		var lightbox = jQuery('<div/>', {
		    id: 'alertlightbox',
		    class: 'alertlightbox'
		}).click(closeAlertLightbox).append(lightboxContent).appendTo('body');
	}
	else
	{
		$('#alertlightbox .alertlightboxContent').html(html);
		$('#alertlightbox').click(closeAlertLightbox);
	}
	
	$('#alertlightbox').fadeIn('medium');
	
	$('body').css('overflow', 'hidden');
}

function disableAlertLightboxClose()
{
	$('#alertlightbox').prop('onclick',null).off('click');
}

function closeAlertLightbox()
{
	$('body').css('overflow', 'auto');
	
	$('#alertlightbox').fadeOut('medium');
	window.setTimeout(function () { $('#alertlightbox .alertlightboxContent').html(''); }, 1000);
}


// Set Title
function setTitle(pString) // Den Titel im H2 und title Tag setzen
{
	$('#heading').html(pString);
	document.title = 'simplePages - '+pString;
}


// Loading
function showLoading()
{
	$('.loading').css('display','block');
}

function hideLoading()
{
	$('.loading').css('display','none');
}


// PREVENT
function prevent(event)
{
	event = event || window.event;
	
	if (event.stopPropagation)
	{
		event.stopPropagation(); // W3C
	}
	else
	{
		event.cancelBubble = true; // IE
	}
}

// CheckSizes
function checkSizes() // Listener für Fenstergröße
{
	topSize = $('header').outerHeight() + $('menubar').outerHeight();
}

// Get Variables
function getGetVariables(pString) // Hash Inhalt zu Array Parsen
{
	var variableInputArray = pString.split("?");
	var variables = Array();
	
	if(variableInputArray[1] != null)
	{
		var variableString = variableInputArray[1];
		
		var variableArray = variableString.split("&");
		
		for(var i=0; i < variableArray.length; i++)
		{
			var variable = variableArray[i].split("=");
			
			variables[variable[0]] = variable[1];
		}
	}
	
	return variables;
}

// TinyMCE
function initEditor(pId)
{
	tinymce.init({
		selector: '#'+pId,
		height: '500px',
		removed_menuitems: 'newdocument',
		relative_urls: false,
		convert_urls: false,
		extended_valid_elements : "script[language|type|src]",
		plugins: "code table fullscreen contextmenu searchreplace textcolor colorpicker link image imagetools hr",
		tools: "inserttable fullscreen searchreplace",
		toolbar: "undo redo | styleselect | bold italic underline forecolor | link image hr | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | searchreplace code",
		contextmenu: "link image inserttable | cell row column deletetable"
	});
}
