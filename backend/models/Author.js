const mongoose = require('mongoose')

const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  born: {
    type: Number,
    min: [1800, 'Too early birthyear'],
    max: [2050, 'Birthyear cannot be set in the future'],
  },
  authorOf: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
  ],
})

schema.plugin(uniqueValidator)

module.exports = mongoose.model('Author', schema)
