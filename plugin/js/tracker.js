(function() {
	// if ($('input[value="editDeck"]').length) {
	let cond1 = (window.location.href.indexOf("showDeck") > -1 
		&& window.location.href.indexOf("extended_format") > -1);
	let cond2 = ($("b:contains('Edit your Deck')").length);

	if ($("a:contains('Chaotic TCG')") && (cond1 || cond2)) {
		// Inject the html for the tracker	
		var node = document.createElement("div");
		node.id = "tracker";
		document.getElementById("main_content").appendChild(node);

		// Check the BP on initial load
		$('#tracker').load(chrome.extension.getURL("html/tracker.html"), function() {
			let type = (function() {if (cond1) return "show"; if (cond2) return "edit"})();

			if (type === "edit") 
				// Re-Check the BP when the decklist changes
				$('#deck_sections_container').on("change", ":input", checkBP("edit"));
			else
				checkBP(type);
		});
	}
})();

function checkBP(type) {
	var cards = 0, bp = 0;
	if (type === "edit") {
		// Find Attack Section
		var attacks = $("strong:contains('Attacks Deck')").parent().next();

		// Calculate the cards and bp
		$(attacks).children().each(function(i) {
			var find = $(this).find('tr');
			var amount = parseInt($(find[0]).find("input").val());
			cards += amount;
			bp += amount * parseInt($(find[1]).find("strong:contains('Build Point')").parent().text().replace("Build Point: ", ""));
		});
	}
	if (type === "show") {
		// Find Attack Section
		var attack = $("strong:contains('Section: Attacks Deck')").parent().parent().next();
		// Calculate the cards and bp
		do {
			var amount = parseInt($($(attack).find('td')[0]).find("strong").text());
			cards += amount;
			attack = attack.next();
			bp += amount * parseInt($(attack).find("strong:contains('Build Point')").parent().text().replace("Build Point: ", ""));
			attack = attack.next();
		} while(attack.hasClass("even"));
	}
	// Set Values
	$('#tracker .number span').text(cards);
	$('#tracker .bp span').text(bp);
}
