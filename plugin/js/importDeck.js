import {display} from './main.js';

function openFile(callback) {
	var x = document.getElementById("importInput");
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
		display(error);
		// TODO, format on screen
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
			// If json parsing fails return a specific parse error
			try {
				jsonlint.parse(contents)
			} 
			catch (error) {
				return displayError(error.name +  error.message);
			}
		}

		checkDeckLegal(contents, (error) => {
			if (error) {
				return displayError("illegal deck\n" + error);
			}
			display("building deck, please wait");
			buildDeck(contents, (error) => {
				if (error) {
					return displayError("deck building error\n" + error);
				}
				else {
					// refresh page after built to see changes
					window.location.reload(false); 
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

const types = ["attacks", "battlegear", "creatures", "locations", "mugic"];
function buildDeck(deck, callback) {
	let cardIDs = { attacks: [], battlegear: [], 
			creatures: [], locations: [], mugic: [] };
	let error = "";

	// This hidious promise setup is to make sure all the cards
	// are checked to exist before attempting to send the get and post requests
	// for the returned card ids to be added to the deck
	// https://stackoverflow.com/questions/41079410/delays-between-promises-in-promise-chain
	const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

	// merges all the cards in the deck sequentially 
	Promise.all(types.map((type) => {
		return deck[type].reduce((promise, cardName) => {
			return promise.then(() => {
			  return Promise.all([
			  	delay(100), 
			  	new Promise((resolve, reject) => {
			  		return getCardID(cardName, resolve, reject);
			  	})
			  	.then((id) => {
			  		return cardIDs[type].push(id);
			  	})
			  	.catch((err) => {
			  		return error += err + "\n";
			  	})
			  ]);
			});
		}, Promise.resolve());
	})).then((results) => {
		if (error) {
			return callback(error);
		}
		
		// addCardByID
		Promise.all(types.map((type) => {
			return cardIDs[type].reduce((promise, cardID) => {
				return promise.then(() => {
				  return Promise.all([
				  	delay(100), 
				  	new Promise((resolve, reject) => {
				  		return addCardByID(cardID, type, resolve, reject);
				  	})
				  	.catch((err) => {
				  		return error += err + "\n";
				  	})
				  ]);
				});
			}, Promise.resolve());
		})).then((results) => {
			if (error) {
				return callback(error);
			}

			return callback();
		});	
	});

}

const cardIDURL = "http://www.tradecardsonline.com/get_cards_with_name.php?game_id=82&card_name=";
const getCardID = async (cardName, resolve, reject) => {
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
	    if (this.responseText.indexOf("No matches found!") > -1) {
	    	return reject(`invalid card: "${cardName}"`);
	    }
	    else {
	    	let htmlDoc = $.parseHTML(this.responseText);
	    	let id = $(htmlDoc).find('li').first().attr('id');
	    	return resolve(id);
	    }
    }
  };
  xhttp.open("GET", (cardIDURL + encodeURI(cardName.trim())), true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send();
}

const cardAddURL = "http://www.tradecardsonline.com/ajax.php";
const addCardByID = async (cardID, cardType, resolve, reject) => {
	let section_id = "", section_name = "";

	switch (cardType) {
		case 'attacks':
			section_id = 86;
			section_name = "Attacks Deck"
			break;
		case 'battlegear':
		case 'creatures':
			section_id = 98;
			section_name = "Creatures and Battle";
			break;
		case 'locations':
			section_id = 85;
			section_name = "Location Deck";
			break;
		case 'mugic':
			section_id = 87;
			section_name = "Other cards";
			break;
		case 'none':
		default:
			section_id = 0;
			section_name = "none";
			break;
	}

	let post_data = "rs=add_item_to_deck"
		+ "&rst="
		+ "&rsrnd=" + new Date().getTime()
		+ "&rsargs[]=" + encodeURIComponent(JSON.stringify({
		  game_id: "82",
		  deck_id: $("input[name='deck_id']").first().attr('value'),
		  card_id: cardID,
		  amount: 1,
		  section_id: section_id,
		  section_name: section_name
		}));

	let x = new XMLHttpRequest();
	x.onreadystatechange = function() {
    if (this.readyState == 4) {
    	if (this.status == 200) {
				return resolve();
    	}
			else {
				return reject();
			}
  	}
	}
	x.open("POST", (cardAddURL), true);
	x.setRequestHeader("Method", "POST " + cardAddURL + " HTTP/1.1");
	x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	x.send(post_data);
}

