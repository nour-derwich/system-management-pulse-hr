const Department = require('../models/Department');
const Employee = require('../models/Employee');

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'name lastName');
    
    res.json(departments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('manager', 'name lastName');
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json(department);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Create department
exports.createDepartment = async (req, res) => {
  try {
    const { name, location, managerId } = req.body;
    
    const department = new Department({
      name,
      location,
      manager: managerId
    });
    
    await department.save();
    
    res.status(201).json(department);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { name, location, managerId } = req.body;
    
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    department.name = name || department.name;
    department.location = location !== undefined ? location : department.location;
    if (managerId) department.manager = managerId;
    
    await department.save();
    
    res.json(department);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Update employees' department to null
    await Employee.updateMany(
      { department: department.id },
      { $set: { department: null } }
    );
    
    await department.remove();
    
    res.json({ message: 'Department deleted' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Get employees in department
exports.getDepartmentEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ department: req.params.id })
      .populate('position', 'designation')
      .populate('supervisor', 'name lastName');
    
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};