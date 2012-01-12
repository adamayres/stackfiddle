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
		codes,
		dialog,
		isInit = false,
		params = {
			scripts: [], //additional scripts to be loaded
			css: [], //additional CSS to be loaded
			dataType: null
		},
		
		/*
		 * The markup for the bookmarklet dialog. This is created in JavaScript
		 * in the absence of a proper server side framework.
		 */
		contentTemplate = "" +
			"<div id='sf-wrapper'>" +
				"<div id='sf-header'>" +
					"<div id='sf-close'><a id='sf-close-link' href='#' class='simplemodal-close'>close</a></div>" +
					"<div id='sf-title'>StackFiddle</div>" +
				"</div>" +
				"<div id='sf-feedback'>Loading...</div>"  +
				"<div id='sf-content'>" +
					"<form id='sf-form' method='post' action='http://jsfiddle.net/api/post/mootools/1.3.2/' target='_blank'>" +
					 	"<div id='sf-code-container'>" +
							"<div id='sf-code' />" +
						"</div>" +
						"<div class='sf-form-group'>" +
							"<label for='sf-frameworks'>Framework</label>" +
							"<select id='sf-frameworks'><option>Loading...</option></select>" +
						"</div>" +
						"<input type='submit' value='Fiddle It!' id='sf-submit' />" +
					"</form>" +
				"</div>" +
			"</div>",
	
		/*
		 * The markup for form inputs that contain the stackoverflow code blocks.
		 * This is created in JavaScript in the absence of a proper server side framework.
		 */
		codeSubFormTemplate = "" +
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
	 * Loads the JavaScript and CSS needed for the bookmarklet.
	 */
	var loadScripts = function(callback) {
		var i = 0,
			scripts = [];
		
		scripts = scripts.concat(params.scripts);
		
		var loadAdditionalScripts = function() {
			if (i < scripts.length) {
				ScriptLoader.addJs(scripts[i++], loadAdditionalScripts);
			} else {
				callback();
			}
		};
		
		loadAdditionalScripts();
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
			
			for (var i = 0; i < params.css.length; i++) {
				ScriptLoader.addCss(params.css[i]);
			}
			
			loadScripts(function() {
				content = $(contentTemplate);
				var form = content.find("#sf-form"),
					frameworksSelect = form.find("#sf-frameworks");

				openDialog();
				updateFormWithFiddleFrameworks(form, frameworksSelect);
				updateFormWithCodeBlocks(form);	
				setupEventHandlers();
			});
		} else {
			openDialog();
			setupEventHandlers();
		}
	}
	
	/*
	 * Opens the dialog
	 */
	var openDialog = function() {
		/*
		 * We use a css class instead of a data attribute
		 * since the chrome ext. content script cannot 
		 * access the jQuery data added by another jQuery
		 * object.
		 */
		if ($(document.body).hasClass("StackFiddleOpen") !== true) {
			$(document.body).addClass("StackFiddleOpen");
			
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
					$(document.body).removeClass("StackFiddleOpen");
					dialog.close();
				}
			});
		}
	};
		
	var getCodes = function() {
		if (codes) {
			return codes;
		}
		codes = [];
		var question = document.getElementById("question");
		if (question) {
			var nodeList = question.getElementsByTagName("code");
			
			for (i = 0; i < nodeList.length; i++) {
				if (nodeList[i].parentNode.tagName.toLowerCase() === "pre") {
					codes.push(nodeList[i]);				
				}
			}
		}
		return codes;
	}
	
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
			var id = 5358066; //8755619; //; //5297586; //5269290; //for debugging locally
			var urlParams = window.location.pathname.split("/");
			for (var i = 0; i < urlParams.length; i++) {
			    if (urlParams[i] == "questions" && i+1 < urlParams.length) {
			        id = urlParams[i+1];
			        break;
			    }
			}
			return id;
		};
		
		var langMap = {
			js: ["$", "(", "v", ";"],
			html: ["<", "&"],
			css: [".", "#"]
		}
		
		/*
		 * Naive approach to try and determine code language through
		 * basic parsing of first valid character.
		 */
		var detectCodeLanguage = function(content, codeSubForm) {
			/*
			 * Remove comments from the content
			 */
			var firstCodeLetter = $.trim(content.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, ""))[0];
			var found = false;
			
			for (lang in langMap) {
				if ($.inArray(firstCodeLetter, langMap[lang]) > -1) {
					codeSubForm.find("input[value='" + lang + "']").prop("checked", true);
					found = true;
					break;
				}
			}
			
			/*
			 * Default to JS
			 */
			if (found === false) {
				codeSubForm.find("input[value='js']").prop("checked", true);
			}
		};
		
		/*
		 * Load stack overflow question for current page
		 */
		$.ajax({
			url: "http://api.stackoverflow.com/1.1/questions/" + getStackQuestionId() + "?body=true",
			dataType: params.dataType,
			jsonp: "jsonp",
			success: function(data) {
				var question = data.questions[0].body,
					codeBlocks = $(question).find("code"),
					code = content.find("#sf-code"),
					feedback = content.find("#sf-feedback");
					
				var stackPageCodeBlocks = $("#question").find("code").map(function() {
				    codeParent = $(this).parent("pre");
				    return codeParent.size() > 0 ? codeParent.get() : this;
				});
				
				codeBlocks.each(function(i) {
					var codeSubForm = $(codeSubFormTemplate),
						textarea = codeSubForm.find("textarea"),
						textareaElement = textarea.get(0),
						codeBlock = $(this);
					
					codeSubForm.addClass("sf-code-group");
					textarea.html(codeBlock.html());
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
					
					var resizeTextarea = function() {
						textarea.height(0).css({resize:"none"});
						var height = textarea.get(0).scrollHeight > 100 ? 100 : textarea.get(0).scrollHeight;
    					textarea.height(height).css({resize:"auto"});
					}
					
					if (!textarea.is(":hidden")) {
						resizeTextarea();
						if (codeBlocks.length == i+1) {
							resizeContainer();
						}
					} else {
						var pollerCount = 20;
						var poller = window.setInterval(function() {
							if (!textarea.is(":hidden") || pollerCount-- == 0) {
								window.clearInterval(poller);
								resizeTextarea();
								if (codeBlocks.length == i+1) {
									resizeContainer();
								}
							}
						}, 50);
					}
					
					detectCodeLanguage(textarea.html(), codeSubForm);
										
					codeSubForm.hover(function() {
						if (getCodes()[i]) {
							$(getCodes()[i].parentNode).toggleClass("sf-highlight");
						}
					});
				});
				
				feedback.text("Choose a content type for each code block");
			}
		});
	};
		
	var resizeContainer = function(scrollPosition) {
		var code = content.find("#sf-code");
		var codeContainer = content.find("#sf-code-container");
		var hasNano = code.closest("#sf-nano").size() > 0;
		
		if (code.height() > 400) {
			if (!hasNano) {
				code
					.wrap("<div class='nano-container' />")
					.wrap("<div id='sf-nano' class='nano' />")
					.wrap("<div class='content' />");
				
				code.closest(".nano-container").height(code.height() - 100);
			}
			
			var nanoContent = code.closest(".content");
			
			scrollPosition = scrollPosition ? scrollPosition.top : 0;
			
			var scrollToPosition =  scrollPosition > nanoContent.offset().top + nanoContent.height()
			                      ? { scrollTop: nanoContent.scrollTop() + 100 }
			                      : {};

			content.find("#sf-nano").nanoScroller(scrollToPosition);
		} else {
			if (hasNano) {
				codeContainer.html(code);
			}
		}
	}
	
	/*
	 * XMLSerializer polyfill
	 * 
	 * Copied from backplanejs
	 */
	if (typeof(XMLSerializer) == "undefined") {
		XMLSerializer = function() { };
	
		XMLSerializer.prototype.serializeToString = function(node) {
			if (node.xml) {
				var str = node.xml;
	
				/**
				 * MSXML likes to add a trailing CR+LF, so remove it.
				 */
				if(node.nodeType == 9) {//doc
				        //fix processing instruction, ie don't show encoding
				        str = str.replace(/<\?xml.*?\?>\r/, '<?xml ' + node.firstChild.nodeValue + '?>');
				}
				return str.replace(/\r\n$/, "")
					.replace(/( ux_uid.*?".*?")/g, "");//remove ux_uid* attributes (see UX.getNodeUID for info about this attr)
				}
			return null;
		};
	}

	/*
	 * Loads the jsFiddle JavaScript frameworks. Uses YQL to 
	 * scrape the jsFiddle page for the list of allowed 
	 * JavaScript frameworks and updates the bookmarklet
	 * with the values.
	 */
	var updateFormWithFiddleFrameworks = function(form, frameworksSelect) {
		/*
		 * YQL query: select * from html where url="http://jsfiddle.net" and xpath="//select[@id='js_lib']"
		 */
		var fiddleLibsUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fjsfiddle.net%22%20and%20xpath%3D%22%2F%2Fselect%5B%40id%3D'js_lib'%5D%22&diagnostics=true";
		var unsupportedLibs = ["Three.js (edge)", "YUI 2.8.0r4"];
	
		$.ajax({
			url: fiddleLibsUrl,
			dataType: params.dataType,
			success: function(data, textStatus, xhr) {
				var select = params.dataType === "jsonp" ? $(data.results[0]) : $(data).find("results").find("select");
				
				frameworksSelect.html(new XMLSerializer().serializeToString((select.get(0))));
					
				var options = frameworksSelect.find("option"),
					optGroups = frameworksSelect.find("optgroup");
				
				options.each(function() {
					var option = $(this),
						value = option.text().replace(/[A-Za-z ()\-]*/g, "");
					
					if (value === "" || $.inArray(value, unsupportedLibs) > -1) {
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
			}
		});
	};
	
	var setupEventHandlers = function() {
		/*
		 * Setup functionality for the show more/less links.
		 */
		 
		var form = content.find("#sf-form"),
			frameworksSelect = form.find("#sf-frameworks"),
			codeGroups = form.find(".sf-code-group");
		
		$(".sf-show-more", content[0]).live("click", function(event) {
			var link = $(this),
				textarea = link.closest(".sf-form-group").find("textarea");
			
			textarea.animate({ height: "+=100px" }, 0, function() { 
				resizeContainer(link.offset());
			});
			return false;
		});
		
		$(".sf-show-less", content[0]).live("click", function(event) {
			var link = $(this),
				textarea = link.closest(".sf-form-group").find("textarea");
				
			textarea.animate({ height: textarea.height() <= 100 ? 13 : "-=100px" }, 0, function() { 
				resizeContainer(link.offset());
			});
			return false;
		});
		
		form.submit(function() {
			var types = {},
				textareas = form.find("textarea"),
				radios = $("input:radio:checked", form);
			
			radios.each(function() {
				var input = $(this);
					textarea = input.siblings("textarea");
				
				if (input.val() == "none") {
					textarea.attr("disabled", "disabled");
				} else {
					textarea.removeAttr("disabled");
					textarea.attr("name", input.val());
				}
			});
			
			$.each(["html", "css", "js"], function(i, type) {
				var textTypes = textareas.filter("[name='" + this + "']");
				
				if (textTypes.size() > 1) {
					var contentValue = "";
					textTypes.each(function() {
						var curTextarea = $(this);
						contentValue += curTextarea.val();
						curTextarea.prop("disabled", "disabled");
					});
					
					var hiddenInput = $("<input>", { 
						type: "hidden",
						"name": type,
						value: contentValue
					});
					form.append(hiddenInput);
				}
			});
			
			form.attr("action", "http://jsfiddle.net/api/post" + frameworksSelect.val());
			
			setTimeout(function() {
				dialog.close()
			}, 300);
		});
	};
	
	return {
		init: init
	}
}();
