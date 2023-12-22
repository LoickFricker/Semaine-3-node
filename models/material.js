// models/material.js
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Bois', 'Fer', 'Plastique'],
    required: true,
  },
  supplier: {
    type: String,
    required: true,
  },
});

materialSchema.pre('save', function (next) {

  if (['frêne', 'chêne', 'noyer'].includes(this.name.toLowerCase())) {
    this.supplier = 'BBois';
  } else if (['acier', 'inox', 'aluminium'].includes(this.name.toLowerCase())) {
    this.supplier = 'MetaLo';
  } else if (this.type.toLowerCase() === 'plastique') {
    this.supplier = 'pPlastique';
  } else {
    this.supplier = 'FournisseurInconnu';
  }

  next();
});

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;
