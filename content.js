$('body').on('click', function(){

	var text = "";
	if (window.getSelection) {
		text = window.getSelection().toString();
	} else if (document.selection && document.selection.type != "Control") {
		text = document.selection.createRange().text;
	}

	chrome.runtime.sendMessage({ action: "setSelectedText", value: text });

});