/*
 * Author: ntoff
 * License: AGPLv3
 */
$(function() {

	function FanSliderPluginViewModel(parameters) {
		'use strict';
		var self = this;

		self.settings = parameters[0];
		self.control = parameters[1];
		self.loginState = parameters[2];

		//fanSpeed = ko.observable("0");
		self.control.defaultFanSpeed = new ko.observable(100);
		self.control.fanSpeed = new ko.observable(100);
		self.control.minFanSpeed = new ko.observable(0);
		self.control.maxFanSpeed = new ko.observable(100);
		self.control.notifyDelay = new ko.observable(3000); //time in milliseconds

		self.showNotify = function(self,options) {
			options.hide = true;
			options.title = "Fan Speed Control";
			options.delay =  self.control.notifyDelay();
			options.type = "info";
			if (options.delay != "0") {
				new PNotify(options);
			}
		};

		//send gcode to set fan speed
		self.control.sendFanSpeed = ko.pureComputed(function () {
			self.speed = self.control.fanSpeed() * 255 / 100 //don't forget to limit this to 2 decimal places at some point.
			if (self.control.fanSpeed() < self.control.minFanSpeed() && self.control.fanSpeed() != "0") {
				console.log("Fan Speed Control Plugin: " + self.control.fanSpeed() + "% is less than the minimum speed ("+self.control.minFanSpeed()+"%), increasing.");
				self.control.fanSpeed(self.control.minFanSpeed());
				var options = {
					text: 'Fan speed increased to meet minimum requirement.',
				}
				self.showNotify(self,options);
			}
			else if (self.control.fanSpeed() > self.control.maxFanSpeed()) {
					console.log("Fan Speed Control Plugin: " + self.control.fanSpeed() + "% is more than the maximum speed ("+self.control.maxFanSpeed()+"%), decreasing.");
					self.control.fanSpeed(self.control.maxFanSpeed());
					var options = {
						text: 'Fan speed decreased to meet maximum requirement.',
					}
					self.showNotify(self,options);
			}
			self.control.sendCustomCommand({ command: "M106 S" + self.speed });
		});

		//ph34r
		try {
			//for some reason touchui uses "jog general" for the fan controls? Oh well, makes my job easier
			$("#control-jog-general").find("button").eq(0).attr("id", "motors-off");
			$("#control-jog-general").find("button").eq(1).attr("id", "fan-on");
			$("#control-jog-general").find("button").eq(2).attr("id", "fan-off");
			//If not TouchUI then remove standard buttons + add slider + new buttons
			if ($("#touch body").length ==0 ) { 
				//remove original fan on/off buttons
				$("#fan-on").remove();
				$("#fan-off").remove();
				//add new fan controls
				$("#control-jog-general").find("button").eq(0).before("\
					<input type=\"number\" style=\"width: 90px\" data-bind=\"slider: {min: 00, max: 100, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
					<button class=\"btn btn-block control-box\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed") + ":<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
					<button class=\"btn btn-block control-box\" id=\"fan-off\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendCustomCommand({ type: 'command', commands: ['M106 S0'] }) }\">" + gettext("Fan off") + "</button>\
				");
			} else { 
				//replace touch UI's fan on button with one that sends whatever speed is set in this plugin
				$("#fan-on").remove();
				$("#control-jog-general").find("button").eq(0).after("\
					<button class=\"btn btn-block control-box\" id=\"fan-on\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan on") + "</button>\
				");
				//also add spin box + button below in its own section, button is redundant but convenient
				$("#control-jog-extrusion").after("\
				<div id=\"control-fan-slider\" class=\"jog-panel filament\" data-bind=\"visible: loginState.isUser\">\
					<div>\
						<input type=\"number\" style=\"width: 150px\" data-bind=\"slider: {min: 00, max: 255, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
						<button class=\"btn btn-block\" style=\"width: 169px\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendFanSpeed() }\">" + gettext("Fan speed:") + "<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
					</div>\
				</div>\
			");
			}
		}
		catch(error) {
			console.log(error);
		}

		self.updateSettings = function() {
			try {
			self.control.minFanSpeed(parseInt(self.settings.settings.plugins.fanspeedslider.minSpeed()));
			self.control.maxFanSpeed(parseInt(self.settings.settings.plugins.fanspeedslider.maxSpeed()));
			self.control.notifyDelay(parseInt(self.settings.settings.plugins.fanspeedslider.notifyDelay()));
			}
			catch(error) {
				console.log(error);
			}
		}

		self.onBeforeBinding = function() {
			self.control.defaultFanSpeed(parseInt(self.settings.settings.plugins.fanspeedslider.defaultFanSpeed()));
			self.updateSettings();
			//if the default fan speed is above or below max/min then set to either max or min
			if (self.control.defaultFanSpeed() < self.control.minFanSpeed()) {
				self.control.fanSpeed(self.control.minFanSpeed());
			}
			else if (self.control.defaultFanSpeed() > self.control.maxFanSpeed()) {
				self.control.fanSpeed(self.control.maxFanSpeed());
			}
			else {
				self.control.fanSpeed(self.control.defaultFanSpeed());
			}
		}

		//update settings in case user changes them, otherwise a refresh of the UI is required
		self.onSettingsHidden = function() {
			self.updateSettings();
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