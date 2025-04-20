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
      .populate('supervisor', 'name lastName')
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
      .populate('supervisor', 'name lastName')
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
      name,
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
        name: `${name} ${lastName}`,
        email,
        password: password || 'changeme123', // Default password if not provided
        role: role || 'employee'
      });
      
      await user.save();
      userId = user.id;
    }
    
    // Create new employee
    const employee = new Employee({
      name,
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
    await employee.populate('department', 'name')
      .populate('position', 'designation')
      .populate('supervisor', 'name lastName')
      .populate('user', 'email role')
      .execPopulate();
    
    res.status(201).json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const {
      name,
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
    if (email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Employee with this email already exists' });
      }
      
      // Update associated user email if exists
      if (employee.user) {
        const user = await User.findById(employee.user);
        if (user) {
          user.email = email;
          user.name = `${name || employee.name} ${lastName || employee.lastName}`;
          await user.save();
        }
      }
    }
    
    // Update employee fields
    employee.name = name || employee.name;
    employee.lastName = lastName || employee.lastName;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    employee.birthday = birthday || employee.birthday;
    employee.sexe = sexe || employee.sexe;
    if (avatar) employee.avatar = avatar;
    employee.hireDate = hireDate || employee.hireDate;
    employee.endContract = endContract || employee.endContract;
    if (departmentId) employee.department = departmentId;
    if (positionId) employee.position = positionId;
    if (supervisorId) employee.supervisor = supervisorId;
    employee.additionalInfos = additionalInfos || employee.additionalInfos;
    
    await employee.save();
    
    // Populate employee data
    await employee.populate('department', 'name')
      .populate('position', 'designation')
      .populate('supervisor', 'name lastName')
      .populate('user', 'email role')
      .execPopulate();
    
    res.json(employee);
  } catch (err) {
    console.error(err.message);
    
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
    
    await employee.remove();
    
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
      .populate('supervisor', 'name lastName');
    
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
      .populate('supervisor', 'name lastName');
    
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};