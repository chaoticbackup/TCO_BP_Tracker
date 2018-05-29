(function() {
	// if ($('input[value="editDeck"]').length) {
	if ($("b:contains('Edit your Deck')").length) {
		// Inject the html for the tracker	
		var node = document.createElement("div");
		node.id = "tracker";
		document.getElementById("main_content").appendChild(node);
		// Check the BP on initial load
		$('#tracker').load(chrome.extension.getURL("tracker.html"), checkBP);

		// Re-Check the BP when the decklist changes
		$('#deck_sections_container').change(checkBP);
	}
})();

function checkBP() {
	var cards = 0, bp = 0;

	// Find Attack Section
	var attacks = $("strong:contains('Attacks Deck')").parent().next();

	// Calculate the cards and bp
	$(attacks).children().each(function(i) {
		var find = $(this).find('tr');
		var amount = parseInt($(find[0]).find("input").val());
		cards += amount;
		bp += amount * parseInt($(find[1]).find("strong:contains('Build Point')").parent().text().replace("Build Point: ", ""));
	});

	// Set Values
	$('#tracker .number span').text(cards);
	$('#tracker .bp span').text(bp);
}
