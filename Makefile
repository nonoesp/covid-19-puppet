gif:
	@mkdir bin || true
	@convert -geometry 1000x500 -delay 1x10 screens/*.png bin/covid.gif

sgif:
	@mkdir bin || true
	@convert -geometry 800x400 -delay 1x3 screens/selection/*.png bin/covid-selection.gif
	@open bin

run:
	@clear && node index.js