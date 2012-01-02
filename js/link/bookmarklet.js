/*
 * Launches the stackfiddle bookmarklet.
 */
(function(d) {
    if (!window.StackFiddle) {
    	var loadingElement = d.body.appendChild(d.createElement("div"));
	    loadingElement.id = "sf-loader";
	    loadingElement.setAttribute("style", "position:fixed; left:50%; top:0px;");
	    loadingElement.innerHTML = "<div style='position:relative; right:50%; font-weight:bold; padding:5px; background:#FFF1A8;'>Loading Stack Fiddle Libs...</div>";
    	d.body.appendChild(d.createElement("script")).src = "http://stackfiddle.com/js/min/sl-sf-link.min.js";
//    	d.body.appendChild(d.createElement("script")).src = "http://localhost:8000/js/sl-sf-link.js";
    } else {
    	StackFiddle.openDialog();
    }
})(document);