/*
 * Launches the stackfiddle bookmarklet.
 */
(function(d) {
    if (!window.StackFiddle) {
    	var loadingElement = d.body.appendChild(d.createElement("div"));
	    loadingElement.id = "sf-loader";
	    loadingElement.setAttribute("style", "position:fixed; left:50%; top:0px; width:100%;");
	    loadingElement.innerHTML = "<div style='position:relative; right:50%; font-weight:bold; padding:5px; background:#FFF1A8;'><div>Loading Stack Fiddle Libs...</div></div>";
    	d.body.appendChild(d.createElement("script")).src = "http://stackfiddle.com/js/min/sl-sf-link.min.js";
    } else {
    	StackFiddle.openDialog();
    }
})(document);