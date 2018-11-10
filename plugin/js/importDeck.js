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
	//TODO check if deck already contains cards
	openFile((contents, err) => {
		if (err) {
			// TODO
			event.preventDefault();
			event.stopPropagation();
			console.log(err);	
			return;
		}
		try {
			contents = JSON.parse(contents);
		}
		catch (err) {
			// TODO
			event.preventDefault();
			event.stopPropagation();
			console.log('not valid json', err);
			return;
		}
		checkDeckLegal(contents, (error) => {
			if (error) {
				event.preventDefault();
				event.stopPropagation();
				console.log("illegal deck\n", error);
				// TODO inform user imported deck isn't legal
				// add a help option for valid deck formats
				// tell user what is wrong
				return;
			}
			else buildDeck(contents, (error) => {
				if (error) {
					event.preventDefault();
					event.stopPropagation();
					console.log("deck building error\n", error);
					// TODO inform user why the deck building failed
					return;
				}
				else {
					// TODO tell building deck
					// TODO refresh page after built to see changes;
				}
			});
		});
	});
}

function buildDeck(contents) {
	// TODO
	console.log("building deck");
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

	// Check deck size/legality
	if (size.attacks != 20) error += "Deck requires 20 Attacks\n";
	if (size.battlegear != size.creatures != size.mugic != 6
		|| size.battlegear != size.creatures != size.mugic != 3) {
		error += "Battlegear and Creatures and Mugic must be the same amount and contain 3 or 6 of each\n"
	}
	if (size.locations != 10) error += "Deck requires 10 Locations\n";

	return callback(error);
}
