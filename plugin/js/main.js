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
			// TODO inject the import/export on the page
		}
	}
})();

