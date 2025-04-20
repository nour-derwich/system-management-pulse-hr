const Position = require('../models/Position');
const Employee = require('../models/Employee');

/**
 * Get all positions
 */
exports.getPositions = async (req, res) => {
  try {
    const positions = await Position.find().sort({ name: 1 });
    res.status(200).json(positions);
  } catch (error) {
    console.error('Error getting positions:', error);
    res.status(500).json({ message: 'Error retrieving positions', error: error.message });
  }
};

/**
 * Get position by ID
 */
exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.status(200).json(position);
  } catch (error) {
    console.error('Error getting position by ID:', error);
    res.status(500).json({ message: 'Error retrieving position', error: error.message });
  }
};

/**
 * Create new position
 */
exports.createPosition = async (req, res) => {
  try {
    const { name, description, department, salary } = req.body;
    
    // Basic validation
    if (!name) {
      return res.status(400).json({ message: 'Position name is required' });
    }
    
    // Check if position already exists
    const existingPosition = await Position.findOne({ name, department });
    if (existingPosition) {
      return res.status(400).json({ message: 'Position already exists in this department' });
    }
    
    // Create new position
    const position = new Position({
      name,
      description,
      department,
      salary
    });
    
    await position.save();
    res.status(201).json({ message: 'Position created successfully', position });
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({ message: 'Error creating position', error: error.message });
  }
};

/**
 * Update position
 */
exports.updatePosition = async (req, res) => {
  try {
    const { name, description, department, salary } = req.body;
    
    // Find and update position
    const updatedPosition = await Position.findByIdAndUpdate(
      req.params.id,
      { name, description, department, salary },
      { new: true, runValidators: true }
    );
    
    if (!updatedPosition) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.status(200).json({ message: 'Position updated successfully', position: updatedPosition });
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ message: 'Error updating position', error: error.message });
  }
};

/**
 * Delete position
 */
exports.deletePosition = async (req, res) => {
  try {
    // Check if position has employees assigned
    const employeesWithPosition = await Employee.countDocuments({ position: req.params.id });
    
    if (employeesWithPosition > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete position with assigned employees',
        count: employeesWithPosition
      });
    }
    
    // Delete position
    const deletedPosition = await Position.findByIdAndDelete(req.params.id);
    
    if (!deletedPosition) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.status(200).json({ message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ message: 'Error deleting position', error: error.message });
  }
};

/**
 * Get employees with this position
 */
exports.getPositionEmployees = async (req, res) => {
  try {
    // Verify position exists
    const position = await Position.findById(req.params.id);
    
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    // Find employees with this position
    const employees = await Employee.find({ position: req.params.id })
      .populate('department')
      .populate('user', 'name email');
    
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error getting position employees:', error);
    res.status(500).json({ message: 'Error retrieving employees', error: error.message });
  }
};