/**
 * Script Loader
 *    https://github.com/adamayres/
 *  
 * Copyright (c) 2011, Adam Ayres 
 * 
 * Licensed under the MIT license:
 *    https://github.com/adamayres/stackfiddle/raw/master/MIT-LICENSE.txt
 * 
 * Overview:
 *    Loads JavaScript and CSS files. Prevents files with the same URL
 *    from being loaded more than once. Allows for a simple version check
 *    before loading assets.
 */
var ScriptLoader = function() {
	var head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement,
		loaded = {};
	
	/*
	 * Verifies the loaded library version is greater than
	 * or equal to the required version.  Assumes a version
	 * format string of <major>.<minor>.<sub-minor>
	 */
	var versionLoaded = function(libVersion, requiredVersion) {
		var valid = false,
			libVersionArray = libVersion.split("."),
			requiredVersionArray = requiredVersion.split(".");
			
		for (var i = 0; i < requiredVersionArray.length; i++) {
			if (libVersionArray[i] > requiredVersionArray[i]) {
				valid = true;
				break;
			} else if (libVersionArray[i] == requiredVersionArray[i]) {
				valid = true;
			} else {
				valid = false;
			}
		}
		return valid;
	};
	
	/*
	 * Adds an asset to the page, largely copied from the jQuery library. Allows for
	 * a callback to be called once the asset has been loaded.
	 */
	var addAsset = function(key, element, callback) {
		if (!loaded.hasOwnProperty(key)) {
			loaded[key] = false;
			// Attach handlers for all browsers
			element.onload = element.onreadystatechange = function(_, isAbort) {
				loaded[key] = true;
				if (!element.readyState || /loaded|complete/.test(element.readyState)) {
		
					// Handle memory leak in IE
					element.onload = element.onreadystatechange = null;
		
					// Remove the element
					if (head && element.parentNode) {
						//head.removeChild(element);
					}
		
					// Dereference the element
					element = undefined;
					
					if (typeof callback === "function") {
						callback();
					}
				}
			};
			head.insertBefore(element, head.firstChild);
		}
	};
	
	/*
	 * Internal method to add a JavaScript file to the head.
	 */
	var addJs = function(src, callback) {
		var script = document.createElement("script");
		script.setAttribute("async", "async");
		script.setAttribute("src", src);
		script.setAttribute("type","text/javascript");
		addAsset(src, script, callback);
	}
	
	/*
	 * Internal method to add a CSS file to the head.
	 */
	var addCss = function(href) {
		var link = document.createElement("link");
		link.setAttribute("href", href);
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		addAsset(href, link);
	}
	
	return {
		/*
		 * Adds a JavaScript file to the head, if not already loaded.
		 * A callback can be supplied one the file has loaded.
		 */
		addJs: function(src, callback) {
			addJs(src, callback);
		},
		/*
		 * Adds a CSS file to the head, if not already loaded.
		 */
		addCss: function(href) {
			addCss(href);
		},
		/*
		 * Checks is an asset is loaded based on the URL. Only
		 * checks assets loaded by the ScriptLoader.
		 */
		isAssetLoaded: function(key) {
			return loaded[key] || false;
		},
		/*
		 * Verifies the loaded library version is greater than
		 * or equal to the required version. Assumes a version
		 * format string of <major>.<minor>.<sub-minor>
		 */
		isVersionLoaded: function(libVersion, requiredVersion) {
			return versionLoaded(libVersion, requiredVersion);
		}
	};
}();
