function startsWith(string) {
	//Upper Case Roman Numeral
	if (string[0].match(/[IVX]/)) {
		return '';
	};
	
	//Arabic Numeral
	if (string[0].match(/[0-9]/)) {
		return '&emsp;';
	};
	
	//Lowercase Letters
	if (string[0].match(/[a-z]/)) {
		return('&emsp;&emsp;');
	};
	
	//Arabic Numeral
	if (string[0] == '>') {
		return '&emsp;&emsp;&emsp;';
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
		
		$('#' + number).append('<div class="identifier">' + source['Identifier'] + '</div>');
		$('#' + number).append('<div class="close btn">&#9938;</div>');
		$('#' + number).append('<div class="lock btn">&#9939;</div>');
		$('#' + number).append('<div class="expand btn">&#9903;</div>');
		$('#' + number).append('<div class="info btn">&#9883;</div>');
		$('#' + number).append('<div class="link btn">&#9964;</div>');
		
		$('#' + number).append('<div class="class">' + source['Class'] + '</div>');
		$('#' + number).append('<div class="title">' + source['Title'] + '</div>');
		$('#' + number).append('<div class="week">' + source['Week'] + '</div>');		
		$('#' + number).append('<div class="author">' + source['Author'] + '</div>');
		$('#' + number).append('<div class="topic">' + source['Topic'] + '</div>');

		$('#' + number).append('<div class="outline"></div>');
			var outline = source['Outline'].split(';; ');
			var commentString = source['Summary'];
			var comments = commentString.split(';; ');
		
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
			var theseTerms = source['Terms'].split(';; ');	
			for (var i = 0; i < theseTerms.length; i++) {
				$('#' + number + ' .terms').append('<div class="term">' + theseTerms[i] + '</div>');
			}

		$('#' + number).append('<div class="people"></div>');	
			var people = source['People'].split(';; ');	
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
				if (key != 'Timestamp' && key != 'Time' && key != 'Link' && key != 'Pages') {
					$('#searchCategory, #secondarySearchCategory').append('<option value="' + key + '">' + key + '</option>');
				};
			};
			
			
			for (var g = 0; g < notebook.length; g++) {
				var pageSets = notebook[g]['Pages'].split(';; ');
				var pageCount = 0;
				
				for (var ps = 0; ps < pageSets.length; ps++) {
					var pages = pageSets[ps].split('-');
					pageCount += ((pages[1] / 1) - (pages[0] / 1) + 1);
				};
	
				notebook[g]['Page Count'] = pageCount;				
				notebook[g]['Time Per Page'] = (notebook[g]['Time'] / pageCount).toFixed(1);				
				notebook[g]['Summary Length'] = notebook[g]['Summary'].split(' ').length;
				notebook[g]['Information Density'] = (notebook[g]['Summary Length'] / notebook[g]['Page Count']).toFixed(1);				
				notebook[g]['Difficulty'] = (notebook[g]['Time'] / (notebook[g]['Page Count'] * 5)).toFixed(2);
			};
		},
		simpleSheet: true
	});
	
	Tabletop.init({ key: '10YT8bcJWGevSuolmUrbc1PT3zhdvRQeZB1prOm-yop4',
		callback: function (data, tabletop) {
			var sheets = tabletop.foundSheetNames;
			
			for (var as = 0; as < sheets.length; as++) {
				var sheetData = tabletop.sheets(sheets[as]).all()
				for (var ss = 0; ss < sheetData.length; ss++) {
					terms.push(sheetData[ss]);
				};				
			};
		},
	});
});

//Search
$(document).on('click', '#search', function() {
	if (!shifted) {
		$('.source').not('.locked').remove();
	};	
	
	var searchCategory = $('#searchCategory').val();
	var searchQuery = $('#searchQuery').val();
	
	var secondarySearchCategory = $('#secondarySearchCategory').val();
	var secondarySearchQuery = $('#secondarySearchQuery').val();
	
	if (searchQuery == '') {
		for (var a = 0; a < notebook.length; a++) {
			showSource(notebook[a], a);
		};
		
		$('.outline').hide();
		$('.terms').hide();
		$('.people').hide();
		$('.topic').hide();
	} else {
		for (var a = 0; a < notebook.length; a++) {
			if (notebook[a][searchCategory].toUpperCase().search(searchQuery.toUpperCase()) >= 0 && (notebook[a][secondarySearchCategory].toUpperCase().search(secondarySearchQuery.toUpperCase()) >= 0 || secondarySearchQuery == '')) {
				showSource(notebook[a], a);
			};
		};
		
		$('.outline').hide();
		$('.terms').hide();
		$('.people').hide();
		$('.topic').hide();
	};
});

$(document).on('keyup', '#searchQuery', function(event){
    if(event.keyCode == 13){
        $('#search').click();
    };
});


$(document).on('click', '#clear', function() {
	$('.source').not('.locked').remove();
	$('#output').empty();
	$('#searchQuery').val('');
	$('#secondarySearchQuery').val('');
});


//Notes - Outline
$(document).on('click', '.outlinePart', function() {
	var outlineNotes = $(this).next().html().split('; ');
	
	for (var on = 0; on < outlineNotes.length; on++) {
		if (on == 0) {
			writeToLog(outlineNotes[on], false);
		} else {
			writeToLog(outlineNotes[on], true);
		};		
	};	
});

function defineTerm(defineWhat) {
	for (var dt = 0; dt < terms.length; dt++) {
		if (terms[dt]['Term'].toUpperCase() == defineWhat.toUpperCase()) {			
			return terms[dt]['Meaning'];
		};
	};
};

function getSourceTerm(getSourceWhat) {
	for (var gst = 0; gst < terms.length; gst++) {
		if (terms[gst]['Term'].toUpperCase() == getSourceWhat.toUpperCase()) {			
			return terms[gst]['Source where term is found (Article, pg)'];
		};
	};
};

//Notes - Term		
$(document).on('click', '.term', function() {
	var term = this.innerHTML.toUpperCase();
	var termFound = false;

	for (var t = 0; t < terms.length; t++) {
		if (terms[t]['Term'].toUpperCase() == term) {
			var definitions = terms[t]['Meaning'].split(' | ')[0].split(';; ');
			var sources = terms[t]['Source where term is found (Article, pg)'].split(';; ');
			var relatedTerms = [];
			
			if (terms[t]['Meaning'].split(' | ').length > 1) {
				relatedTerms = terms[t]['Meaning'].split(' | ')[1].split('; ');
			};
			
			for (var dt = 0; dt < definitions.length; dt++) {
				if (dt == 0) {
					writeToLog(definitions[dt] + ' (' + sources[dt] + ')');
				} else {
					writeToLog(definitions[dt] + ' (' + sources[dt] + ')', true);
				};
			};
			
			for (var rt = 0; rt < relatedTerms.length; rt++) {
				writeToLog('Related Term - ' + relatedTerms[rt] + ' - ' + defineTerm(relatedTerms[rt]).split(' | ')[0] + ' (' + getSourceTerm(relatedTerms[rt]) + ')', true);
			};	
			
			termFound = true;
		};
	};

	if (!termFound) {
		writeToLog('Error: Term not found.');
	};
});

//Notes - People	
$(document).on('click', '.person', function() {
	writeToLog($(this).next().html());
});


//UI Controls
$(document).on('click', '.close', function() {
	$(this).parent().not('.locked').remove();
});

$(document).on('click', '.expand', function() {
	$(this).siblings('.outline').toggle();
	$(this).siblings('.terms').toggle();	
	$(this).siblings('.people').toggle();
	$(this).siblings('.topic').toggle();
	
	if ($(this).siblings('.outline').css('display') == 'none') {
		$(this).html('&#9903;');
	} else {
		$(this).html('&#9900;')
	};
});

$(document).on('click', '#openAll', function(){
	$('.outline').show();
	$('.terms').show();
	$('.people').show();
	$('.topic').show();
	
	$('.expand').html('&#9900;');
});

$(document).on('click', '#closeAll', function(){
	$('.outline').hide();
	$('.terms').hide();
	$('.people').hide();
	$('.topic').hide();
	
	$('.expand').html('&#9903;');
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
		writeToLog('Time: ' + notebook[id]['Time'] + ' minutes', true);
		writeToLog('Page Count: ' + notebook[id]['Page Count'], true);
		writeToLog('Summary Length: ' + notebook[id]['Summary Length'] + ' words', true);
		writeToLog('Time Per Page: ' + notebook[id]['Time Per Page'] + ' minutes', true);
		writeToLog('Information Density: ' + notebook[id]['Information Density'] + ' words/page', true);
		writeToLog('Difficulty: ' + notebook[id]['Difficulty'], true);
	};
});

$(document).on('click', '.lock', function() {
	$(this).parent().addClass('locked');
	$(this).removeClass('lock');
	$(this).addClass('unlock');
	$(this).html('&#9919;');
});

$(document).on('click', '.unlock', function() {
	$(this).parent().removeClass('locked');
	$(this).removeClass('unlock');
	$(this).addClass('lock');
	$(this).html('&#9939;');
});

$(document).on('click', '.link', function() {
	var id = $(this).parent().attr('id') / 1;
	
	if (notebook[id]['Link'] != 'n/a') {
		window.open(notebook[id]['Link']);
	};
});

$(document).on('click', '#lockAll', function() {
	$('.lock').addClass('unlock');
	$('.lock').removeClass('lock');
	$('.unlock').html('&#9919;');
	$('.source').addClass('locked');
});

$(document).on('click', '#unlockAll', function() {
	$('.unlock').addClass('lock');
	$('.unlock').removeClass('unlock');
	$('.lock').html('&#9939;');
	$('.source').removeClass('locked');
});

$(document).on('click', '#d2l', function() {
	window.open('https://learn.colorado.edu/d2l/home/223822');
});

$(document).on('click', '#undefinedTerms', function() {
	$('#output').empty();
	
	var undefinedTerms = [];
	
	//Loop through sources
	for (var ts = 0; ts < notebook.length; ts++) {
		var thisSourceTerms = notebook[ts]['Terms'].split(';; ');
		
		//Loop through terms in that source
		for (var tst = 0; tst < thisSourceTerms.length; tst++) {
			var defined = false;
			
			for (var cfd = 0; cfd < terms.length; cfd++) {
				if (thisSourceTerms[tst].toUpperCase() == terms[cfd]['Term'].toUpperCase()) {
					defined = true;
				};
			};
			
			if (!defined && thisSourceTerms[tst] != '') {
				undefinedTerms.push(thisSourceTerms[tst]);
			};
		};
	};
	
	for (var ut = 0; ut < undefinedTerms.length; ut++) {
		writeToLog(undefinedTerms[ut], true);
	}
});
