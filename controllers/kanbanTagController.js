const KanbanTag = require('../models/KanbanTag');
// Tag Controllers
exports.getTags = async (req, res) => {
  try {
    const tags = await KanbanTag.find();
    res.json(tags);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createTag = async (req, res) => {
  try {
    const { title, color } = req.body;
    
    const tag = new KanbanTag({
      title,
      color
    });
    
    await tag.save();
    
    res.status(201).json(tag);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { title, color } = req.body;
    
    const tag = await KanbanTag.findById(req.params.tagId);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    tag.title = title || tag.title;
    tag.color = color || tag.color;
    
    await tag.save();
    
    res.json(tag);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.status(500).send('Server error');
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tag = await KanbanTag.findById(req.params.tagId);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    await tag.remove();
    
    // Remove tag references from tasks
    await KanbanTask.updateMany(
      { tags: tag._id },
      { $pull: { tags: tag._id } }
    );
    
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.status(500).send('Server error');
  }
};
// Get tag by ID
exports.getTagById = async (req, res) => {
  try {
    const tag = await KanbanTag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.json(tag);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.status(500).send('Server error');
  }
};
// Get tasks by tag
exports.getTasksByTag = async (req, res) => {
  try {
    const tagId = req.params.id;
    
    const tasks = await KanbanTask.find({ tags: tagId })
      .populate('column', 'title board')
      .populate('assignedTo', 'name lastName avatar')
      .populate('tags', 'title color');
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};