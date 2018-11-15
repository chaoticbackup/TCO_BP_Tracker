var FileSaver = require('file-saver');

export function exportDeck(layout) {
	let deck = null, name = "deck";

	if (layout == "short"){
		deck = exportDeckShort();
		name = $("caption div:contains('Deck')").text().replace(/.*Deck \"(.+)\"(.|\r\n|\r|\n)*/, "$1").trim();
	}
	else if (layout == "extended") {
		deck = exportDeckExtended();
		name = $("caption div:contains('Deck')").text().replace(/.*Deck \"(.+)\"(.|\r\n|\r|\n)*/, "$1").trim();
	}
	else {
		deck = exportDeckEdit();
		name = $(".forumline span.gen input[name='name']").val();
	}

	if (deck) saveDeck(deck, name);
}

function getTypeBySection(section) {
	let tp = $(section).find('ul').children().eq(2).text().replace("Card Type: ", "");
	return getType(tp);
};

function getType(tp) {
	if (tp == "Attack") return 'attacks';
	else if (tp == "Battlegear") return 'battlegear';
	else if (tp == "Creature") return 'creatures';
	else if (tp == "Location") return 'locations';
	else if (tp == "Mugic") return 'mugic';
	else return null;
}

// Create File from deck name
function saveDeck(deck, name) {
	let data = JSON.stringify(deck, null, 2);

	let blob = new Blob([data], {type: 'text/json;charset=utf-8"'});
	FileSaver.saveAs(blob, name+".json");
}

function exportDeckEdit() {
	let deck = { attacks: [], battlegear: [], 
	  creatures: [], locations: [], mugic: [] };

	let addCardsSection = (elements) => {
		$(elements).children().each(function(i, attack) {
			var find = $(this).find('tr').first();
			var name = $(find).find("strong span").text();
			var amount = parseInt($(find).find("input").val());
			let type = getTypeBySection($(this));
			if (!type) return;

			deck[type].push(name);
			if (amount == 2) {
				deck[type].push(name);
			}
		});
	}

	addCardsSection($("#deck_section_table_86")); // attacks
	addCardsSection($("#deck_section_table_98")); // battlegear and creatures
	addCardsSection($("#deck_section_table_85")); // locations
	addCardsSection($("#deck_section_table_87")); // mugic

	return deck;
}

function exportDeckShort() {
	let deck = { attacks: [], battlegear: [], 
	  creatures: [], locations: [], mugic: [] };

	let tmp = $('table.deck_section_table tbody').children().filter('tr.even');
	tmp.each(function(i, card) {
		let amount = parseInt($(card).children().first().text());
		let name = $(card).children().eq(2).children().text().trim();
		let type = getType($(card).children().eq(5).text().trim());

		deck[type].push(name);
		if (amount == 2) {
			deck[type].push(name);
		}
	});

	return deck;
}

function exportDeckExtended() {
	let deck = { attacks: [], battlegear: [], 
	  creatures: [], locations: [], mugic: [] };

	let tmp = $('table.deck_section_table tbody').children().filter('tr.even');
	for (let i = 0; i < tmp.length; i+=2) {
		let amount = parseInt($(tmp[i]).children().first().text());
		let name = ($(tmp[i]).children().eq(3).text()).replace(/\(.+\)/, '').trim();
		let type = getTypeBySection(tmp[i+1]);

		deck[type].push(name);
		if (amount == 2) {
			deck[type].push(name);
		}
	}

	return deck;
}
