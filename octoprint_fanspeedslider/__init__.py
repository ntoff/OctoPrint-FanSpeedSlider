# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin

class FanSliderPlugin(octoprint.plugin.StartupPlugin,
					octoprint.plugin.TemplatePlugin,
					octoprint.plugin.SettingsPlugin,
					octoprint.plugin.AssetPlugin):

	def get_settings_defaults(self):
		return dict(fanSpeed="255")

	def get_assets(self):
		return dict(
			js=["js/fanslider.js"],
			css=["css/style.css"]
		)
	
	def get_update_information(self):
		return dict(
			fanspeedslider=dict(
				displayName="Fan Speed Slider",
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
__plugin_name__ = "Fan Speed Slider"
__plugin_implementation__ = FanSliderPlugin()
__plugin_hooks__ = {
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}