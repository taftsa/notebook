function startsWith(string) {
	//Upper Case Roman Numeral
	if (string[0].match(/[IVX]/)) {
		return '';
	};
  
	//Lowercase Letters
	if (string[0].match(/[a-z]/)) {
		return('&emsp;&emsp;');
	};
	
	//Arabic Numeral
	if (string[0].match(/[0-9]/)) {
		return '&emsp;';
	};
};

//Log
var shifted = false;

$(document).on('keyup keydown', function(e){shifted = e.shiftKey} );

function writeToLog(text, autoShift) {
	if (!shifted && !autoShift) {
		$('#output').empty();
	}
	$('#output').append('<div class="note">> ' + text + '</div>');
};

//Load a Source
function showSource(source, number) {
	if($("#" + number).length == 0) {
		$('body').append('<div class="source" id="' + number + '"></div>');
	
		$('#' + number).draggable();
		
		$('#' + number).append('<div class="identifier">' + source['Identifier'] + '</div>');
		$('#' + number).append('<div class="close btn">x</div>');
		$('#' + number).append('<div class="expand btn">+</div>');
		$('#' + number).append('<div class="info btn">&#9883;</div>');
		
		$('#' + number).append('<div class="class">' + source['Class'] + '</div>');
		$('#' + number).append('<div class="week">' + source['Week'] + '</div>');
		$('#' + number).append('<div class="title">' + source['Title'] + '</div>');
		$('#' + number).append('<div class="author">' + source['Author'] + '</div>');
		$('#' + number).append('<div class="topic">' + source['Topic'] + '</div>');

		$('#' + number).append('<div class="outline"></div>');
			var outline = source['Outline'].split('; ');
			var commentString = source['Summary'];
			var comments = commentString.split('; ');
		
			if (commentString.substring(0,3) == "&&&") {			
				for (var i = 0; i < outline.length; i++) {
					$('#' + number + ' .outline').append('<div class="outlinePart">' + startsWith(outline[i]) + outline[i] + '</div>');
					$('#' + number + ' .outline').append('<div class="comment">' + commentString.slice(4, commentString.length) + '</div>');
				};
			} else {			
				for (var i = 0; i < outline.length; i++) {
					$('#' + number + ' .outline').append('<div class="outlinePart">' + startsWith(outline[i]) + outline[i] + '</div>');
					$('#' + number + ' .outline').append('<div class="comment">' + comments[i] + '</div>');			
				};
			};	
			
		$('#' + number).append('<div class="terms"></div>');	
			var terms = source['Terms'].split('; ');	
			for (var i = 0; i < terms.length; i++) {
				$('#' + number + ' .terms').append('<div class="term">' + terms[i] + '</div>');
			}

		$('#' + number).append('<div class="people"></div>');	
			var people = source['People'].split('; ');	
			for (var i = 0; i < people.length; i++) {
				justPerson = people[i].split(' - ');
				
				$('#' + number + ' .people').append('<div class="person">' + justPerson[0] + '</div>');
				
				if (justPerson[1] !== undefined) {
					$('#' + number + ' .people').append('<div class="personContext">' + justPerson[1] + '</div>');
				} else {
					$('#' + number + ' .people').append('<div class="personContext">' + source['Topic'] + '</div>');
				};
			};
					
		$('#' + number).append('<div class="year">' + source['Year'] + '</div>');
	};	
};

//Startup
var notebook;
var terms = [];

$(document).ready(function(){
	Tabletop.init({ key: '1yIDpt_U6o186yydN4Ld8V79ZE-ipOb76fkWIwfGQBqo',
		callback: function (data, tabletop) {
			notebook = data;
			
			//Add Search Categories
			for (var key in notebook[0]) {
				if (key != 'Timestamp') {
					$('#searchCategory').append('<option value="' + key + '">' + key + '</option>');
				};
			};
			
			
			for (var g = 0; g < notebook.length; g++) {
				var pages = notebook[g]['Pages'].split('-');
				notebook[g]['Page Count'] = (pages[1] / 1) - (pages[0] / 1) + 1;
				
				notebook[g]['Summary Length'] = notebook[g]['Summary'].length;
				notebook[g]['Information Density'] = notebook[g]['Summary Length'] / notebook[g]['Page Count'];
				
				notebook[g]['Difficulty'] = notebook[g]['Time'] / (notebook[g]['Page Count'] * 5);
			};
		},
		simpleSheet: true
	});
	
	Tabletop.init({ key: '10YT8bcJWGevSuolmUrbc1PT3zhdvRQeZB1prOm-yop4',
		callback: function (data, tabletop) {
			var sheets = tabletop.foundSheetNames;
			
			for (var s = 0; s < sheets.length; s++) {
				terms.push(tabletop.sheets(sheets[s]).all());
			};
		},
	});
});

//Search
$(document).on('click', '#search', function() {
	if (!shifted) {
		$('.source').remove();
	};	
	
	var searchCategory = $('#searchCategory').val();
	var searchQuery = $('#searchQuery').val();
	
	if (searchQuery == '') {
		for (var a = 0; a < notebook.length; a++) {
			showSource(notebook[a], a);
		};
		
		$('.outline').hide();
		$('.terms').hide();
		$('.people').hide();
	} else {
		for (var a = 0; a < notebook.length; a++) {
			if (notebook[a][searchCategory].toUpperCase().search(searchQuery.toUpperCase()) >= 0) {
				showSource(notebook[a], a);
			}
		};
		
		$('.outline').hide();
		$('.terms').hide();
		$('.people').hide();
	};
});

$(document).on('keyup', '#searchQuery', function(event){
    if(event.keyCode == 13){
        $('#search').click();
    };
});


$(document).on('click', '#clear', function() {
	$('.source').remove();
	$('#output').empty();
	$('#searchQuery').val('');
});


//Notes
$(document).on('click', '.outlinePart', function() {
	writeToLog($(this).next().html());
});
		
$(document).on('click', '.term', function() {
	var term = this.innerHTML.toUpperCase();
	var termFound = false;

	for (var c = 0; c < terms.length; c++) {
		for (var t = 0; t < terms[c].length; t++) {
			if (terms[c][t]['Term'].toUpperCase() == term) {
				writeToLog(terms[c][t]['Meaning']);
				termFound = true;
			};
		};
	};

	if (!termFound) {
		writeToLog('Term not found.');
	};
});
		
$(document).on('click', '.person', function() {
	writeToLog($(this).next().html());
});


//UI Controls
$(document).on('click drag', '.source', function() {
	var highestZ = 1;
	
	$('.source').each(function() {
		var currentZ = $(this).css('z-index') / 1;
		
		if (currentZ > highestZ) {
			highestZ = currentZ;
		};
	});
	
	$(this).css('z-index', highestZ + 1);
});

$(document).on('click', '.close', function() {
	$(this).parent().remove();
});

$(document).on('click', '.expand', function() {
	$(this).siblings('.outline').toggle();
	$(this).siblings('.terms').toggle();	
	$(this).siblings('.people').toggle();	
	
	if ($(this).siblings('.outline').css('display') == 'none') {
		$(this).html('+');
	} else {
		$(this).html('-')
	};
});

$(document).on('click', '#openAll', function(){
	$('.outline').show();
	$('.terms').show();
	$('.people').show();
	
	$('.expand').html('-');
});

$(document).on('click', '#closeAll', function(){
	$('.outline').hide();
	$('.terms').hide();
	$('.people').hide();
	
	$('.expand').html('+');
});

$(document).on('click', '.info', function() {
	var id = $(this).parent().attr('id');
	
	if (shifted) {
		$('#output').empty();
		writeToLog(JSON.stringify(notebook[id]));
	} else {
		$('#output').empty();
		writeToLog('Pages: ' + notebook[id]['Pages'], true);
		writeToLog('Publication Type: ' + notebook[id]['Publication Type'], true);
		writeToLog('Time: ' + notebook[id]['Time'], true);
		writeToLog('Page Count: ' + notebook[id]['Page Count'], true);
		writeToLog('Summary Length: ' + notebook[id]['Summary Length'], true);
		writeToLog('Information Density: ' + notebook[id]['Information Density'], true);
		writeToLog('Difficulty: ' + notebook[id]['Difficulty'], true);
	};
});