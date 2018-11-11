function openFile(callback) {
	var x = document.getElementById("importDeck");
	if ('files' in x) {
		if (x.files.length == 0) {
			return callback(null, "no file");
		}
		else {
			let file = x.files[0];
			try {
				var fr = new FileReader();

				fr.addEventListener("load", (event) => {
					return callback(event.target.result);
				});

				fr.readAsText(file);

			} catch (err) {
				return callback(null, err);
			}
		}
	}
}

export function importDeck(event) {
	let displayError = (error) => {
		event.preventDefault();
		event.stopPropagation();
		console.log(error);	
		// TODO, display on screen
	}

	// check if deck already contains cards
	if ($("#total_cards_in_deck").text() != "0") {
		return displayError("deck must not contain cards");
	}

	openFile((contents, error) => {
		if (error) return displayError(error);

		try {
			contents = JSON.parse(contents);
		}
		catch (error) {
			// Return a specific parse error
			try {
				jsonlint.parse(contents)
			} 
			catch (error) {
				return displayError(error.name +  error.message);
			}
		}

		checkDeckLegal(contents, (error) => {
			if (false) { // TODO readd check
			// if (error) {
				// TODO inform user imported deck isn't legal
				// add a help option for valid deck formats
				// tell user what is wrong
				return displayError("illegal deck\n" + error);
			}
			else buildDeck(contents, (error) => {
				if (error) {
					// TODO inform user why the deck building failed
					return displayError("deck building error\n" + error);
				}
				else {
					// TODO tell building deck
					console.log("building deck, please wait");
					// TODO refresh page after built to see changes
				}
			});
		});
	});
}

function checkDeckLegal(contents, callback) {
	let size = { attacks: 0, battlegear: 0, 
		creatures: 0, locations: 0, mugic: 0 };
	let error = "";

	['attacks', 'battlegear', 'creatures', 'locations', 'mugic'].forEach((type) => {
		if (!contents.hasOwnProperty(type)) {
			error += `Missing '${type}' property\n`;
		}
		else {
			size[type] = contents[type].length;
		}
	});

	const requires = (param) => {
		error += `Deck Requires ${param}\n`;
	}

	// Check deck size/legality
	if (size.attacks != 20) requires("20 Attacks");

	if (size.locations != 10) requires("10 Locations");

	if (size.creatures == 3)
	{
		if (size.battlegear != 3) requires("3 Battlegear");
		if (size.mugic != 3) requires("3 Mugic");
	}
	else if (size.creatures == 6) {
		if (size.battlegear != 6) requires("6 Battlegear");
		if (size.mugic != 6) requires("6 Mugic");
	}
	else {
		requires("3 or 6 of Battlegear, Creatures, and Mugic");
	}

	return callback(error);
}

function buildDeck(deck, callback) {
	// TODO
	console.log("building deck");
	let error = "";

	// Attacks
	// deck.attacks.forEach(attack => {

	// });

	var url = "http://www.tradecardsonline.com/get_cards_with_name.php?game_id=82&card_name=";
	var xhttp = new XMLHttpRequest();

	let getCardID = (cardName) => {
			xhttp.onreadystatechange = function() {
		    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
			    if (this.responseText.indexOf("No matches found!")) {
			    	error += `invalid card: "${cardName}"`;
			    }
			    else {
			    	console.log(this);
			    }
		    }
		  };

		  xhttp.open("GET", (url + encodeURI(cardName.trim())), false);
		  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		  xhttp.send();
	}

	getCardID(deck.creatures[0]) // TODO make promise
	// TODO appen
	

  return callback(error);
}
