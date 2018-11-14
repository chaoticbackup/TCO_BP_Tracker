export function deleteDeck() {
	// TODO actually make this safe haha
	$("input[type='checkbox'][name*='delete']").each(function(i) {
		$(this).prop("checked", true);
	});
	$("input[type='submit'][value='Update']").click();
}
