chrome.tabs.getSelected(null, function(tab) {
	var toggle = function(hover, codeIndex) {
		chrome.tabs.sendRequest(tab.id, { hover: hover, codeIndex: codeIndex });
	}
	
	StackFiddle.init({
		stackUrl: tab.url,
		scripts: [],
		onMouseoverCode: toggle,
		onMouseoutCode: toggle,
		openDialog: function(content) {
			$("#sf-container").empty().append(content);	
		}
	});
});