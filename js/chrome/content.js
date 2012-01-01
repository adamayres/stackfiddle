(function() {
	var codes;
	
	var getCodes = function() {
		if (codes) {
			return codes;
		}
		codes = [];
		var question = document.getElementById("question");
		var nodeList = question.getElementsByTagName("code");
		
		for (i = 0; i < nodeList.length; i++) {
			if (nodeList[i].parentNode.tagName.toLowerCase() === "pre") {
				codes.push(nodeList[i]);				
			}
		}
		return codes;
	}

	chrome.extension.onRequest.addListener(function(request, sender) {
		var selectedCode = getCodes()[request.codeIndex];		
		selectedCode.parentNode.setAttribute("style", request.hover === true ? "background-color: #ffff99" : "");
		selectedCode.setAttribute("style", request.hover === true ? "background-color: #ffff99" : "");
	});	
	
})();
