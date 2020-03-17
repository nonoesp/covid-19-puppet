gif:
	@mkdir bin || true
	@convert -geometry 1000x500 -delay 1x4 screens/*.png bin/covid.gif
