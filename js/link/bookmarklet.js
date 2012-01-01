(function(d) {
    if (!window.StackFiddle) {
    	var loadingElement = d.body.appendChild(d.createElement("div"));
	    loadingElement.id = "sf-loader";
	    loadingElement.setAttribute("style", "position:fixed; left:50%; top:0px; width:100%;");
	    loadingElement.innerHTML = "<div style='position:relative; right:50%; font-weight:bold; padding:5px; background:#FFF1A8;'><div>Loading Stack Fiddle Libs...</div></div>";
    	d.body.appendChild(d.createElement("script")).src = "http://localhost:8000/js/min/sl-sf-link.min.js";
    	//d.body.appendChild(d.createElement("script")).src = "http://localhost:8000/js/scriptloader.js";
    	//d.body.appendChild(d.createElement("script")).src = "http://localhost:8000/js/stackfiddle.js";
    	//d.body.appendChild(d.createElement("script")).src = "http://localhost:8000/js/link/stackfiddle-link.js";
    } else {
    	StackFiddle.openDialog();
    }
})(document);