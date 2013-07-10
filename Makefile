all: css/inquiry.css

watch: all
	@inotifywait -q -m -e close_write css/*.css | while read line; do make --no-print-directory all; done;

css/inquiry.css: css/inquiry.less
	node_modules/.bin/lessc css/inquiry.less > css/inquiry.css
