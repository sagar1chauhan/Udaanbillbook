const PartyType = require('../models/PartyType');

// @desc    Get all party types for the user (seeds defaults Customer/Supplier if none exist)
// @route   GET /api/party-types
// @access  Private
const getPartyTypes = async (req, res) => {
  try {
    let types = await PartyType.find({ user: req.user.id }).sort({ name: 1 });
    if (types.length === 0) {
      const defaults = [
        { user: req.user.id, name: 'Customer' },
        { user: req.user.id, name: 'Supplier' }
      ];
      await PartyType.insertMany(defaults);
      types = await PartyType.find({ user: req.user.id }).sort({ name: 1 });
    }
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new custom party type
// @route   POST /api/party-types
// @access  Private
const createPartyType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Party type name is required' });
    }

    const trimmedName = name.trim();
    // Prevent duplicate name check for current user
    const existing = await PartyType.findOne({ user: req.user.id, name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Party type already exists' });
    }

    const newType = await PartyType.create({
      user: req.user.id,
      name: trimmedName
    });

    res.status(201).json(newType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPartyTypes,
  createPartyType
};
