// controllers/employeeController.js
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Position = require('../models/Position');
const User = require('../models/User');

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('department', 'name')
      .populate('position', 'designation')
      .populate('supervisor', 'firstName lastName')
      .populate('user', 'email role');
    
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('position', 'designation')
      .populate('supervisor', 'firstName lastName')
      .populate('user', 'email role');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      birthday,
      sexe,
      hireDate,
      endContract,
      departmentId,
      positionId,
      supervisorId,
      additionalInfos,
      // User account details
      createAccount,
      password,
      role
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'firstName, lastName, and email are required fields' });
    }
    
    // Check if employee email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }
    
    let userId = null;
    
    // Create user account if requested
    if (createAccount) {
      // Check if user email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      // Create new user
      const user = new User({
        name: `${firstName} ${lastName}`,
        email,
        password: password || 'changeme123', // Default password if not provided
        role: role || 'employee'
      });
      
      await user.save();
      userId = user.id;
    }
    
    // Create new employee
    const employee = new Employee({
      firstName,
      lastName,
      email,
      phone,
      birthday,
      sexe,
      hireDate,
      endContract,
      department: departmentId,
      position: positionId,
      supervisor: supervisorId,
      additionalInfos,
      user: userId
    });
    
    await employee.save();
    
    // Populate employee data
    const populatedEmployee = await Employee.findById(employee._id)
      .populate('department', 'name')
      .populate('position', 'designation')
      .populate('supervisor', 'firstName lastName')
      .populate('user', 'email role');
    
    res.status(201).json(populatedEmployee);
  } catch (err) {
    console.error('Error creating employee:', err.message);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: 'Validation error', errors: validationErrors });
    }
    
    res.status(500).send('Server error');
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      birthday,
      sexe,
      avatar,
      hireDate,
      endContract,
      departmentId,
      positionId,
      supervisorId,
      additionalInfos
    } = req.body;
    
    // Find employee
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if email is being changed and already exists
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email, _id: { $ne: req.params.id } });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Employee with this email already exists' });
      }
      
      // Update associated user email if exists
      if (employee.user) {
        const user = await User.findById(employee.user);
        if (user) {
          user.email = email;
          user.name = `${firstName || employee.firstName} ${lastName || employee.lastName}`;
          await user.save();
        }
      }
    }
    
    // Update employee fields
    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (email) employee.email = email;
    if (phone !== undefined) employee.phone = phone;
    if (birthday) employee.birthday = birthday;
    if (sexe) employee.sexe = sexe;
    if (avatar) employee.avatar = avatar;
    if (hireDate) employee.hireDate = hireDate;
    if (endContract) employee.endContract = endContract;
    if (departmentId) employee.department = departmentId;
    if (positionId) employee.position = positionId;
    if (supervisorId) employee.supervisor = supervisorId;
    if (additionalInfos !== undefined) employee.additionalInfos = additionalInfos;
    
    await employee.save();
    
    // Populate employee data
    const updatedEmployee = await Employee.findById(employee._id)
      .populate('department', 'name')
      .populate('position', 'designation')
      .populate('supervisor', 'firstName lastName')
      .populate('user', 'email role');
    
    res.json(updatedEmployee);
  } catch (err) {
    console.error(err.message);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: 'Validation error', errors: validationErrors });
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Delete associated user account if exists
    if (employee.user) {
      await User.findByIdAndDelete(employee.user);
    }
    
    await Employee.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Employee removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Get employees by department
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    
    const employees = await Employee.find({ department: departmentId })
      .populate('position', 'designation')
      .populate('supervisor', 'firstName lastName');
    
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get employees by position
exports.getEmployeesByPosition = async (req, res) => {
  try {
    const positionId = req.params.positionId;
    
    const employees = await Employee.find({ position: positionId })
      .populate('department', 'name')
      .populate('supervisor', 'firstName lastName');
    
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};