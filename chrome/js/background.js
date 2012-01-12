/*
 * Add the stackfiddle page action to pages
 * that have valid stackoverflow questions.
 */
 
var loaded = false; 

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tab.url.indexOf("stackoverflow.com/questions/") > -1) {
 		chrome.pageAction.show(tabId);
 		loaded = false;
	}
});

chrome.pageAction.onClicked.addListener(function(tab) {
	if (loaded === false) {
		loaded = true;
		chrome.tabs.insertCSS(null, { file: "css/stackfiddle.css" });
		
		chrome.tabs.executeScript(null, { file: "js/libs/jquery.min.js" }, function() {
			chrome.tabs.executeScript(null, { file: "js/libs/jquery.simplemodal.min.js" }, function() {
				chrome.tabs.executeScript(null, { file: "js/libs/jquery.nanoscroller.min.js" }, function() {
					chrome.tabs.executeScript(null, { file: "js/sl-sf-chrome.js" }, function() {
						chrome.tabs.sendRequest(tab.id, {init: true});
					});
				});
			});
		});
	} 
	else {
		chrome.tabs.sendRequest(tab.id, {});
	}
});
