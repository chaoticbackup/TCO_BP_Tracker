import {checkBP} from './tracker.js';
import {exportDeck} from './exportDeck';
import {importDeck} from './importDeck';
import {deleteDeck} from './deleteDeck';

(function() {
	if ($(".toolbar a:contains('Chaotic TCG')")) {
		// if ($('input[value="editDeck"]').length) {
		let cond1 = (window.location.href.indexOf("showDeck") > -1 
			&& window.location.href.indexOf("extended_format") > -1);
		let cond2 = ($("b:contains('Edit your Deck')").length);

		if (cond1 || cond2) {
			let type = (function() {if (cond1) return "show"; else if (cond2) return "edit"})();
			injectBPTracker(type);
			if (type == "edit") {
				injectButtons();
			}
			else {
				injectExport();
			}
		}
		else {
			injectExport();
		}
	}
})();

export function display(msg) {
	$('#contentDisplay').html(msg).addClass("visible");
}

export function clearDisplay() {
	$('#contentDisplay').empty().removeClass("visible");
	$('.confirmation').each(function() {
		$(this).addClass('hidden');
	});
}

function injectExport() {
	let tmp = $("a[title*='Public web page']")
		.parent().children().filter('div').first();
	tmp.prepend(`<a href="javascript:;" id="exportTXT" title="Export the current deck to txt file" style='cursor:pointer'>[Export Text]&nbsp;&nbsp;</a>`);
	tmp.prepend(`<a href="javascript:;" id="exportJSON" title="Export the current deck to json file" style='cursor:pointer'>[Export JSON]&nbsp;&nbsp;</a>`);
	
	if ($("a[title*='standard'").length > 0) {
		$('#exportJSON').on('click', exportDeck.bind(this, 'extended', "json"));
		$('#exportTXT').on('click', exportDeck.bind(this, 'extended', "txt"));
	}
	else if ($("a[title*='extended'").length > 0) {
		$('#exportJSON').on('click', exportDeck.bind(this, 'short', "json"));
		$('#exportTXT').on('click', exportDeck.bind(this, 'short', "txt"));
	} 
}

// inject the import/export on the page
function injectButtons() {
	var deckbuttons = document.createElement("tr");
	$(deckbuttons).insertBefore($("input[type='submit'][value='Update']").parent().parent());

	// Load our html into the page
	$(deckbuttons).load(chrome.extension.getURL("html/deckbuttons.html"), function() {
		$('#importInput').on('change', function(e) {
			if (document.getElementById("importInput").files.length == 0 ) {
				$('#importDeck').prop('disabled', true);
			}
			else {
				clearDisplay();
				$('#importDeck').prop('disabled', false);
			}
		});
		$('#importDeck').on('click', importDeck);
		$('#exportDeck').on('click', exportDeck);
		$('#deleteDeck').on('click', deleteDeck);
	});

}

function injectBPTracker(type) {
	// Inject the html for the tracker	
	var tracker = document.createElement("div");
	tracker.id = "tracker";
	document.getElementById("main_content").appendChild(tracker);

	// Load our html into the page
	$(tracker).load(chrome.extension.getURL("html/tracker.html"), function() {
		// Add event listener for changes in edit mode
		if (type === "edit") {
			// Check for the up/down arrows
			$('#deck_section_table_86 span > a').on('click', function() {
				checkBP('edit');
			});
			// Check for other input changes
			$('#deck_section_table_86').on("change", function() { 
				checkBP("edit");
			});
		}
		checkBP(type); 	// Check the BP on initial load
	});
}
