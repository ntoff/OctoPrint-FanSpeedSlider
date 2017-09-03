# Fan Speed Slider Plugin

Add a slider to control the speed of a parts cooling fan.

![](./image/slider.JPG)

## Usage

Slide the slider, click the button. There really isn't much else to do :)

The default value of the slider is user configurable, this is the value that the slider will be set to upon loading OctoPrint's UI, and any time you refresh the page. The default value setting does __NOT__ limit the output of the fan, if you set the default value to 10% and set the fan to 100% it will still come on at 100%. To limit the min/max speed of your fan during a print, please see your slicer's documentation and settings.

*Note: Slider does __not__ follow the speed of the fan. If the fan speed is set via gcode or an LCD panel on the printer, the slider will not respond to the change. It is a __setting__, not an indicator, and functions the same way the feedrate and flowrate sliders do.*

## Setup

Install manually using this URL:

    https://github.com/ntoff/OctoPrint-fanspeedslider/archive/master.zip

