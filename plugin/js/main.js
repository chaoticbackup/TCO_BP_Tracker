import {injectBPTracker} from './tracker.js';
import {exportDeck} from './exportDeck';
import {importDeck} from './importDeck';
import {deleteDeck} from './deleteDeck';

(function() {
	// if ($('input[value="editDeck"]').length) {
	let cond1 = (window.location.href.indexOf("showDeck") > -1 
		&& window.location.href.indexOf("extended_format") > -1);
	let cond2 = ($("b:contains('Edit your Deck')").length);

	if ($("a:contains('Chaotic TCG')") && (cond1 || cond2)) {
		let type = (function() {if (cond1) return "show"; if (cond2) return "edit"})();

		injectBPTracker(type);

		if (type == "edit") {
			injectButtons();
		}
	}
})();

// inject the import/export on the page
function injectButtons() {
	var deckbuttons = document.createElement("tr");
	$(deckbuttons).insertBefore($("input[type='submit'][value='Update']").parent().parent())

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
		$('#deleteDeck').on('click', deleteDeck);
		$('#exportDeck').on('click', exportDeck);
	});

}

export function display(msg) {
	$('#contentDisplay').html(msg).addClass("visible");
}

export function clearDisplay() {
	$('#contentDisplay').empty().removeClass("visible");
}
