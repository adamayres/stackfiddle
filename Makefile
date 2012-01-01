#
# Make file to combine, uglify and lint JS libs
#

build: sfmin bookmin chromemin

INTRO_FILE = templates/intro
NEWLINE_FILE = templates/newline
INDEX_START_FILE = templates/index_start
INDEX_END_FILE = templates/index_end
INDEX_FILE = test/index.html
COPY_YEAR = $(shell date "+%Y")
DATE = $(shell date)

#
# build_intro (library title, root, path to lib)
#

define build_intro

sed -e 's/@DATE/${DATE}/' \
		-e 's/@COPY_YEAR/${COPY_YEAR}/' \
		-e 's/@LIB/${1}/' \
		-e 's/@PATH/${3}/' \
	${INTRO_FILE} > ${INTRO_FILE}.tmp
	
uglifyjs -nc js/${2}${3}.js > js/min/${3}.min.js
cat ${INTRO_FILE}.tmp js/min/${3}.min.js > js/min/${3}.min.js.tmp
mv js/min/${3}.min.js.tmp js/min/${3}.min.js
rm -rf ${INTRO_FILE}.tmp

endef

define combine

cat ${1} ${NEWLINE_FILE} ${2} > ${3}

endef

#
# Escapes JavaScript for use in HTML as a String
#
define escape

sed -e s/\'/\\\\\'/g \
	-e s/\"/\'/g \
	${1} > ${1}.tmp

mv ${1}.tmp ${1}	
rm -rf ${1}.tmp

endef

#
# Creates the anchor tag for the bookmarklet
#
define build_link

cat ${INDEX_START_FILE} ${1} ${INDEX_END_FILE} > ${INDEX_FILE}

endef

#
# Minifies all files in the src dir into the build dir
#
define build_all

for file in js/*; do \
	y=$${file%.*}.min.js; \
	z=$${y##*/}; \
	uglifyjs -nc $${file} > build/$${z}; \
done

endef
	
sfmin:
	$(call build_intro,Scriptloader,,scriptloader)
	$(call build_intro,StackFiddle,,stackfiddle)
	$(call build_intro,StackFiddle Link,link/,stackfiddle-link)
	
	$(call combine,js/min/scriptloader.min.js,js/min/stackfiddle.min.js,js/min/sl-sf.min.js)
	$(call combine,js/min/sl-sf.min.js,js/min/stackfiddle-link.min.js,js/min/sl-sf-link.min.js)

bookmin: 
	uglifyjs -nc js/link/bookmarklet.js > js/min/bookmarklet.min.js
	$(call escape,js/min/bookmarklet.min.js)
	$(call build_link,js/min/bookmarklet.min.js)

chromemin:
	$(call build_intro,StackFiddle Content Script,chrome/,content)
	$(call build_intro,StackFiddle Background,chrome/,background)
	$(call build_intro,StackFiddle Chrome Init,chrome/,stackfiddle-chrome)
	
	$(call combine,js/min/sl-sf.min.js,js/min/stackfiddle-chrome.min.js,js/min/sl-sf-chrome.min.js)
	
	cp css/stackfiddle.css chrome/css/stackfiddle.css
	
	cp js/min/background.min.js chrome/js/background.min.js
	cp js/min/content.min.js chrome/js/content.min.js
	cp js/min/sl-sf-chrome.min.js chrome/js/sl-sf-chrome.min.js
	
	zip -r chrome/stackfiddle-chrome-ext.zip chrome/

cleanup:
	rm -rf build/scriptloader.min.js
	rm -rf build/stackfiddle.min.js
	rm -rf build/bookmarklet.min.js
	rm -rf build/sl-sf.min.js
	rm -rf build/stackfiddle-link.min.js
	rm -rf build/stackfiddle-chrome.min.js
	rm -rf build
	
minall:
	#$(call build_all,/js/*)
	
sflint:
	jslint js/stackfiddle.js

sllint:
	jslint js/scriptloader.js
	
booklint:
	jslint js/bookmarklet.js
	