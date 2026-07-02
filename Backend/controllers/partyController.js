const Party = require('../models/Party');

// @desc    Get all parties for the user
// @route   GET /api/parties
// @access  Private
const getParties = async (req, res) => {
  try {
    const ownerId = (req.user.role === 'staff' ? req.user.ownerId : req.user.id).toString();

    const parties = await Party.find({ user: ownerId }).sort({ createdAt: -1 });
    res.status(200).json(parties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new party
// @route   POST /api/parties
// @access  Private
const createParty = async (req, res) => {
  try {
    const ownerId = (req.user.role === 'staff' ? req.user.ownerId : req.user.id).toString();

    const { name, phone, type, gstin, address, balance, balanceType } = req.body;

    if (!name || !phone || !type) {
      return res.status(400).json({ message: 'Name, phone, and type are required' });
    }

    const party = await Party.create({
      user: ownerId,
      name,
      phone,
      type,
      gstin,
      address,
      balance,
      balanceType
    });

    res.status(201).json(party);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a party
// @route   PUT /api/parties/:id
// @access  Private
const updateParty = async (req, res) => {
  try {
    const ownerId = (req.user.role === 'staff' ? req.user.ownerId : req.user.id).toString();

    const party = await Party.findById(req.params.id);

    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }

    // Make sure the logged in user matches the party user
    if (party.user.toString() !== ownerId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedParty = await Party.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedParty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a party
// @route   DELETE /api/parties/:id
// @access  Private
const deleteParty = async (req, res) => {
  try {
    const ownerId = (req.user.role === 'staff' ? req.user.ownerId : req.user.id).toString();

    const party = await Party.findById(req.params.id);

    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }

    if (party.user.toString() !== ownerId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await party.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getParties,
  createParty,
  updateParty,
  deleteParty
};
