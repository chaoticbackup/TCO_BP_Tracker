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
			console.log("building deck, please wait"); // TODO tell building deck
			buildDeck(contents, (error) => {
				if (error) {
					// TODO inform user why the deck building failed
					return displayError("deck building error\n" + error);
				}
				else {
					// refresh page after built to see changes
					console.log("deck built, refreshing page"); // TODO remove
					// window.location.reload(false); 
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
	let cardIDs = { attacks: [], battlegear: [], 
			creatures: [], locations: [], mugic: [] };
	let error = "";

	// TODO remove test
	return new Promise((resolve, reject) => {
		getCardID(deck.creatures[0], resolve, reject);
	}).then((id) => {
		console.log(id);
		return new Promise((resolve, reject) => {
			addCardByID(id, 'creatures', resolve, reject);
		});
	}).then(() => {
		callback();
	});

	// This hidious promise setup is to make sure all the cards
	// are checked to exist before attempting to send the post request
	// with the returned card ids
	// https://stackoverflow.com/questions/41079410/delays-between-promises-in-promise-chain
	const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

	// merges all the cards in the deck sequentially 
	Promise.all(["attacks", "battlegear", "creatures", "locations", "mugic"]
	.map((type) => {
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
		}, Promise.resolve())
		.then((results) => {});
	})).then((results) => {

		if (error) {
			console.log(error);
			return callback(error);
		}
		
		// TODO addCardByID
		console.log(cardIDs);
		callback();
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

	let post_data = "";
	post_data = "rs=add_item_to_deck";
	post_data += "&rst=";
	post_data += "&rsrnd="+ new Date().getTime();
	post_data += "&rsargs[]=" + encodeURIComponent(JSON.stringify({
	  game_id: "82",
	  deck_id: $("input[name='deck_id']").first().attr('value'),
	  card_id: cardID,
	  amount: 1,
	  section_id: section_id,
	  section_name: section_name
	}));

	console.log(post_data);

	let x = new XMLHttpRequest();
	x.onreadystatechange = function() {
    if (this.readyState == 4) {
    	console.log(this.status);
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

/*
post_data = "rs=" + escape(func_name);
post_data += "&rst=" + escape(sajax_target_id);
post_data += "&rsrnd=" + new Date().getTime();
for (i = 0; i < args.length-1; i++) {
    if (args[i] instanceof Object) {
        args[i] = JSON.stringify(args[i]);
    }
    post_data = post_data + "&rsargs[]=" + escape(args[i]);
}

//http://www.tradecardsonline.com/ajax.php?rs=add_item_to_deck&rst=&rsrnd=1541624404930&rsargs[]=%7B%22game_id%22%3A%2282%22%2C%22deck_id%22%3A%22875857%22%2C%22card_id%22%3A%22176316%22%2C%22amount%22%3A%221%22%2C%22section_id%22%3A%220%22%2C%22section_name%22%3A%22none%22%7D
*/
}

/*
Promise.all(["attacks", "battlegear", "creatures", "locations", "mugic"]
.map((type) => {
	return deck[type].map((cardName) => {
	  return Promise.all([
	  	delay(100), 
	  	new Promise((resolve, reject) => {
	  		getCardID(cardName, resolve, reject);
	  	})
	  	.then((id) => {
	  		console.log(cardName);
	  		return cardIDs[type].push(id);
	  	})
	  	.catch((err) => {
	  		return error += err + "\n";
	  	})
	  ]);
	}, Promise.resolve().then(results => {
		// TODO find out why this is after
		console.log(results||type + " done");
	}));
})).then(results => {
	console.log(cardIDs);
	if (error) {
		console.log(error);
		return callback(error);
	}
	
	// TODO addCardByID
	callback();
});*/

