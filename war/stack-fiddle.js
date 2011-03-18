(function() {
	var sfDialog = function() {
		var dialog;
		var content;
		var form;
		var code;
		var feedback;
		var fiddleFrameworks;
		var baseFiddleApiUri = "http://jsfiddle.net/api/post";
		var defaultFiddleApiUri = baseFiddleApiUri + "/mootools/1.3.1/";
		
		var contentTemplate = "" +
			"<div id='sf-wrapper'>" +
				"<div id='sf-header'>" +
					"<div id='sf-close'><a href='#' class='simplemodal-close'>close</a></div>" +
					"<div id='sf-title'>Stack Fiddle It!</div>" +
				"</div>" +
				"<div id='sf-feedback'>Loading...</div>"  +
				"<div id='sf-content'>" +
					"<form id='sf-form' method='post' action='" + defaultFiddleApiUri + "'>" +
						"<div id='sf-code' />" +
						"<div class='sf-form-group'>" +
							"<label for='sf-frameworks'>Framework</label>" +
							"<select id='sf-frameworks'><option>Loading...</option></select>" +
						"</div>" +
						"<input type='submit' value='Fiddle It!' id='sf-submit' />" +
					"</form>" +
				"</div>" +
			"</div>";
		
		var codeSubFormTemplate = "" +
			"<div class='sf-form-group'>" +
				"<label class='sf-code-label' />" +
				"<textarea />" +
				"<input type='radio' value='html' id='sf-code-html' />" +
				"<label for='sf-code-html' id='sf-code-html'>HTML</label>" +
				"<input type='radio' value='css' id='sf-code-css' />" +
				"<label for='sf-code-css' id='sf-code-css'>CSS</label>" +
				"<input type='radio' value='js' id='sf-code-js' />" +
				"<label for='sf-code-js' id='sf-code-js'>JS</label>" +
				"<input type='radio' value='none' id='sf-code-none' />" +
				"<label for='sf-code-none' id='sf-code-none'>None</label>" +
				"<a href='#' class='sf-show-more'>Show More</a>" +
			"</div>";
			
		var getStackQuestionId = function() {
			var id = 5297586; //5269290; //for debugging locally
			var params = window.location.pathname.split("/");
			for (var i = 0; i < params.length; i++) {
			    if (params[i] == "questions" && i+1 < params.length) {
			        id = params[i+1];
			    }
			}
			return id;
		};
			
		var loadStackCodeBlocks = function() {
			/*
			 * Load stack overflow question for current page
			 */
			$.ajax({
				url: "http://api.stackoverflow.com/1.1/questions/" + getStackQuestionId() + "?body=true",
				dataType: "jsonp",
				jsonp: "jsonp",
				success: function(data) {
					var question = data.questions[0].body;
					var codeBlocks = $(question).find("code");
										
					form.css({
						position: "absolute",
						left:-9999
					}).show();
					
					codeBlocks.each(function(i) {
						var codeSubForm = $(codeSubFormTemplate);
						var textarea = codeSubForm.find("textarea");
						var showMoreLink = codeSubForm.find(".sf-show-more");
						 
						textarea.html($(this).html());
						codeSubForm.find(".sf-code-label").html("Code Block " + (i + 1));
						codeSubForm.find("input").each(function() {
							this.id = this.id + i;
							this.name = "code" + i;
						});
						codeSubForm.find("label").each(function() {
							$(this).attr("for", $(this).attr("for") + i);
						});
						
						code.append(codeSubForm);
						
						initShowMoreLink(showMoreLink, textarea);
					});
					
					$(":input[type='radio']", form[0]).live("click", function() {
						var input = $(this);
						var textarea = $(this).siblings("textarea");
						if (input.val() == "none") {
							textarea.attr("disabled", "disabled");
						} else {
							textarea.removeAttr("disabled");
							textarea.attr("name", input.val());
						}
					});
					
					form.submit(function() {
						var types = {};
						
						var textareas = form.find("textarea");
						
						$.each(["html", "css", "js"], function(i, type) {
							var textTypes = textareas.filter("[name='" + this + "']");
							
							if (textTypes.size() > 1) {
								var contentValue = "";
								textTypes.each(function() {
									var curTextarea = $(this);
									contentValue += curTextarea.val();
									curTextarea.attr("disabled", "disabled");
								});
								
								var hiddenInput = $("<input>", { 
									type: "hidden",
									"name": type,
									value: contentValue
								});
								form.append(hiddenInput);
							}
						});
					});
					
					var originalHeight = form.height();
					
					form.height(0).css({
						position: "static",
						left:0
					});

					form.animate({ height: originalHeight }, 200);
					form.show();
					
					feedback.text("Choose a content type for each code block");
				}
			});
		};
		
		var initShowMoreLink = function(showMoreLink, textarea) {	
			var textareaElement = textarea.get(0);
			var originalHeight = textarea.height(); 
		    if (textarea.height() === textareaElement.scrollHeight) {
		        showMoreLink.remove();
		        while (textarea.height() === textareaElement.scrollHeight) {
		            textarea.height(textarea.height() - 1);
		        } 
		        textarea.height(textarea.height() + 2);
		    } else {
				showMoreLink.click(function() {
					var link = $(this);
					var scrollHeight = textareaElement.scrollHeight;
					var viewHeight = textarea.height();
					var scrollRemaining = viewHeight >= scrollHeight ? 0 : scrollHeight - viewHeight; 
					var expandSize = 0;
					
					if (scrollRemaining >= 100) {
						expandSize = viewHeight + 100;
					} else if (scrollRemaining === 0) {
						expandSize = (originalHeight > viewHeight - 100) ? originalHeight : viewHeight - 100;
					} else {
						expandSize = viewHeight + scrollRemaining;
					}
					
					textarea.animate({ height: expandSize}, 300, function() {
						if (textarea.height() >= scrollHeight) {
							link.html("Show Less");
						} else {
							link.html("Show More");
						}
					});
					return false;
				});	
		    }
		};
		
		var loadFiddleFrameworks = function(parentObj) {
			//query: select * from html where url="http://jsfiddle.net" and xpath="//select[@id='js_lib']"
			var fiddleLibsUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fjsfiddle.net%22%20and%20xpath%3D%22%2F%2Fselect%5B%40id%3D'js_lib'%5D%22&diagnostics=true";
			$.ajax({
				url: fiddleLibsUrl,
				dataType: "jsonp",
				success: function(data) {
					var select = $(data.results[0]);
					
					select.find("option").each(function() {
						var option = $(this);
						var value = option.text().replace(/[A-Za-z ()\-]*/g, "");

						if (value === "") {
							option.remove();
						} else {
							option.val("/" + option.closest("optgroup").attr("label") + "/" + value + "/");
						}
					});
					
					select.find("optgroup").each(function() {
						if ($(this).children().size() === 0) {
							$(this).remove();
						}
					});
					
					fiddleFrameworks.replaceWith(select);

					select.change(function() {
						form.attr("action", baseFiddleApiUri + select.val());
					});
				}
			});
		};
		
		var openDialog = function(dialogObj) {
			dialogObj.overlay.fadeIn(200, function () {
				dialogObj.data.show();
				dialogObj.container.css("height", "auto");
				dialogObj.container.fadeIn(200, function() {
					loadStackCodeBlocks();	
				});
			});
		};
		
		return {
			init: function() {
				content = $(contentTemplate);
				form = content.find("#sf-form").hide();
				code = content.find("#sf-code");
				feedback = content.find("#sf-feedback");
				fiddleFrameworks = content.find("#sf-frameworks");
				
				loadFiddleFrameworks();
				
				dialog = content.modal({
					closeHTML: null,
					overlayId: 'sf-overlay',
					containerId: 'sf-container',
					opacity: 10,
					position: ["30px",],
					onOpen: openDialog
				});
			}
		};
	}();
	
	var scriptLoader = function() {
		var head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;
		
		var versionLoaded = function(libVersion, validVersion) {
			var valid = false;
			var libVersionArray = libVersion.split(".");
			var validVersionArray = validVersion.split(".");
			for (var i = 0; i < validVersionArray.length; i++) {
				if (libVersionArray[i] > validVersionArray[i]) {
					valid = true;
					break;
				} else if (libVersionArray[i] == validVersionArray[i]) {
					valid = true;
				} else {
					valid = false;
				}
			}
			return valid;
		};
		
		var loader = function(src, callback) {
			var load = function(element, callback) {
				// Attach handlers for all browsers
				element.onload = element.onreadystatechange = function(_, isAbort) {
					if (!element.readyState || /loaded|complete/.test(element.readyState)) {
			
						// Handle memory leak in IE
						element.onload = element.onreadystatechange = null;
			
						// Remove the element
						if (head && element.parentNode) {
							//head.removeChild(element);
						}
			
						// Dereference the element
						element = undefined;
						
						callback();
					}
				};
				head.insertBefore(element, head.firstChild);
			};
			
			return {
				js: function(src, callback) {
					var script = document.createElement("script");
					script.setAttribute("async", "async");
					script.setAttribute("src", src);
					script.setAttribute("type","text/javascript");
					load(script, callback);
				},
				css: function(href, callback) {
					var link = document.createElement("link");
					link.setAttribute("href", href);
					link.setAttribute("rel", "stylesheet");
					link.setAttribute("type", "text/css");
					load(link, callback);
				}
			};
		}();
		
		loader.css("http://stackfiddle.com/css/sf.css", function(){});
		
		var loadModalScript = function() {
			loader.js("http://stackfiddle.com/js/jquery.simplemodal.js", sfDialog.init);
		};
		
		if (!(window.hasOwnProperty("jQuery") && jQuery.fn.jquery && versionLoaded(window.jQuery.fn.jquery, "1.4.4"))) {
			loader.js("http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js", loadModalScript);
		} else {
			loadModalScript();
		}
	}();
})();