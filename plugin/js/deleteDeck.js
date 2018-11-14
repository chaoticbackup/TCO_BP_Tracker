import {clearDisplay} from './main.js';

export function deleteDeck() {
	clearDisplay();
	$('#deleteConfirmation').removeClass("hidden");

	$('#confirmDelete').on("click", function() {
		$("input[type='checkbox'][name*='delete']").each(function(i) {
			$(this).prop("checked", true);
		});
		$("input[type='submit'][value='Update']").click();
	});

	$('#denyDelete').on("click", function() {
		$('#deleteConfirmation').addClass("hidden");
	});
}
