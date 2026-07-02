const PartyType = require('../models/PartyType');

// @desc    Get all party types for the user (seeds defaults Customer/Supplier if none exist)
// @route   GET /api/party-types
// @access  Private
const getPartyTypes = async (req, res) => {
  try {
    const ownerId = (req.user.role === 'staff' ? req.user.ownerId : req.user.id).toString();
    let types = await PartyType.find({ user: ownerId }).sort({ name: 1 });
    if (types.length === 0) {
      const defaults = [
        { user: ownerId, name: 'Customer' },
        { user: ownerId, name: 'Supplier' }
      ];
      await PartyType.insertMany(defaults);
      types = await PartyType.find({ user: ownerId }).sort({ name: 1 });
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
    const ownerId = (req.user.role === 'staff' ? req.user.ownerId : req.user.id).toString();
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Party type name is required' });
    }

    const trimmedName = name.trim();
    // Prevent duplicate name check for current user
    const existing = await PartyType.findOne({ user: ownerId, name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Party type already exists' });
    }

    const newType = await PartyType.create({
      user: ownerId,
      name: trimmedName
    });

    res.status(201).json(newType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a party type
// @route   DELETE /api/party-types/:id
// @access  Private
const deletePartyType = async (req, res) => {
  try {
    const ownerId = (req.user.role === 'staff' ? req.user.ownerId : req.user.id).toString();
    const partyType = await PartyType.findById(req.params.id);

    if (!partyType) {
      return res.status(404).json({ message: 'Party type not found' });
    }

    if (partyType.user.toString() !== ownerId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Don't allow deleting default types
    if (['Customer', 'Supplier'].includes(partyType.name)) {
      return res.status(400).json({ message: 'Cannot delete default party types' });
    }

    await partyType.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPartyTypes,
  createPartyType,
  deletePartyType
};
