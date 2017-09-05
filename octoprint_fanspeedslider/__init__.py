# coding=utf-8
from __future__ import absolute_import

from decimal import *
import re
import octoprint.plugin

class FanSliderPlugin(octoprint.plugin.StartupPlugin,
					octoprint.plugin.TemplatePlugin,
					octoprint.plugin.SettingsPlugin,
					octoprint.plugin.AssetPlugin):

	def on_after_startup(self):
		self.get_settings_updates()

	def get_settings_defaults(self):
		return dict(
			fanSpeed=100,
			minSpeed=0,
			maxSpeed=100
		)

	def on_settings_save(self, data):
		octoprint.plugin.SettingsPlugin.on_settings_save(self, data)
		self.get_settings_updates()

	def get_assets(self):
		return dict(
			js=["js/fanslider.js"],
			css=["css/style.css"]
		)
	
	def get_template_configs(self):
		return [
			dict(type="settings", custom_bindings=False)
		]

	def get_settings_updates(self):
		self.fanSpeed = self._settings.get(["fanSpeed"])
		self.minSpeed = self._settings.get(["minSpeed"])
		self.maxSpeed = self._settings.get(["maxSpeed"])
		
		getcontext().prec=5 #sets precision for "Decimal" not sure if this'll cause conflicts, ideas?
		self.minPWM = Decimal( Decimal(self.minSpeed) * Decimal(2.55) )
		self.maxPWM = Decimal( Decimal(self.maxSpeed) * Decimal(2.55) )

	def rewrite_m106(self, comm_instance, phase, cmd, cmd_type, gcode, *args, **kwargs):
		if gcode and gcode.startswith('M106'):
			fanPwm = re.search("S(\d+.\d+)", cmd)
			if fanPwm and fanPwm.group(1):
				fanPwm = fanPwm.group(1)
				if Decimal(fanPwm) < self.minPWM and Decimal(fanPwm) != 0:
					self._logger.info("fan pwm value " + str(fanPwm) + " is below threshold, increasing to " + str(self.minPWM))
	 				cmd = "M106 S" + str(self.minPWM)
					return cmd,
				elif Decimal(fanPwm) > self.maxPWM:
					self._logger.info("fan pwm value " + str(fanPwm) + " is above threshold, decreasing to " + str(self.maxPWM))
					cmd = "M106 S" + str(self.maxPWM)
					return cmd,

	def get_update_information(self):
		return dict(
			fanspeedslider=dict(
				displayName="Fan Speed Control",
				displayVersion=self._plugin_version,

				# version check: github repository
				type="github_release",
				user="ntoff",
				repo="OctoPrint-FanSpeedSlider",
				current=self._plugin_version,

				# update method: pip
				pip="https://github.com/ntoff/OctoPrint-FanSpeedSlider/archive/{target_version}.zip"
			)
		)

__plugin_name__ = "Fan Speed Control"

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = __plugin_implementation__ = FanSliderPlugin()
	
	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.comm.protocol.gcode.queuing": __plugin_implementation__.rewrite_m106,
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}