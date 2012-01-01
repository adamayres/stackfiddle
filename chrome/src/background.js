chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tab.url.indexOf("stackoverflow.com/questions/") > -1) {
 		chrome.pageAction.show(tabId);
 		chrome.tabs.executeScript(null, { file: "content.js" });
	}
});
