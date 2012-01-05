#
# Make file to combine, uglify and lint JS libs
#
build: sfmin bookmin booklink chrome cleanup

#
# Builds the intros for each JavaScript file
#
# build_intro (library title, root, path to lib)
#
define build_intro

INTRO_FILE = templates/intro
COPY_YEAR = $(shell date "+%Y")
DATE = $(shell date)

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

#
# Combines files with newlines
#
# combine (first file, second file, output file)
#
define combine

cat ${1} templates/newline ${2} > ${3}

endef

#
# URL encodes JavaScript for use in HTML as a String
#
# urlencode (file)
#
define urlencode

cat ${1} | python -c 'import sys,urllib;print urllib.quote(sys.stdin.read().strip())' > ${1}.tmp
mv ${1}.tmp ${1}	
rm -rf ${1}.tmp

endef

#
# Creates the anchor tag for the bookmarklet
#
# build_link (file)
#
define build_link

cat templates/index_start ${1} templates/index_end > test/index.html

endef

#
# Minifies all files in the src dir into the build dir.
# Renames the files to be filename.min.js
#
# build_all()
#
define build_all

for file in js/*; do \
	y=$${file%.*}.min.js; \
	z=$${y##*/}; \
	uglifyjs -nc $${file} > build/$${z}; \
done

endef
	
sf: 
	$(call combine,js/scriptloader.js,js/stackfiddle.js,js/sl-sf.js)
	$(call combine,js/sl-sf.js,js/link/stackfiddle-link.js,js/sl-sf-link.js)

sfmin:
	$(call build_intro,Scriptloader,,scriptloader)
	$(call build_intro,StackFiddle,,stackfiddle)
	$(call build_intro,StackFiddle Link,link/,stackfiddle-link)
	
	$(call combine,js/scriptloader.js,js/stackfiddle.js,js/sl-sf.js)
	$(call combine,js/sl-sf.js,js/link/stackfiddle-link.js,js/sl-sf-link.js)
	
	$(call combine,js/min/scriptloader.min.js,js/min/stackfiddle.min.js,js/min/sl-sf.min.js)
	$(call combine,js/min/sl-sf.min.js,js/min/stackfiddle-link.min.js,js/min/sl-sf-link.min.js)
	
bookmin: 
	uglifyjs -nc js/link/bookmarklet.js > js/min/bookmarklet.min.js
	$(call urlencode,js/min/bookmarklet.min.js)
	
booklink:
	$(call build_link,js/min/bookmarklet.min.js)

chrome:
	$(call build_intro,StackFiddle Content Script,chrome/,content)
	$(call build_intro,StackFiddle Background,chrome/,background)
	$(call build_intro,StackFiddle Chrome Init,chrome/,stackfiddle-chrome)
	
	$(call combine,js/min/sl-sf.min.js,js/min/stackfiddle-chrome.min.js,js/min/sl-sf-chrome.min.js)
	
	$(call combine,js/sl-sf.js,js/chrome/stackfiddle-chrome.js,js/sl-sf-chrome.js)
	
	cp css/stackfiddle.css chrome/css/stackfiddle.css
	
	mv js/min/background.min.js chrome/js/background.min.js
	mv js/min/content.min.js chrome/js/content.min.js
	mv js/min/sl-sf-chrome.min.js chrome/js/sl-sf-chrome.min.js
	mv js/sl-sf-chrome.js chrome/js/sl-sf-chrome.js
	
	zip -r chrome/stackfiddle-chrome-ext.zip chrome/

cleanup:
	rm -rf js/min/scriptloader.min.js
	rm -rf js/min/stackfiddle.min.js
	rm -rf js/min/bookmarklet.min.js
	rm -rf js/min/sl-sf.min.js
	rm -rf js/min/stackfiddle-link.min.js
	rm -rf js/min/stackfiddle-chrome.min.js
	rm -rf js/sl-sf.js
	
minall:
	#$(call build_all,/js/*)
	
sflint:
	jslint js/stackfiddle.js

sllint:
	jslint js/scriptloader.js
	
booklint:
	jslint js/bookmarklet.js
	