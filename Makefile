#
# Make file to combine, uglify and lint JS libs
#

build: slmin sfmin bookmin chromemin

INTRO_FILE = templates/intro
NEWLINE_FILE = templates/newline
INDEX_START_FILE = templates/index_start
INDEX_END_FILE = templates/index_end
INDEX_FILE = build/index.html
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
	
uglifyjs -nc ${2}src/${3}.js > ${2}build/${3}.min.js
cat ${INTRO_FILE}.tmp ${2}build/${3}.min.js > ${2}build/${3}.min.js.tmp
mv ${2}build/${3}.min.js.tmp ${2}build/${3}.min.js
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

for file in src/*; do \
	y=$${file%.*}.min.js; \
	z=$${y##*/}; \
	uglifyjs -nc $${file} > build/$${z}; \
done

endef
	
sfmin:
	$(call build_intro,StackFiddle,,stackfiddle)
	$(call build_intro,StackFiddle Link,,stackfiddle-link)
	$(call combine,build/scriptloader.min.js,build/stackfiddle.min.js,build/sl-sf.min.js)
	$(call combine,build/sl-sf.min.js,build/stackfiddle-link.min.js,build/sl-sf-link.min.js)
	
sflint:
	jslint src/stackfiddle.js

slmin:
	$(call build_intro,Scriptloader,,scriptloader)
		
sllint:
	jslint src/scriptloader.js

bookmin: 
	uglifyjs -nc src/bookmarklet.js > build/bookmarklet.min.js
	$(call escape,build/bookmarklet.min.js)
	$(call build_link,build/bookmarklet.min.js)
	
booklint:
	jslint src/bookmarklet.js
	
chromemin:
	$(call build_intro,StackFiddle Content Script,chrome/,content)
	$(call build_intro,StackFiddle Background,chrome/,background)
	$(call build_intro,StackFiddle Chrome Init,chrome/,stackfiddle-chrome)
	$(call combine,build/sl-sf.min.js,chrome/build/stackfiddle-chrome.min.js,chrome/build/sl-sf-chrome.min.js)
	cp css/stackfiddle.css chrome/css/stackfiddle.css
	
minall:
	#$(call build_all,/src/*)