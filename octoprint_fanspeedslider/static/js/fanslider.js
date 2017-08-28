/*
 * 
 *
 * Author: ntoff
 * License: AGPLv3
 */
$(function() {

    function FanSliderPluginViewModel(parameters) {
		var self = this;

		self.printerstate =  parameters[0];
		self.loginstate = parameters[1];
		self.control = parameters[2]
		
		fanSpeed = ko.observable(255);
		//convert 0 - 255 to 0 - 100% for the button
		fanPercent = ko.pureComputed(function () {
			return Math.floor(fanSpeed() /255 * 100);
		});
		//set fan speed
		sendFanSpeed = function () {
			self.control.sendCustomCommand({ command: "M106 S" + fanSpeed() });
		};		
		//extra classes		
		$("#control > div.jog-panel").eq(0).addClass("controls");
		$("#control > div.jog-panel").eq(1).addClass("tools");
		$("#control > div.jog-panel").eq(2).addClass("general");
		
		//add ID to buttons 
		$("#control > div.general").find("button").eq(0).attr("id", "motors-off");
		$("#control > div.general").find("button").eq(1).attr("id", "fan-on");
		$("#control > div.general").find("button").eq(2).attr("id", "fan-off");
				
		//remove original fan on/off buttons
		$("#fan-on").remove();
		$("#fan-off").remove();
		//add new fan controls
		$("#control > div.jog-panel.general").find("button").eq(0).before("<input type=\"number\" style=\"width: 90px\" data-bind=\"slider: {min: 00, max: 255, step: 1, value: fanSpeed, tooltip: 'hide'}\">\
			<button class=\"btn btn-block control-box\" data-bind=\"enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { sendFanSpeed() }\">" + gettext("Fan on") + ":<span data-bind=\"text: fanPercent() + '%'\"></span></button>\
			<button class=\"btn btn-block control-box\" data-bind=\"enable: isOperational() && !isPrinting() && loginState.isUser(), click: function() { $root.sendCustomCommand({ type: 'command', commands: ['M106 S0'] }) }\">" + gettext("Fan off") + "</button>");

	}	
		OCTOPRINT_VIEWMODELS.push([
			FanSliderPluginViewModel,

		["printerStateViewModel", "loginStateViewModel", "controlViewModel"]
    ]);
});