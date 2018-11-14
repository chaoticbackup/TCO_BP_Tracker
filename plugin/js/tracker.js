export function injectBPTracker(type) {
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
