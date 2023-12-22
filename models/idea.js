const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Armoire', 'Etagère'],
    required: true,
  },
  materials: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
    },
  ],
  keywords: [String],
});

const Idea = mongoose.model('Idea', ideaSchema);

module.exports = Idea;
