const Settings = require('../models/Settings');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });

    // If settings don't exist for the user, create default ones
    if (!settings) {
      settings = await Settings.create({ user: req.user.id });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { gstSettings, printSettings, invoiceSettings } = req.body;

    let settings = await Settings.findOne({ user: req.user.id });

    if (!settings) {
      settings = new Settings({ user: req.user.id });
    }

    if (gstSettings) settings.gstSettings = { ...settings.gstSettings, ...gstSettings };
    if (printSettings) settings.printSettings = { ...settings.printSettings, ...printSettings };
    if (invoiceSettings) settings.invoiceSettings = { ...settings.invoiceSettings, ...invoiceSettings };

    const updatedSettings = await settings.save();
    res.status(200).json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
