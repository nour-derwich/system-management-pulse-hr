const KanbanBoard = require('../models/KanbanBoard');
const KanbanColumn = require('../models/KanbanColumn');
const KanbanTask = require('../models/KanbanTask');
const KanbanTag = require('../models/KanbanTag');

// Board Controllers
exports.createBoard = async (req, res) => {
  try {
    const { name, description, departmentId } = req.body;
    
    const board = new KanbanBoard({
      name,
      description,
      department: departmentId,
      createdBy: req.user.id
    });
    
    await board.save();
    
    // Create default columns
    const columns = [
      { title: 'To Do', board: board.id, order: 0 },
      { title: 'In Progress', board: board.id, order: 1 },
      { title: 'Done', board: board.id, order: 2 }
    ];
    
    await KanbanColumn.insertMany(columns);
    
    res.status(201).json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getBoards = async (req, res) => {
  try {
    const boards = await KanbanBoard.find()
      .populate('department', 'name')
      .populate('createdBy', 'name');
    
    res.json(boards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getBoardById = async (req, res) => {
  try {
    const board = await KanbanBoard.findById(req.params.id)
      .populate('department', 'name')
      .populate('createdBy', 'name');
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json(board);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.status(500).send('Server error');
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { name, description, departmentId } = req.body;
    
    const board = await KanbanBoard.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    board.name = name || board.name;
    board.description = description || board.description;
    board.department = departmentId || board.department;
    
    await board.save();
    
    res.json(board);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.status(500).send('Server error');
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await KanbanBoard.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Delete associated columns and tasks
    const columns = await KanbanColumn.find({ board: board.id });
    for (const column of columns) {
      await KanbanTask.deleteMany({ column: column.id });
      await column.remove();
    }
    
    await board.remove();
    
    res.json({ message: 'Board deleted' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Column Controllers
exports.getColumns = async (req, res) => {
  try {
    const columns = await KanbanColumn.find({ board: req.params.boardId })
      .sort({ order: 1 });
    
    res.json(columns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createColumn = async (req, res) => {
  try {
    const { title } = req.body;
    const boardId = req.params.boardId;
    
    // Find the highest order value
    const maxOrder = await KanbanColumn.findOne({ board: boardId })
      .sort({ order: -1 })
      .select('order');
    
    const order = maxOrder ? maxOrder.order + 1 : 0;
    
    const column = new KanbanColumn({
      title,
      board: boardId,
      order
    });
    
    await column.save();
    
    res.status(201).json(column);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateColumn = async (req, res) => {
  try {
    const { title, order } = req.body;
    
    const column = await KanbanColumn.findById(req.params.columnId);
    
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }
    
    column.title = title || column.title;
    if (order !== undefined) {
      column.order = order;
    }
    
    await column.save();
    
    res.json(column);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Column not found' });
    }
    
    res.status(500).send('Server error');
  }
};

exports.deleteColumn = async (req, res) => {
  try {
    const column = await KanbanColumn.findById(req.params.columnId);
    
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }
    
    // Delete associated tasks
    await KanbanTask.deleteMany({ column: column.id });
    
    await column.remove();
    
    res.json({ message: 'Column deleted' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Column not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// Task Controllers
exports.getTasks = async (req, res) => {
  try {
    const columnId = req.params.columnId;
    
    const tasks = await KanbanTask.find({ column: columnId })
      .sort({ displayOrder: 1 })
      .populate('assignedTo', 'name lastName avatar')
      .populate('tags', 'title color');
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      tags,
      dueDate
    } = req.body;
    
    const columnId = req.params.columnId;
    
    // Find the highest display order value
    const maxOrder = await KanbanTask.findOne({ column: columnId })
      .sort({ displayOrder: -1 })
      .select('displayOrder');
    
    const displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;
    
    const task = new KanbanTask({
      title,
      description,
      column: columnId,
      displayOrder,
      assignedTo,
      tags,
      dueDate,
      createdBy: req.user.id
    });
    
    await task.save();
    
    // Populate the saved task
    await task.populate('assignedTo', 'name lastName avatar')
      .populate('tags', 'title color')
      .execPopulate();
    
    res.status(201).json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      tags,
      dueDate,
      displayOrder
    } = req.body;
    
    const task = await KanbanTask.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (tags) task.tags = tags;
    if (dueDate) task.dueDate = dueDate;
    if (displayOrder !== undefined) task.displayOrder = displayOrder;
    
    await task.save();
    
    // Populate the updated task
    await task.populate('assignedTo', 'name lastName avatar')
      .populate('tags', 'title color')
      .execPopulate();
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(500).send('Server error');
  }
};

exports.moveTask = async (req, res) => {
  try {
    const { fromColumnId, toColumnId, displayOrder } = req.body;
    
    const task = await KanbanTask.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update column and order
    task.column = toColumnId;
    task.displayOrder = displayOrder;
    
    await task.save();
    
    // If needed, reorder other tasks in both columns
    if (fromColumnId !== toColumnId) {
      // Reorder tasks in the source column
      const sourceTasks = await KanbanTask.find({ 
        column: fromColumnId,
        displayOrder: { $gt: task.displayOrder }
      });
      
      for (const sourceTask of sourceTasks) {
        sourceTask.displayOrder -= 1;
        await sourceTask.save();
      }
    }
    
    // Reorder tasks in the destination column
       const destTasks = await KanbanTask.find({
      column: toColumnId,
      _id: { $ne: task._id },
      displayOrder: { $gte: displayOrder }
    });
    
    for (const destTask of destTasks) {
      destTask.displayOrder += 1;
      await destTask.save();
    }
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(500).send('Server error');
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await KanbanTask.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const columnId = task.column;
    const displayOrder = task.displayOrder;
    
    await task.remove();
    
    // Reorder remaining tasks in the column
    const tasks = await KanbanTask.find({
      column: columnId,
      displayOrder: { $gt: displayOrder }
    });
    
    for (const t of tasks) {
      t.displayOrder -= 1;
      await t.save();
    }
    
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(500).send('Server error');
  }
};

