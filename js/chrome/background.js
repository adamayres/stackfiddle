/*
 * Add the stackfiddle page action to pages
 * that have valid stackoverflow questions.
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tab.url.indexOf("stackoverflow.com/questions/") > -1) {
 		chrome.pageAction.show(tabId);
 		chrome.tabs.executeScript(null, { file: "js/content.min.js" });
	}
});
