import {clearDisplay} from './main.js';

export function deleteDeck() {
	clearDisplay();
	$('#deleteConfirmation').removeClass("hidden");

	$('#confirmDelete').one("click", function() {
		$("input[type='checkbox'][name*='delete']").each(function(i) {
			$(this).prop("checked", true);
		});
		$("input[type='submit'][value='Update']").click();
	});

	$('#denyDelete').one("click", function() {
		$('#deleteConfirmation').addClass("hidden");
	});
}
