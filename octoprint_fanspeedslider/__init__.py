# coding=utf-8
from __future__ import absolute_import

from decimal import *
import re
import octoprint.plugin

class FanSliderPlugin(octoprint.plugin.StartupPlugin,
					octoprint.plugin.TemplatePlugin,
					octoprint.plugin.SettingsPlugin,
					octoprint.plugin.AssetPlugin):
					
	def __init__(self):
		self.minPWM=0,
		self.maxPWM=255,
		self.lockfan=False

	def on_after_startup(self):
		self.get_settings_updates()

	def get_settings_defaults(self):
		return dict(
			defaultFanSpeed=100,
			minSpeed=0,
			maxSpeed=100,
			notifyDelay=4000,
			lockfan=False,
			lastSentSpeed=0,
			defaultLastSpeed=False
		)

	def on_settings_save(self, data):
		s = self._settings
		if "defaultFanSpeed" in list(data.keys()):
			s.setInt(["defaultFanSpeed"], data["defaultFanSpeed"])
		if "minSpeed" in list(data.keys()):
			s.setInt(["minSpeed"], data["minSpeed"])
		if "maxSpeed" in list(data.keys()):
			s.setInt(["maxSpeed"], data["maxSpeed"])
		if "notifyDelay" in list(data.keys()):
			s.setInt(["notifyDelay"], data["notifyDelay"])
		if "lockfan" in list(data.keys()):
			s.set(["lockfan"], data["lockfan"])
		if "lastSentSpeed" in list(data.keys()):
			s.setInt(["lastSentSpeed"], data["lastSentSpeed"])
		if "defaultLastSpeed" in list(data.keys()):
			s.set(["defaultLastSpeed"], data["defaultLastSpeed"])
		self.get_settings_updates()
		#clean up settings if everything's default
		self.on_settings_cleanup()
		s.save()

	#function stolen...err borrowed :D from types.py @ 1663
	def on_settings_cleanup(self):
		import octoprint.util
		from octoprint.settings import NoSuchSettingsPath

		try:
			config = self._settings.get_all_data(merged=False, incl_defaults=False, error_on_path=True)
		except NoSuchSettingsPath:
			return

		if config is None:
			self._settings.clean_all_data()
			return

		if self.config_version_key in config and config[self.config_version_key] is None:
			del config[self.config_version_key]

		defaults = self.get_settings_defaults()
		diff = octoprint.util.dict_minimal_mergediff(defaults, config)

		if not diff:
			self._settings.clean_all_data()
		else:
			self._settings.set([], diff)

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
		self.defaultFanSpeed = self._settings.getInt(["defaultFanSpeed"])
		self.minSpeed = self._settings.getInt(["minSpeed"])
		self.maxSpeed = self._settings.getInt(["maxSpeed"])
		self.lockfan = self._settings.get(["lockfan"])

		getcontext().prec=5 #sets precision for "Decimal" not sure if this'll cause conflicts, ideas?
		self.minPWM = round( Decimal(self.minSpeed) * Decimal(2.55), 2 )
		self.maxPWM = round( Decimal(self.maxSpeed) * Decimal(2.55), 2 )

	def rewrite_m106(self, comm_instance, phase, cmd, cmd_type, gcode, *args, **kwargs):
		if gcode and gcode.startswith('M106') and not self.lockfan:
			fanPwm = re.search("S(\d+\.?\d*)", cmd)
			if fanPwm and fanPwm.group(1):
				fanPwm = fanPwm.group(1)
				if Decimal(fanPwm) < self.minPWM and Decimal(fanPwm) != 0:
					self._logger.info("fan pwm value " + str(fanPwm) + " is below threshold, increasing to " + str(self.minPWM) + " (" + str(self.minSpeed) + "%)")
					cmd = "M106 S" + str(self.minPWM)
					return cmd,
				elif Decimal(fanPwm) > self.maxPWM:
					self._logger.info("fan pwm value " + str(fanPwm) + " is above threshold, decreasing to " + str(self.maxPWM) + " (" + str(self.maxSpeed) + "%)")
					cmd = "M106 S" + str(self.maxPWM)
					return cmd,
		elif gcode and gcode.startswith(('M106', 'M107')) and self.lockfan:
			self._logger.info("A cooling fan control command was seen, but fanspeedslider is locked. Control command " + str(cmd) + " removed from queue.")
			return None,

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
__plugin_pythoncompat__ = ">=2.7,<4"

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = __plugin_implementation__ = FanSliderPlugin()
	
	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.comm.protocol.gcode.queuing": __plugin_implementation__.rewrite_m106,
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}