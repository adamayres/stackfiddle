javascript: (function(d) {
    var loadingElement = d.body.appendChild(d.createElement("div"));
    loadingElement.id = 'sf-loader';
    loadingElement.setAttribute("style", "position:absolute; top:0px; width:100%;");
    loadingElement.innerHTML = "<div style='display:inline-block; font-weight:bold; padding:5px; background:#FFF1A8;'>Loading Stack Fiddle Libs...</div>";
    d.body.appendChild(d.createElement("script")).src = "http://stackfiddle.com/js/stack-fiddle.min.js";
})(document);