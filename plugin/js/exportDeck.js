var FileSaver = require('file-saver');

export function exportDeck() {
	let deck = { attacks: [], battlegear: [], 
	  creatures: [], locations: [], mugic: [] };

	let addCardsSection = (elements) => {
		$(elements).children().each(function(i, attack) {
			var find = $(this).find('tr').first();
			var name = $(find).find("strong span").text();
			var amount = parseInt($(find).find("input").val());
			let type = getType($(this));
			if (!type) return;

			deck[type].push(name);
			if (amount == 2) {
				deck[type].push(name);
			}
		});
	}

	// attacks
	addCardsSection($("#deck_section_table_86"));

	// battlegear and creatures
	addCardsSection($("#deck_section_table_98"));

	// locations
	addCardsSection($("#deck_section_table_85"));

	// mugic
	addCardsSection($("#deck_section_table_87"));

	saveDeck(deck);
}

function getType(section) {
	let tp = $(section).find('ul').children().eq(2).text().replace("Card Type: ", "");
	if (tp == "Attack") return 'attacks';
	else if (tp == "Battlegear") return 'battlegear';
	else if (tp == "Creature") return 'creatures';
	else if (tp == "Location") return 'locations';
	else if (tp == "Mugic") return 'mugic';
	else return null;
};

function saveDeck(deck) {
	// Create File from deck name
	let name = $(".forumline span.gen input[name='name']").val();

	let data = JSON.stringify(deck, null, 2);

	let blob = new Blob([data], {type: 'text/json;charset=utf-8"'});
	FileSaver.saveAs(blob, name+".json");
}
