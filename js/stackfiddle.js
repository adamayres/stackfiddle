/**
 * StackFiddle
 *    https://github.com/adamayres/
 *  
 * Copyright (c) 2011, Adam Ayres 
 * 
 * Licensed under the MIT license:
 *    https://github.com/adamayres/stackfiddle/raw/master/MIT-LICENSE.txt
 * 
 * Overview:
 *    The StackFiddle bookmarklet is used to quickly create jsFiddles
 *    from a StackOverflow question that contains code blocks of 
 *    HTML, JavaScript and CSS.
 */
var StackFiddle = function() {
	var content,
		
		params = {
			stackUrl: "", //the URL to get the stackoverflow question ID from
			scripts: [], //additional scripts to be loaded
			onMouseoverCode: function(){}, //callback when a code block is moused over
			onMouseoutCode: function(){}, //callback when a code block is moused out
			onCloseLinkClick: function() {}, //callback when close link is clicked
			openDialog: function(){} //function call to open the dialog
		}

		isInit = false;
	
	/*
	 * Loads the JavaScript and CSS needed for the bookmarklet.
	 */
	var loadScripts = function(callback) {
		var jQueryJsUrl = "http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js",
			i = 0;
		
		var loadAdditionalScripts = function() {
			if (i < params.scripts.length) {
				ScriptLoader.addJs(params.scripts[i++], loadAdditionalScripts);
			} else {
				callback();
			}
		}
				
		if (!(window.hasOwnProperty("jQuery") && 
				ScriptLoader.isVersionLoaded(window.jQuery.fn.jquery, "1.4.4"))) {
			ScriptLoader.addJs(jQueryJsUrl, loadAdditionalScripts);
		} else {
			loadAdditionalScripts();
		}
	}
	
	/*
	 * Creates the HTML for the bookmarklet and loads the 
	 * list of available jsFiddle JavaScript frameworks.
	 */
	var init = function(paramsArg) {
		if (isInit !== true) {
			isInit = true;
			
			for (a in paramsArg) {
				params[a] = paramsArg[a];
			}
			
			loadScripts(function() {
				content = $(contentTemplate);
				var form = content.find("#sf-form");
				
				content.find("#sf-close-link").click(params.onCloseLinkClick);
				
				updateFormWithFiddleFrameworks(form);
				updateFormWithCodeBlocks(form);
				
				params.openDialog(content);
			});
		} else {
			params.openDialog(content);
		}
	}
	
	/*
	 * The markup for the bookmarklet dialog. This is created in JavaScript
	 * in the absence of a proper server side framework.
	 */
	var contentTemplate = "" +
		"<div id='sf-wrapper'>" +
			"<div id='sf-header'>" +
				"<div id='sf-close'><a id='sf-close-link' href='#' class='simplemodal-close'>close</a></div>" +
				"<div id='sf-title'>Stack Fiddle It!</div>" +
			"</div>" +
			"<div id='sf-feedback'>Loading...</div>"  +
			"<div id='sf-content'>" +
				"<form id='sf-form' method='post' action='http://jsfiddle.net/api/post/mootools/1.3.2/' target='_blank'>" +
					"<div id='sf-code' />" +
					"<div class='sf-form-group'>" +
						"<label for='sf-frameworks'>Framework</label>" +
						"<select id='sf-frameworks'><option>Loading...</option></select>" +
					"</div>" +
					"<input type='submit' value='Fiddle It!' id='sf-submit' />" +
				"</form>" +
			"</div>" +
		"</div>";
	
	/*
	 * The markup for form inputs that contain the stackoverflow code blocks.
	 * This is created in JavaScript in the absence of a proper server side framework.
	 */
	var codeSubFormTemplate = "" +
		"<div class='sf-form-group'>" +
			"<label class='sf-code-label' />" +
			"<textarea />" +
			"<input type='radio' value='html' id='sf-code-html' />" +
			"<label for='sf-code-html'>HTML</label>" +
			"<input type='radio' value='css' id='sf-code-css' />" +
			"<label for='sf-code-css'>CSS</label>" +
			"<input type='radio' value='js' id='sf-code-js' />" +
			"<label for='sf-code-js'>JS</label>" +
			"<input type='radio' value='none' id='sf-code-none' />" +
			"<label for='sf-code-none'>None</label>" +
			"<div class='sf-show-container'>" +
				"<a href='#' class='sf-show-more sf-show'>More</a> | " +
				"<a href='#' class='sf-show-less sf-show'>Less</a>" +
			"</div>" +
		"</div>";
		
	/*
	 * Load the stackoverflow code blocks, using their REST API, and 
	 * populate the bookmarklet form inputs with the code snippets
	 * in the question.
	 */
	var updateFormWithCodeBlocks = function(form) {
		/*
		 * Get the stackoverflow question id from the URL.
		 */	
		var getStackQuestionId = function() {
			var id = 5365997; //5297586; //5269290; //for debugging locally
			var urlParams = params.stackUrl.split("/");
			for (var i = 0; i < urlParams.length; i++) {
			    if (urlParams[i] == "questions" && i+1 < urlParams.length) {
			        id = urlParams[i+1];
			        break;
			    }
			}
			return id;
		};
		
		/*
		 * Setup functionality for the show more/less links.
		 */
		var initShowMoreLink = function(showLessLink, showMoreLink, textarea) {	
			var textareaElement = textarea.get(0),
				originalHeight = textarea.height();
			 
		    if (textarea.height() === textareaElement.scrollHeight) {
		        while (textarea.height() === textareaElement.scrollHeight) {
		            textarea.height(textarea.height() - 1);
		        } 
		        textarea.height(textarea.height() + 2);
		    }
		    showMoreLink.click(function() {
				textarea.animate({ height: "+=100px" }, 200);
				return false;
		    });
		    
		    showLessLink.click(function() {
				textarea.animate({ height: textarea.height() <= 100 ? 10 : "-=100px" }, 200);
				return false;
		    });
		};
		
		/*
		 * Load stack overflow question for current page
		 */
		$.ajax({
			url: "http://api.stackoverflow.com/1.1/questions/" + getStackQuestionId() + "?body=true",
			dataType: "jsonp",
			jsonp: "jsonp",
			success: function(data) {
				var question = data.questions[0].body,
					codeBlocks = $(question).find("code"),
					code = content.find("#sf-code"),
					radios = $(":input[type='radio']", form[0]),
					feedback = content.find("#sf-feedback");
					
				var stackPageCodeBlocks = $("#question").find("code").map(function() {
				    codeParent = $(this).parent("pre");
				    return codeParent.size() > 0 ? codeParent.get() : this;
				});
				
				codeBlocks.each(function(i) {
					var codeSubForm = $(codeSubFormTemplate),
						textarea = codeSubForm.find("textarea"),
						showMoreLink = codeSubForm.find(".sf-show-more"),
						showLessLink = codeSubForm.find(".sf-show-less");
					 
					textarea.html($(this).html());
					codeSubForm.find(".sf-code-label").html("Code Block " + (i + 1));
					codeSubForm.find("input").each(function() {
						this.id = this.id + i;
						this.name = "code" + i;
					});
					codeSubForm.find("label").each(function() {
						var label = $(this);
						label.attr("for", label.attr("for") + i);
					});
					
					code.append(codeSubForm);
					
					//initShowMoreLink(showLessLink, showMoreLink, textarea);
					
					codeSubForm.hover(function() {
						params.onMouseoverCode(true, i);
					}, function () {
						params.onMouseoutCode(false, i);
					});
				});
				
				radios.live("click", function() {
					var input = $(this);
						textarea = input.siblings("textarea");
					
					if (input.val() == "none") {
						textarea.attr("disabled", "disabled");
					} else {
						textarea.removeAttr("disabled");
						textarea.attr("name", input.val());
					}
				});
				
				form.submit(function() {
					var types = {},
						textareas = form.find("textarea");
					
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
					
//					setTimeout(function() {
//						dialog.close();	
//					}, 300);
				});
				
				feedback.text("Choose a content type for each code block");
			}
		});
	};
		
	/*
	 * Loads the jsFiddle JavaScript frameworks. Uses YQL to 
	 * scrape the jsFiddle page for the list of allowed 
	 * JavaScript frameworks and updates the bookmarklet
	 * with the values.
	 */
	var updateFormWithFiddleFrameworks = function(form) {
		/*
		 * YQL query: select * from html where url="http://jsfiddle.net" and xpath="//select[@id='js_lib']"
		 */
		var fiddleLibsUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fjsfiddle.net%22%20and%20xpath%3D%22%2F%2Fselect%5B%40id%3D'js_lib'%5D%22&diagnostics=true";
		
		$.ajax({
			url: fiddleLibsUrl,
			dataType: "jsonp",
			success: function(data) {
				var select = $(data.results[0]),
					options = select.find("option"),
					optGroups = select.find("optgroup"),
					frameworks = form.find("#sf-frameworks");
				
				options.each(function() {
					var option = $(this),
						value = option.text().replace(/[A-Za-z ()\-]*/g, "");

					if (value === "") {
						option.remove();
					} else {
						option.val("/" + option.closest("optgroup").attr("label") + "/" + value + "/");
					}
				});
				
				optGroups.each(function() {
					var optGroup = $(this);
					if (optGroup.children().size() === 0) {
						optGroup.remove();
					}
				});
				
				frameworks.replaceWith(select);

				select.change(function() {
					form.attr("action", "http://jsfiddle.net/api/post" + select.val());
				});
			}
		});
	};
	
	return {
		init: init,
		openDialog: function() {
			params.openDialog(content);
		}
	}
}();
