/*
 * Initialize stackfiddle for use by a bookmarklet.
 */
(function() {

var scripts = [],
	loaderDisplay = document.getElementById("sf-loader");

loaderDisplay.parentNode.removeChild(loaderDisplay);

if (!(window.hasOwnProperty("jQuery") && 
		ScriptLoader.isVersionLoaded(window.jQuery.fn.jquery, "1.6.0"))) {
	scripts.push("http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js");
}

scripts.push("http://stackfiddle.com/js/libs/jquery.simplemodal.min.js");
scripts.push("http://stackfiddle.com/js/libs/jquery.nanoscroller.js");
		
StackFiddle.init({
	scripts: scripts,
	css: ["http://stackfiddle.com/css/stackfiddle.css"],
	dataType: "jsonp"
});

})();
