// Enter an API key from the Google API Console:
// https://console.developers.google.com/apis/credentials
const apiKey = "AIzaSyAIv3JEYpXHvuyK4KIcLV69zAK62YkJ-_s";

// Set endpoints
const endpoints = {
	translate: "",
	detect: "detect",
	languages: "languages"
};

// Abstract API request function
function makeApiRequest(endpoint, data, type, authNeeded) {
	// url = "https://www.googleapis.com/language/translate/v2/" + endpoint;
	url = "https://translation.googleapis.com/language/translate/v2/" + endpoint;
	url += "?key=" + apiKey;

	// If not listing languages, send text to translate
	if (endpoint !== endpoints.languages) {
		url += "&q=" + encodeURI(data.textToTranslate);
	}

	// If translating, send target and source languages
	if (endpoint === endpoints.translate) {
		url += "&target=" + data.targetLang;
		url += "&source=" + data.sourceLang;
	}

	// Return response from API
	return $.ajax({
		url: url,
		type: type || "GET",
		data: data ? JSON.stringify(data) : "",
		dataType: "json",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json"
		}
	});
}

// Translate
function translate(data) {
	/*makeApiRequest(endpoints.translate, data, "GET", false).success(function(resp) {
		$(".target").text(resp.data.translations[0].translatedText);
		$("h2.detection-heading").hide();
		$("h2.translation-heading, p").show();
	});*/

	$.when( makeApiRequest(endpoints.translate, data, "GET", false) ).then(function(resp) {
		$(".target").text(resp.data.translations[0].translatedText);
		$("h2.detection-heading").hide();
		$("h2.translation-heading, p").show();
	});
}

// Detect language
function detect(data) {
	makeApiRequest(endpoints.detect, data, "GET", false).success(function(resp) {
		source = resp.data.detections[0][0].language;
		conf = resp.data.detections[0][0].confidence.toFixed(2) * 100;

		$(".source-lang option")
			.filter(function() {
				return $(this).val() === source; //To select Blue
			})
			.prop("selected", true);
		$.when(getLanguageNames()).then(function(data) {
			$("p.target").text(data[source] + " with " + conf + "% confidence");
		});
		$("h2.translation-heading").hide();
		$("h2.detection-heading, p").show();
	});
}

// Get languages
function getLanguages() {
	$.when( makeApiRequest(endpoints.languages, null, "GET", false) ).then(function(resp) {
		$.when(getLanguageNames()).then(function(data) {
			$.each(resp.data.languages, function(i, obj) {
				$(".source-lang, .target-lang").append(
					'<option value="' + obj.language + '">' + data[obj.language] + "</option>"
				);
			});
			setDefaultLanguage();
		});
	});
}

// Set a default language option
function setDefaultLanguage() {
	var userLang = navigator.language || navigator.userLanguage;
	if( userLang.split('-')[0].length ){
		$('.target-lang').val( userLang.split('-')[0] );
	}

	$('.source-lang').val( 'en' );
	chrome.runtime.sendMessage({ action: "getSelectedText" });
	chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {

		if (msg.selectedText !== '') {
			$('#text-to-translate').val(msg.selectedText);
			$('.translate').text('Traduzindo');
			if( $(".target-lang").val() !== null ) {
				$('.translate').trigger('click');
				$('.translate').text('Traduzir');
			}
		}
	});
}

// Convert country code to country name
function getLanguageNames() {
	return $.getJSON("https://api.myjson.com/bins/155kj1");
}

// On document ready
$(function() {
	window.makeApiRequest = makeApiRequest;
	var translationObj = {};

	// Popuplate source and target language dropdowns
	getLanguages();

	$(document)
	// Bind translate function to translate button
		.on("click", "button.translate", function() {
			translationObj = {
				sourceLang: $(".source-lang").val(),
				targetLang: $(".target-lang").val(),
				textToTranslate: $("textarea").val()
			};

			if (translationObj.targetLang !== null) {
				translate(translationObj);
			} else {
				alert("Please select a target language");
			}
		})
		// Bind detect function to detect button
		.on("click", "button.detect", function() {
			translationObj = {
				textToTranslate: $("textarea").val()
			};

			detect(translationObj);
		});

	$('#galdar-translate-form').submit(function(e){
		e.preventDefault();

		translationObj = {
			sourceLang: $(".source-lang").val(),
			targetLang: $(".target-lang").val(),
			textToTranslate: $("textarea").val()
		};

		if (translationObj.targetLang !== null) {
			translate(translationObj);
		} else {
			alert("Please select a target language");
		}

		return false;
	});

	chrome.runtime.sendMessage({ action: "getSelectedText" });
	chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {

		if (msg.selectedText !== '') {
			$('#text-to-translate').val(msg.selectedText);
			$('.translate').text('Traduzindo');
			if( $(".target-lang").val() !== null ) {
				$('.translate').trigger('click');
				$('.translate').text('Traduzir');
			}
		}
	});
});