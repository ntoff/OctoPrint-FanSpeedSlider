/*
 * Author: ntoff
 * License: AGPLv3
 */
$(function() {

	function FanSliderPluginViewModel(parameters) {
		var self = this;

		self.settings = parameters[0];
		self.control = parameters[1];
		self.loginState = parameters[2];

		fanSpeed = ko.observable(undefined);

		//convert percentage into PWM
		self.fanPWM = ko.pureComputed(function () {
			self.speed = fanSpeed() * 255 / 100 //don't forget to limit this to 2 decimal places at some point.
			return self.speed;
		});
		//send gcode to set fan speed
		sendFanSpeed = function () {
			self.control.sendCustomCommand({ command: "M106 S" + self.fanPWM() });
		};	
		//extra classes		
		$("#control > div.jog-panel").eq(0).addClass("controls");
		$("#control > div.jog-panel").eq(1).addClass("tools");
		$("#control > div.jog-panel").eq(2).addClass("general");	
		//If !TouchUI then remove standard buttons + add slider + new buttons
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
				<button class=\"btn btn-block control-box\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { sendFanSpeed() }\">" + gettext("Fan on") + ":<span data-bind=\"text: fanSpeed() + '%'\"></span></button>\
				<button class=\"btn btn-block control-box\" data-bind=\"enable: isOperational() && loginState.isUser(), click: function() { $root.sendCustomCommand({ type: 'command', commands: ['M106 S0'] }) }\">" + gettext("Fan off") + "</button>\
			");
		} else { //if TouchUI is active we only add the speed input + fan on button in a new section.
			console.log("Fan Speed Slider: NOTICE! TouchUI is active, adding simplified control.");
			$("#control > div.jog-panel.general").after("\
			<div id=\"control-fan-slider\" class=\"jog-panel filament\" data-bind=\"visible: loginState.isUser\">\
				<div>\
					<input type=\"number\" style=\"width: 150px\" data-bind=\"slider: {min: 00, max: 255, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
					<button class=\"btn btn-block control-box\" data-bind=\"enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { sendFanSpeed() }\">" + gettext("Fan Speed(%)") + "</button>\
				</div>\
			</div>\
		");
		}
		//retrieve settings
		self.onBeforeBinding = function() {
			fanSpeed(self.settings.settings.plugins.fanspeedslider.defaultFanSpeed());
		}
	}	
		OCTOPRINT_VIEWMODELS.push([
			FanSliderPluginViewModel,
		["settingsViewModel", "controlViewModel", "loginStateViewModel"]
	]);
});