var users = null;
var levels = Array("Benutzer", "Moderator", "Administrator", "Superadministrator", "Root");
var setListener; //Intervall zum testen der beritschaft des editors

function openHome() // Home-Reiter öffnen
{	
	deleteContent();
	setTitle('Kontrollzentrum');
	
	var icon1 = jQuery('<img/>', {
	    src: 'images/icons/document.png'
	});
	var link1 = jQuery('<a/>', {
	    href: '#contents',
	    class: 'icon'
	}).append(icon1).appendTo('#content');
	
	
	var icon2 = jQuery('<img/>', {
	    src: 'images/icons/user.png'
	});
	var link2 = jQuery('<a/>', {
	    href: '#user',
	    class: 'icon'
	}).append(icon2).appendTo('#content');
}

function openContents() // beitragsreiter öffnen
{
	deleteContent();
	setTitle('Beiträge');
	
	if(contents != null)
	{
		loadContents();
	}
	else
	{
		showLoading();
		
		changeContent = loadContents;
		
		$.ajax('content.php', {
		    data: {
		        view: 'all'
		    }
		})
		.then(
		    function success(content) {
		        contents = JSON.parse(content);
		        
		        changeContent();
		    },
		
		    function fail(data, status) {
		        alert('Request failed.  Returned status of ' + status);
		    }
		);
	}
}

var loadContents = function ()  // Ajax verarbeitung und Unterdrückung || Beiträge verarbeiten
{
	hideLoading();
	
	$('#content').html('<div class="controls"><img onclick="reloadContents()" src="images/icons/ldpi/refresh.png"></div>');
	
	addControl('images/icons/ldpi/refresh.png', 'Aktualisieren', reloadContents);
	addControl('images/icons/ldpi/plus.png', 'Neuer Beitrag', createNewContent);
	
	var div = jQuery('<div/>', {}).appendTo('#content');
	
	arrayToString = arrayToStringContents;
	div.html(arrayToList(contents, 'openId', 'contents'));
};

function arrayToList(pArray, pFunction, pClassName) // Input Array zu Liste
{
	if(pClassName != null)
	{
		var lReturn = '<ul class="'+pClassName+'">';
	}
	else
	{
		var lReturn = '';
	}
	
	for(var i=0; i<pArray.length; i++)
	{
		
		if($.isArray(pArray[i][0]))
		{
			if(!$.isArray(pArray[i][0][0]))
			{
				//lReturn += '<li><p>'+pArray[i][0][0]+'</p><p>'+pArray[i][0][1]+'</p><p>'+pArray[i][0][2]+'</p><p>'+pArray[i][0][3]+'</p></li>';
				lReturn += arrayToString(pArray[i][0], pFunction);
				lReturn += '<ul>'+arrayToList(pArray[i][1], pFunction)+'</ul>';
			}
			else
			{
				lReturn += '<ul>'+arrayToList(pArray[i], pFunction)+'</ul>';
			}
		}
		else
		{
			lReturn += arrayToString(pArray[i], pFunction);
		}
	}
	
	if(pClassName != null)
	{
		lReturn += '</ul>';
	}
	
	return lReturn;
}

var arrayToString = function() {};

var arrayToStringContents = function (pArray, pFunction) // Array aus Liste zu String parsen
{
	var lReturn = '<li draggable="true" id="'+pFunction+pArray[3]+'" onclick="'+pFunction+'(\''+pArray[3]+'\')">';
	lReturn += '<p>'+pArray[0]+'</p>';
	lReturn += '<p>'+pArray[1]+'</p>';
	lReturn += '<p>'+pArray[2]+'</p>';
	
	lReturn += '<p>';
	
	if(pArray[4] == 0)
	{
		lReturn += '<img src="images/icons/ldpi/eye.png" alt="Beitrag ausblenden" title="Beitrag ausblenden" onclick="hideContent(event, \''+pArray[3]+'\', 0)" />';
	}
	else
	{
		lReturn += '<img src="images/icons/ldpi/eye-outline.png" alt="Beitrag anzeigen" title="Beitrag anzeigen" onclick="hideContent(event, \''+pArray[3]+'\', 1)" />';
	}
	
	
	lReturn += '<img src="images/icons/ldpi/delete.png" onclick="deleteContentAlert(event, \''+pArray[3]+'\')" />';
	lReturn += '</p>';
	
	lReturn += '</li>';
	
	return lReturn;
};

var arrayToStringUsers = function (pArray, pFunction) // Array aus Liste zu String parsen
{
	var lReturn = '<li draggable="true" id="'+pFunction+pArray[0]+'" onclick="'+pFunction+'(\''+pArray[0]+'\')">';
	lReturn += '<p>'+pArray[1]+'</p>';
	//lReturn += '<p>'+pArray[1]+'</p>';
	//lReturn += '<p>'+pArray[2]+'</p>';
	
	lReturn += '<p>';
	lReturn += '<img src="images/icons/ldpi/delete.png" onclick="deleteUserAlert(event, \''+pArray[0]+'\')" />';
	lReturn += '</p>';
	
	lReturn += '</li>';
	
	return lReturn;
};

function hideContent(event, pId, pHidden)
{
	if(event != null)
	{
		prevent(event);
	}
	
	showLoading();
	
	if(pHidden == 0)
	{
		$.ajax('content.php?action=hide', {
			data: {
				id: pId
			}
		}).then(
			function success(pContent) {
				hideLoading();
				
				if(pContent == '1')
				{
					contents = null;
					hashchanged();
				}
			},
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	}
	else
	{
		$.ajax('content.php?action=show&id='+pId, {
		}).then(
			function success(pContent) {
				hideLoading();
				
				if(pContent == '1')
				{
					contents = null;
					hashchanged();
				}
			},
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	}
}

function deleteContentAlert(event, pId)
{
	if(event != null)
	{
		prevent(event);
	}
	
	var html = '<form id="deleteContentAlert" action="content.php?action=delete&id='+pId+'" method="POST">';
		html += '<h2>Soll der Beitrag wirklich gelöscht werden?</h2>';
		html += '<label><input type="checkbox" name="delete" value="true">Ja, den Beitrag wirklich löschen</label><br /><br />';
		html += '<right><input type="submit" name="delete" value="Ja">&nbsp;&nbsp;<input type="button" value="Nein" onclick="closeLightbox()"></right>';
		html += '</form>';
	
	openLightbox(html);
	
	$('#deleteContentAlert').submit(function(event) {
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
				if(pContent == "1" || pContent == "2")
				{
					hideLoading();
					closeLightbox();
					reloadContents();
				}
				else
				{
					openAlertLightbox("Es ist ein Fehler bei ihrer Anfrage aufgetreten.");
					hideLoading();
				}
			},
			
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	});
}

function openContent(pId) // Content vom Server anfragen
{
	deleteContent();
	
	showLoading();
	
	changeContent = loadedContent; // changeContent mit endfunktion beschreiben
	
	$.ajax('content.php', {
	    data: {
	        view: pId
	    }
	})
	.then(
	    function success(pContent) {
	        var content = JSON.parse(pContent);
	        
	        changeContent(content);
	    },
	
	    function fail(data, status) {
	        alert('Request failed.  Returned status of ' + status);
	    }
	);
}

var loadedContent = function (pArray) // Content vom Server verarbeiten
{
	hideLoading();
	
	addControl('images/icons/ldpi/tick.png', 'Speichern', function() {$('#contentForm').submit();});
	addControl('images/icons/ldpi/cancel.png', 'Schließen', function() {window.location.hash='#contents';});
	addControl('images/icons/ldpi/delete.png', 'Löschen', function() {deleteContentAlert(null, pArray['id']);});
	
	if(pArray['hidden'] == '0')
	{
		addControl('images/icons/ldpi/eye.png', 'Beitrag ausblenden', function() {hideContent(null, pArray['id'], 0);});
	}
	else
	{
		addControl('images/icons/ldpi/eye-outline.png', 'Beitrag anzeigen', function() {hideContent(null, pArray['id'], 1);});
	}
	
	var id = pArray['id'];
	var upper = pArray['upper'];
	
	
	
	if(upper == 0 || upper == null || upper == "null")
	{
		addInfo('Übergeordnet', 'kein übergeordneter Beitrag', function () { selectUpperWindow(id, upper); });
	}
	else
	{
		addInfo('Übergeordnet', pArray['uppername'], function () { selectUpperWindow(id, upper); });
	}
	
	var html = '<form id="contentForm" action="content.php?action=change" method="post">';
	
		html += '<div class="contentSettings">';
		html += '<p><label for="name">Beitragsname</label><input type="text" id="name" name="name" maxlength="50" value="'+pArray['name']+'"></input></p>';
		html += '<input type="hidden" name="id" value="'+pArray['id']+'"></input>';
		html += '</div>';
		
		html += '<textarea name="content" id="mytextarea">'+pArray['content']+'</textarea>';
		html += '<input value="Bild einfügen" type="button" onclick="openImageDialog('+pArray['id']+')"><br/><br /><br /><input value="Schließen" type="button" onclick="window.location.hash=\'#contents\'"><input value="Speichern" type="submit"></input>';
		html += '</form>';
	
	$('#content').html(html);
	
	lastTextarea = "mytextarea";
	
	initEditor("mytextarea");
	
	window.setTimeout(function () {setIframeListener();}, 1000);
	
	$("#contentForm").submit(function(event) {
		event.preventDefault();
		
		$('#'+lastTextarea).val(tinyMCE.get(lastTextarea).getContent());
		
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
				if(pContent == "1" || pContent == "0")
				{
					hideLoading();
					window.location.hash = '#contents';
				}
				else
				{
					openAlertLightbox("Es ist ein Fehler bei ihrer Anfrage aufgetreten.");
					hideLoading();
				}
			},
			
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	});
	
	setTitle("Beitrag bearbeiten");
};

var files2;

// Grab the files and set them to our variable
function prepareUpload(event)
{
	files2 = event.target.files;
}


function openImageDialog(pId)  // Bilder auswählen Dialog öffnen
{
	var html = '<h2>Wählen sie bitte ein Bild aus</h2>';
		html += '<form action="files.php?action=upload" method="POST" enctype="multipart/form-data" id="imageUploader">';
		html += '<input type="button" value="Dieser Beitrag" onclick="openImagesDialog('+pId+')"></input>';
		html += '<input type="button" value="Anderer Beitrag" onclick="openImagesDialogContents()"></input>';
		html += '<ul class="loading"><li> </li><li> </li><li> </li><li> </li><li> </li></ul>';
		html += '<div id="imagePicker"></div>';
		html += '<div id="imageContentPicker"></div>';
		html += '<input type="hidden" name="id" value="'+pId+'">';
		html += '<input type="button" value="Bilder einfügen" onclick="insertImages()">';
		html += '</form>';
		
	openLightbox(html);
	
	
	
	$("#imageUploader").submit(function(event) {
		event.preventDefault();
    
		var form = $(this);
		var action = form.attr("action"),
			method = form.attr("method");
			
		var data = new FormData();
			
		$.each(files2, function(key, value)
		{
		    data.append(key, value);
		});
		
		data.append('id', pId);
        
        showLoading();
        
		$.ajax({
			url : action,
			type : method,
        	data: data,
        	cache: false,
        	//dataType: 'json',
        	processData: false, // Don't process the files
        	contentType: false // Set content type to false as jQuery will tell the server its a query string request
			/*xhr: function(){
		        // get the native XmlHttpRequest object
		        var xhr = $.ajaxSettings.xhr() ;
		        // set the onprogress event handler
		        xhr.upload.onprogress = function(evt){ console.log('progress', evt.loaded/evt.total*100) } ;
		        // return the customized object
		        return xhr ;
		    }*/
		}).then(
			function success(pContent) {
				if(pContent == "")
				{
					hideLoading();
					openImagesDialog(pId);
				}
				else
				{
					openAlertLightbox("Es ist ein Fehler bei ihrer Anfrage aufgetreten.");
					hideLoading();
				}
			},
			
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	});
	
	$('.lightbox .lightboxContent').height('600px');
	
	openImagesDialog(pId);
}

function openImagesDialogContents()
{
	$('#imagePicker').html('');
	
	if(contents != null)
	{
		$('#imageContentPicker').html(arrayToList(contents, 'openImagesDialog', 'contents selectContent'));
	}
	else
	{
		showLoading();
		arrayToString = arrayToStringContents;
		
		$.ajax('content.php', {
		    data: {
		        view: 'all'
		    }
		})
		.then(
		    function success(pContent) {
		        contents = JSON.parse(pContent);
		        hideLoading();
		        
		        $('#imageContentPicker').html(arrayToList(contents, 'openImagesDialog', 'contents selectContent'));
		    },
		
		    function fail(data, status) {
		        alert('Request failed.  Returned status of ' + status);
		    }
		);
	}
}

var changeImagesDialog = function (content)
{
	hideLoading();
	
	if(content == "[[]]")
	{
		var image = jQuery('<b/>', {
			text: "Keine Bilder verfügbar"
		}).appendTo('#imagePicker');
	}
	else
	{
		files = JSON.parse(content);
		$('#imagePicker').html('');
		
		for(var i =0; i < files.length; i++)
		{
			var image = jQuery('<img/>', {
				src: files[i][0],
				class: "imageTile"
			}).click(function() {$(this).toggleClass('active');}).appendTo('#imagePicker');
		}
	}

	var controls = jQuery('<right/>', {
		}).appendTo('#imagePicker');

	var input1 = jQuery('<input/>', {
			name: "FileInput[]",
			id: "FileInput", 
			type: "file",
			multiple: "multiple",
			accept: "image/jpeg, image/png, image/gif"
		}).on('change', prepareUpload).appendTo(controls);
		
	var input2 = jQuery('<input/>', {
			type: "submit",
			id: "submit-btn", 
			value: "upload"
		}).appendTo(controls);
};

function openImagesDialog(pId)
{
	$('#imageContentPicker').html('');
	
	changeContent = changeImagesDialog;
	showLoading();
	
	$.ajax('files.php', {
		data: {
			view: pId
		}
	}).then(
		function success(content) {
			changeContent(content);
		},
		function fail(data, status) {
			alert('Request failed.  Returned status of ' + status);
		}
	);
}

function insertImages()
{
	$('#imagePicker .active').each( function( index, element ){
    	var source = $(this).attr('src');
    	tinyMCE.execCommand('mceInsertContent',false,'<img src="'+source+'" width="500px"></img>');
	});
	
	closeLightbox();
}

function openId(pId) // Id aus Listen öffnen/auswählen
{
	window.location.hash = '#contents?id='+pId;
}

function openUsers() // User-Reiter öffnen
{
	deleteContent();
	setTitle('Benutzer');
	
	if(users != null)
	{
		loadUsers();
	}
	else
	{
		showLoading();
		
		changeContent = loadUsers;
		
		$.ajax('users.php', {
		    data: {
		        view: 'all'
		    }
		})
		.then(
		    function success(content) {
		        users = JSON.parse(content);
		        
		        changeContent();
		        hideLoading();
		    },
		
		    function fail(data, status) {
		        alert('Request failed.  Returned status of ' + status);
		    }
		);
	}
}

var loadUsers = function () {
	$('#content').html('<div class="controls"><img onclick="reloadUsers()" src="images/icons/ldpi/refresh.png"></div>');
	
	addControl('images/icons/ldpi/refresh.png', 'Aktualisieren', reloadUsers);
	addControl('images/icons/ldpi/plus.png', 'Neuer Benutzer', createNewUser);
	
	var div = jQuery('<div/>', {}).appendTo('#content');
	
	arrayToString = arrayToStringUsers;
	div.html(arrayToList(users, 'openUserId', 'contents'));
};

var reloadUsers = function ()
{
	users = null;
	openUsers();
};

function openUserId(pId)
{
	window.location.hash = '#user?id='+pId;
}

var createNewUser = function()
{
	var html = '<h2>Neuer Benutzer</h2>';
		html += '<form action="users.php?action=create" method="post" id="createNewUser">';
		html += '<label>Benutzername:&nbsp;&nbsp;<input name="username" type="text" maxlength="50" required="required"/></label><br /><br />';
		html += '<label>E-Mail Addresse:&nbsp;&nbsp;<input name="email" type="email" maxlength="100" required="required"/></label><br /><br />';
		html += '<label>Kennwort:&nbsp;&nbsp;<input name="password1" type="password" maxlength="50" required="required"/></label><br /><br />';
		html += '<label>Kennwort wiederholen:&nbsp;&nbsp;<input name="password2" type="password" maxlength="50" required="required"/></label>';
		html += '<ul class="loading"><li> </li><li> </li><li> </li><li> </li><li> </li></ul>';
		html += '<br /><center><input type="submit" value="Benutzer erstellen">&nbsp;&nbsp;<input type="button" value="Abbrechen" onclick="closeLightbox()"></center>';
		html += '</form>';

	openLightbox(html);
	
	$('#createNewUser').submit(function(event) {
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
				if(pContent == "1" || pContent == "0" || pContent == "01")
				{
					hideLoading();
					closeLightbox();
					reloadUsers();
				}
				else if(pContent == "user exists")
				{
					openAlertLightbox("Ein Benutzer mit dem Benutzernamen existiert bereits.");
					hideLoading();
				}
				else if(pContent == "passwords do not match")
				{
					openAlertLightbox("Die Passwörter sind nicht nicht identisch.");
					hideLoading();
				}
				else
				{
					openAlertLightbox("Es ist ein Fehler bei ihrer Anfrage aufgetreten.");
					hideLoading();
				}
			},
			
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	});
};

function deleteUserAlert(event, pId)
{
	if(event != null)
	{
		prevent(event);
	}
	
	var html = '<form id="deleteContentAlert" action="users.php?action=delete&id='+pId+'" method="POST">';
		html += '<h2>Soll der Benutzer wirklich gelöscht werden?</h2>';
		html += '<label><input type="checkbox" name="delete" value="true">Ja, den Benutzer wirklich löschen</label><br /><br />';
		html += '<right><input type="submit" name="delete" value="Ja">&nbsp;&nbsp;<input type="button" value="Nein" onclick="closeLightbox()"></right>';
		html += '</form>';
	
	openLightbox(html);
	
	$('#deleteContentAlert').submit(function(event) {
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
				if(pContent == "1" || pContent == "2")
				{
					hideLoading();
					closeLightbox();
					reloadUsers();
				}
				else
				{
					openAlertLightbox("Es ist ein Fehler bei ihrer Anfrage aufgetreten.");
					hideLoading();
				}
			},
			
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	});
}

function openUser(pId) // Content vom Server anfragen
{
	deleteContent();
	
	showLoading();
	
	changeContent = loadedUser; // changeContent mit endfunktion beschreiben
	
	$.ajax('users.php', {
	    data: {
	        view: pId
	    }
	})
	.then(
	    function success(pContent) {
	        var content = JSON.parse(pContent);
	        
	        changeContent(content);
	    },
	
	    function fail(data, status) {
	        alert('Request failed.  Returned status of ' + status);
	    }
	);
}

var loadedUser = function (pArray) // Content vom Server verarbeiten
{
	hideLoading();
	
	addControl('images/icons/ldpi/tick.png', 'Speichern', function() {$('#contentForm').submit();});
	
	var html = '<form id="contentForm" action="users.php?action=change" method="post">';
	
		html += '<div class="contentSettings">';
		html += '<p><label for="username">Benutzername</label><input type="text" id="username" name="username" maxlength="50" value="'+pArray['username']+'"></input></p>';
		html += '<p><label for="email">E-Mail Addresse</label><input type="text" id="email" name="email" maxlength="50" value="'+pArray['email']+'"></input></p>';
		html += '<input type="hidden" name="id" value="'+pArray['id']+'"></input>';
		html += '</div>';
		
		html += '<p><label for="level">Zugriffslevel</label><select name="level" id="level" size="1">';
		for(var i=0; i < 5; i++)
		{
			if(i == pArray['level'])
			{
				html += '<option value="'+i+'" selected="selected">'+levels[i]+'</option>';
			}
			else
			{
				html += '<option value="'+i+'">'+levels[i]+'</option>';
			}
		}
		html += '</select></p>';
		html += '<br/><br /><br /><input value="senden" type="submit"></input>';
		html += '</form>';
	
	$('#content').html(html);
	
	$("#contentForm").submit(function(event) {
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
				if(pContent == "1" || pContent == "0")
				{
					hideLoading();
					window.location.hash = '#users';
				}
				else
				{
					openAlertLightbox("Es ist ein Fehler bei ihrer Anfrage aufgetreten.");
					hideLoading();
				}
			},
			
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	});
	
	setTitle("Benutzer bearbeiten");
};

function deleteContent() // Inhalt des Content-Bereichs löschen
{
	if(lastTextarea != null)
	{
		tinymce.EditorManager.execCommand('mceRemoveEditor',true, lastTextarea);
		lastTextarea = null;
	}
	
	$('#actions').html('');
	$('#infos').html('');
	
	if(changeContent != null)
	{
		changeContent = function () {}; // changeContent leeren um Ajax Abfragen zu löschen
	}
	
	$('#content').html('');
}

var createNewContent = function()
{
	var html = '<h2>Neuer Beitrag</h2>';
		html += '<form action="content.php?action=create" method="post" id="createNewContent">';
		html += '<label>Beitragsname:&nbsp;&nbsp;<input name="name" type="text" maxlength="50" required="required"/><br /><br /><input id="upper" name="upper" type="hidden" /></label>';
		html += '<div>'+arrayToList(contents, 'selectUpper', 'contents selectContent')+'</div>';
		html += '<ul class="loading"><li> </li><li> </li><li> </li><li> </li><li> </li></ul>';
		html += '<br /><center><input type="submit" value="Beitrag erstellen">&nbsp;&nbsp;<input type="button" value="Abbrechen" onclick="closeLightbox()"></center>';
		html += '</form>';

	openLightbox(html);
	
	$('#createNewContent').submit(function(event) {
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
				if(pContent == "1" || pContent == "0" || pContent == "01")
				{
					hideLoading();
					closeLightbox();
					reloadContents();
				}
				else
				{
					openAlertLightbox("Es ist ein Fehler bei ihrer Anfrage aufgetreten.");
					hideLoading();
				}
			},
			
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	});
};


var selectUpperWindow = function(id, upper)
{
	var html = '<h2>Übergeordneten Beitrag auswählen</h2>';
		html += '<form action="content.php?action=selectUpper&id='+id+'" method="post" id="createNewContent">';
		html += '<input id="upper" name="upper" type="hidden" />';
		html += '<div id="selectUpperContent"></div>';
		html += '<ul class="loading"><li> </li><li> </li><li> </li><li> </li><li> </li></ul>';
		html += '<br /><center><input type="submit" value="Ändern">&nbsp;&nbsp;<input type="button" value="Abbrechen" onclick="closeLightbox()"></center>';
		html += '</form>';

	openLightbox(html);
	
	if(contents != null)
	{
		$('#selectUpperContent').html(arrayToList(contents, 'selectUpper', 'contents selectContent'));
		selectUpper(upper);
	}
	else
	{
		showLoading();
		arrayToString = arrayToStringContents;
		
		$.ajax('content.php', {
		    data: {
		        view: 'all'
		    }
		})
		.then(
		    function success(pContent) {
		        contents = JSON.parse(pContent);
		        hideLoading();
		        
		        $('#selectUpperContent').html(arrayToList(contents, 'selectUpper', 'contents selectContent'));
		        selectUpper(upper);
		    },
		
		    function fail(data, status) {
		        alert('Request failed.  Returned status of ' + status);
		    }
		);
	}
	
	$('#createNewContent').submit(function(event) {
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
				if(pContent == "1" || pContent == "0" || pContent == "01")
				{
					hideLoading();
					closeLightbox();
					hashchanged();
					contents = null;
				}
				else
				{
					openAlertLightbox("Es ist ein Fehler bei ihrer Anfrage aufgetreten.");
					hideLoading();
				}
			},
			
			function fail(data, status) {
				alert('Request failed.  Returned status of ' + status);
			}
		);
	});
};

var reloadContents = function ()
{
	contents = null;
	openContents();
};

function selectUpper(pId)
{
	$('.contents.selectContent li').removeClass('active');
	
	if($('#upper').val() == pId)
	{
		$('#upper').val('');
	}
	else
	{
		$('#upper').val(pId);
		$('.contents.selectContent #selectUpper'+pId).addClass('active');
	}
}

function addControl(pImg, pText, pAction)
{
	var li = jQuery('<li/>', {
		html: '<img src="'+pImg+'" />'+pText
	}).click(pAction);
	//list-style-image:
	
	$('#actions').append(li);
}

function addInfo(pText, pValue, pAction)
{
	var li = jQuery('<li/>', {
		html: pText+':'+pValue
	}).click(pAction);
	//list-style-image:
	
	$('#infos').append(li);
}

//Listeners
function setIframeListener()
{
	if(lastTextarea != null && document.getElementById(lastTextarea+'_ifr') != null)
	{
		var windowElement = document.getElementById('mytextarea_ifr').contentWindow.document;
		
		windowElement.onkeydown = checkPressed;
	}
	else
	{
		window.setTimeout(function () {setIframeListener();}, 1000);
	}
}

$(window).keypress(function (event) //keypress des Fensters abfangen
{
	if (!(event.which == 115 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) && !(event.which == 19))
	{
		return true;
	}
	else
	{
		event.preventDefault();
    	return false;
   	}
});

var checkPressed = function (event) //keypress des Fensters abfangen
{
	if (event.which == 83 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey))
	{
		event.preventDefault();
		
		if(lastTextarea != null)
		{
			$('#contentForm').submit();
		}
		
		return false;
	}
};

$(document).keydown(checkPressed);
