/*
 * Initialize stackfiddle for use by a bookmarklet.
 */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	StackFiddle.init({});
});
