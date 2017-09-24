# Fan Speed Slider Plugin

Add a slider to control the speed of a parts cooling fan.

![](./image/slider.JPG)

## Usage

Slide the slider, click the button. There really isn't much else to do :)

The default value of the slider is user configurable, this is the value that the slider will be set to upon loading OctoPrint's UI, and any time you refresh the page. 

The minimum fan speed setting will limit how slow the fan runs, this is useful since some fans don't work below a certain speed.

The maximum fan speed setting will limit how fast the fan runs, this is useful if your fan is too strong, or you wish to limit the speed post-slice without having to re-slice your file.

*Note: Slider does __not__ follow the speed of the fan. If the fan speed is set via gcode or an LCD panel on the printer, the slider will not respond to the change. It is a __setting__, not an indicator, and functions the same way the feedrate and flowrate sliders do.*

## Setup

Install manually using this URL:

    https://github.com/ntoff/OctoPrint-fanspeedslider/archive/master.zip

