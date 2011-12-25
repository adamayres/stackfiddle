#
# Make file to combine, uglify and lint JS libs
#

build: slmin sfmin sfbmin

INTRO_FILE = templates/intro
NEWLINE_FILE = templates/newline
INDEX_START_FILE = templates/index_start
INDEX_END_FILE = templates/index_end
INDEX_FILE = build/index.html
COPY_YEAR = $(shell date "+%Y")
DATE = $(shell date)

SF = stackfiddle
SF_FILE = src/${SF}.js
SF_MIN_FILE = build/${SF}.min.js

SFB = stackfiddle-bookmarklet
SFB_FILE = src/${SFB}.js
SFB_MIN_FILE = build/${SFB}.min.js

SL = scriptloader
SL_FILE = src/${SL}.js
SL_MIN_FILE = build/${SL}.min.js

#
# build_intro (library title, path to lib, path to file, path to min file)
#

define build_intro

sed -e 's/@DATE/${DATE}/' \
		-e 's/@COPY_YEAR/${COPY_YEAR}/' \
		-e 's/@LIB/${1}/' \
		-e 's/@PATH/${2}/' \
	${INTRO_FILE} > ${INTRO_FILE}.tmp
	
uglifyjs -nc ${3} > ${4}
cat ${INTRO_FILE}.tmp ${4} > ${4}.tmp
mv ${4}.tmp ${4}
rm -rf ${INTRO_FILE}.tmp

endef

define combine

cat ${1} ${NEWLINE_FILE} ${2} > ${2}.tmp
mv ${2}.tmp ${2}
rm -rf ${2}.tmp

endef

define escape

sed -e s/\'/\\\\\'/g \
	-e s/\"/\'/g \
	${1} > ${1}.tmp

mv ${1}.tmp ${1}	
rm -rf ${1}.tmp

endef

define build_link

#sed -e 's/\\/\\\\/g' \
#	-e 's/\//\\\//g' \
#	-e 's/&/\\\&/g' \
#	${1} > ${1}.tmp

#sed -e 's/@SCRIPT/$(shell cat ${1}.tmp)/' \
#	${INDEX_FILE} > ${INDEX_FILE}.tmp

#mv ${INDEX_FILE}.tmp index.html	
#rm -rf ${INDEX_FILE}.tmp
#rm -rf ${1}.tmp

cat ${INDEX_START_FILE} ${1} ${INDEX_END_FILE} > ${INDEX_FILE}

endef
	
sfmin:
	$(call build_intro,StackFiddle,stackfiddle,${SF_FILE},${SF_MIN_FILE})
	$(call combine,${SL_MIN_FILE},${SF_MIN_FILE})
	
slmin:
	$(call build_intro,Scriptloader,scriptloader,${SL_FILE},${SL_MIN_FILE})
		
sflint:
	jslint ${SF_FILE}

sfbmin: 
	uglifyjs -nc ${SFB_FILE} > ${SFB_MIN_FILE}
	$(call escape,${SFB_MIN_FILE})
	$(call build_link,${SFB_MIN_FILE})
	
sfblint:
	jslint ${SFB_FILE}