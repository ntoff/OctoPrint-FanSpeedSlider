/*
 * Author: ntoff
 * License: AGPLv3
 */
$(function() {

	function FanSliderPluginViewModel(parameters) {
		//'use strict';
		var self = this;

		self.settings = parameters[0];
		self.control = parameters[1];
		self.loginState = parameters[2];

		//fanSpeed = ko.observable("0");
		self.control.fanSpeed = new ko.observable("100");
		self.control.minFanSpeed = new ko.observable("000");
		self.control.maxFanSpeed = new ko.observable("100");
		self.control.notifyDelay = new ko.observable("3000"); //time in milliseconds

        self.showNotify = function(self,options) {
			options.hide = true;
			options.title = "Fan Speed Control";
			options.delay =  self.control.notifyDelay();
			options.type = "info";
			if (options.delay != "0") {
				new PNotify(options);
			}
            
        };
		
		//send gcode to set fan speed TODO: not be a global function
		sendFanSpeed = ko.pureComputed(function () {
			self.speed = self.control.fanSpeed() * 255 / 100 //don't forget to limit this to 2 decimal places at some point.
			if (self.control.fanSpeed() < self.control.minFanSpeed() && self.control.fanSpeed() != "0") {
				self.control.fanSpeed(self.control.minFanSpeed());
				var options = {
					text: 'Fan speed increased to meet minimum requirement.',
				}
				self.showNotify(self,options);
				console.log("Fan Speed Control Plugin: " + self.control.fanSpeed() + "% is less than the minimum speed set in the fan control settings, increasing to " + self.control.minFanSpeed() + "%");
			}
			else {
				if (self.control.fanSpeed() > self.control.maxFanSpeed()) {
					self.control.fanSpeed(self.control.maxFanSpeed());
					var options = {
						text: 'Fan speed decreased to meet minimum requirement.',
					}
					self.showNotify(self,options);
					console.log("Fan Speed Control Plugin: " + self.control.fanSpeed() + "% is more than the maximum speed set in the fan control settings, decreasing to " + self.control.maxFanSpeed() + "%");
				}
			}
			self.control.sendCustomCommand({ command: "M106 S" + self.speed });
		});
		//ph34r
		try {
			//extra classes, I hate using this but it makes finding the buttons easier
			$("#control > div.jog-panel").eq(0).addClass("controls");
			$("#control > div.jog-panel").eq(1).addClass("tools");
			$("#control > div.jog-panel").eq(2).addClass("general");	
			//If not TouchUI then remove standard buttons + add slider + new buttons
			if ($("#touch body").length ==0 ) { 
				//add ID to buttons 
				$("#control > div.general").find("button").eq(0).attr("id", "motors-off");
				$("#control > div.general").find("button").eq(1).attr("id", "fan-on");
				$("#control > div.general").find("button").eq(2).attr("id", "fan-off");
				//remove original fan on/off buttons
				$("#fan-on").remove();
				$("#fan-off").remove();
				//add new fan controls
				$("#control > div.jog-panel.general").find("button").eq(0).before("\
					<input type=\"number\" style=\"width: 90px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
					<button class=\"btn btn-block control-box\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { sendFanSpeed() }\">" + gettext("Fan") + ":<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
					<button class=\"btn btn-block control-box\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendCustomCommand({ type: 'command', commands: ['M106 S0'] }) }\">" + gettext("Fan off") + "</button>\
				");
			} else { //if TouchUI is active we only add the speed input + fan on button in a new section.
				console.log("Fan Speed Slider: NOTICE! TouchUI is active, adding simplified control.");
				$("#control > div.jog-panel.general").after("\
				<div id=\"control-fan-slider\" class=\"jog-panel filament\" data-bind=\"visible: loginState.isUser\">\
					<div>\
						<input type=\"number\" style=\"width: 150px\" data-bind=\"slider: {min: 00, max: 255, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
						<button class=\"btn btn-block control-box\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { sendFanSpeed() }\">" + gettext("Fan Speed(%)") + "</button>\
					</div>\
				</div>\
			");
			}
		}
		catch(error) {
			console.log(error);
		}
		//retrieve settings
		self.onBeforeBinding = function() {
			self.control.fanSpeed(self.settings.settings.plugins.fanspeedslider.defaultFanSpeed());
			self.control.minFanSpeed(self.settings.settings.plugins.fanspeedslider.minSpeed());
			self.control.maxFanSpeed(self.settings.settings.plugins.fanspeedslider.maxSpeed());
			self.control.notifyDelay(self.settings.settings.plugins.fanspeedslider.notifyDelay());
		}
		//update settings in case user changes them, otherwise a refresh of the UI is required
		self.onSettingsHidden = function() {
			self.control.minFanSpeed(self.settings.settings.plugins.fanspeedslider.minSpeed());
			self.control.maxFanSpeed(self.settings.settings.plugins.fanspeedslider.maxSpeed());
			self.control.notifyDelay(self.settings.settings.plugins.fanspeedslider.notifyDelay());
		}
	}	

	OCTOPRINT_VIEWMODELS.push({
        construct: FanSliderPluginViewModel,
        additionalNames: [],
        dependencies: ["settingsViewModel", "controlViewModel", "loginStateViewModel"],
        optional: [],
        elements: []
	});
});