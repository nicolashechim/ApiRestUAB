'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UsuarioSchema = Schema({
  id: Number,
  self: String,
  alias: String,
  name: String,
  surname: String,
  age: Number,
  phone: Number,
  group:
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Grupo'
        },
  photo: String
})

module.exports = mongoose.model('Usuario', UsuarioSchema)
