/*
 * Initialize stackfiddle for use by a bookmarklet.
 */
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

var toggle = function(hover, codeIndex) {
	$(getCodes()[i]).toggleClass("sf-highlight");
}

var isOpen = false,
	dialog;

/*
 * Opens the dialog
 */
var openDialog = function(content) {
	if (isOpen !== true) {
		isOpen = true;
		
		/*
		 * We need to recreate the dialog object each time the 
		 * dialog is open since jQuery simplemodal destroys
		 * the contents of the dialog when it is closed.
		 */
		dialog = content.modal({
			closeHTML: null,
			overlayId: "sf-overlay",
			containerId: "sf-container",
			opacity: 10,
			minWidth: 350,
			autoPosition: false,
			onOpen: function(dialogObj) {
				dialogObj.overlay.fadeIn(200, function () {
					dialogObj.data.show();
					dialogObj.container.css({
						height: "auto",
						top: "30px",
						right: "30px",
						left: "auto",
						position: "absolute"
					});
					dialogObj.container.show();
				});
			},
			onClose: function(dialogObj) {
				isOpen = false;
				dialog.close();
			}
		});
	}
};

var loaderDisplay = document.getElementById("sf-loader");
loaderDisplay.parentNode.removeChild(loaderDisplay);

ScriptLoader.addCss("http://stackfiddle.com/css/stackfiddle.css");
StackFiddle.init({
	stackUrl: window.location.pathname,
	scripts: ["http://stackfiddle.com/js/libs/jquery.simplemodal.min.js"],
	onMouseoverCode: toggle,
	onMouseoutCode: toggle,
	openDialog: openDialog
});

})();
