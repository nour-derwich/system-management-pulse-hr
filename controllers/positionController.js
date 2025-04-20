const Position = require('../models/Position');
const Employee = require('../models/Employee');

// Get all positions
exports.getPositions = async (req, res) => {
  try {
    const positions = await Position.find().sort({ designation: 1 });
    
    res.json(positions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get position by ID
exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.json(position);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Create position
exports.createPosition = async (req, res) => {
  try {
    const { designation } = req.body;
    
    // Check if position already exists
    const existingPosition = await Position.findOne({ designation });
    if (existingPosition) {
      return res.status(400).json({ message: 'Position already exists' });
    }
    
    const position = new Position({
      designation
    });
    
    await position.save();
    
    res.status(201).json(position);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update position
exports.updatePosition = async (req, res) => {
  try {
    const { designation } = req.body;
    
    const position = await Position.findById(req.params.id);
    
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    // Check if updated designation already exists (ignore current position)
    if (designation && designation !== position.designation) {
      const existingPosition = await Position.findOne({ designation });
      if (existingPosition) {
        return res.status(400).json({ message: 'Position already exists' });
      }
    }
    
    position.designation = designation || position.designation;
    
    await position.save();
    
    res.json(position);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Delete position
exports.deletePosition = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    // Update employees' position to null
    await Employee.updateMany(
      { position: position.id },
      { $set: { position: null } }
    );
    
    await position.remove();
    
    res.json({ message: 'Position deleted' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.status(500).send('Server error');
  }
};