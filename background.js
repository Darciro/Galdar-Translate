'use strict';
var selectedText = '';
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	// console.log(msg, sender, sendResponse);
	if (msg.action == 'setSelectedText') {
		selectedText = msg.value;
	}

	if (msg.action == 'getSelectedText') {
		// console.log( selectedText );
		chrome.runtime.sendMessage({ selectedText: selectedText });
	}

	if (msg.action == 'open_dialog_box') {
		$('#left-sidebar').css('background', 'rebeccapurple')
	}
});