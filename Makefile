build: sfmin sfbmin

INTRO_FILE = src/intro
COMMA = ,
COPY_YEAR = $(shell date "+%Y")
DATE = $(shell date)

SF = stackfiddle
SF_FILE = src/${SF}.js
SF_MIN_FILE = build/${SF}.min.js

SFB = stackfiddle-bookmarklet
SFB_FILE = src/${SFB}.js
SFB_MIN_FILE = build/${SFB}.min.js

define build_intro

sed -e 's/@DATE/${DATE}/' \
		-e 's/@COPY_YEAR/${COPY_YEAR}/' \
		-e 's/@LIB/${1}/' \
		-e 's/@DEP/${2}/' \
		-e 's/@PATH/${3}/' \
	${INTRO_FILE} > ${INTRO_FILE}.tmp
	
uglifyjs -nc ${4} > ${5}
cat ${INTRO_FILE}.tmp ${5} > ${5}.tmp
mv ${5}.tmp ${5}
rm -rf ${INTRO_FILE}.tmp

endef
	
sfmin:
	$(call build_intro,Stack Fiddle,,${SF},${SF_FILE},${SF_MIN_FILE})
	
sflint:
	jslint ${SF_FILE}

sfbmin: 
	uglifyjs -nc ${SFB_FILE} > ${SFB_MIN_FILE}
	
sfblint:
	jslint ${SFB_FILE}