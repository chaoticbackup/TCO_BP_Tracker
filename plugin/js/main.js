import {checkBP} from './tracker.js';
import {exportDeck} from './exportDeck';
import {importDeck} from './importDeck';

(function() {
	// if ($('input[value="editDeck"]').length) {
	let cond1 = (window.location.href.indexOf("showDeck") > -1 
		&& window.location.href.indexOf("extended_format") > -1);
	let cond2 = ($("b:contains('Edit your Deck')").length);

	if ($("a:contains('Chaotic TCG')") && (cond1 || cond2)) {
		let type = (function() {if (cond1) return "show"; if (cond2) return "edit"})();

		// Inject the html for the tracker	
		var node = document.createElement("div");
		node.id = "tracker";
		document.getElementById("main_content").appendChild(node);

		// Check the BP on initial load
		$('#tracker').load(chrome.extension.getURL("html/tracker.html"), function() {
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
			checkBP(type);
		});
	}
})();
