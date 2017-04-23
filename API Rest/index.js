'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Usuario = require('./models/usuario')
const Grupo = require('./models/grupo')

const app = express()
const port = process.env.PORT || 3001

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

/*
 * GET /rest/usuario para obtener todos los usuarios
 */
app.get('/rest/usuario', (req, res) => {
  Usuario.find({}, (err, usuarios) => {
    if(err)
      return res.status(500).send({message: `Error al realizar la petición: ${err}`})

    if(!usuarios)
      return res.status(404).send({message: 'No se encuentran usuarios'})

    res.send(200, {usuarios})
  }).populate('group')
})

/*
 * GET /rest/usuario/:id para obtener un usuario dado su id
 */
app.get('/rest/usuario/:id', (req, res) => {
  let id = req.params.id

  Usuario.findOne({id: id}, (err, usuario) => {
    if(err)
      return res.status(500).send({message: `Error al realizar la petición: ${err}`})

    if(!usuario)
      return res.status(404).send({message: `No se encuentra el usuario con id: ${id}`})

    res.status(200).send({usuario: usuario})
  }).populate('group')
})

/*
 * GET /rest/usuario/:id/:property para obtener el valor de una propiedad
 * de un usuario dado su id y property
 */
app.get('/rest/usuario/:id/:property', (req, res) => {
  let id = req.params.id
  let property = req.params.property

  if(!property.match("self|id|alias|name|surname|age|phone|group|photo"))
    return res.status(404).send({message: `No existe la propiedad: ${property}`})

  Usuario.findOne({id: id}, (err, usuario) => {
    if(err)
      return res.status(500).send({message: `Error al realizar la petición: ${err}`})

    if(!usuario)
      return res.status(404).send({message: `No se encuentra el usuario con id: ${id}`})

    res.status(200).send({self: req.url, [`${property}`]: usuario[`${property}`]})
  })
})

/*
 * POST /rest/usuario para crear un nuevo usuario
 */
app.post('/rest/usuario', (req, res) => {
  if(req.body.alias == '' || req.body.name == '' || req.body.surname == '')
    return res.status(400).send({message: `Es obligatorio ingresar alias, name y surname`})

  if(req.body.age && req.body.age.match(/^[0-9]+$/) == null)
    return res.status(400).send({message: `La propiedad age debe ser un valor numérico positivo y se ingresó: ${req.body.age}`})

  if(req.body.phone && req.body.phone.match(/^[0-9]+$/) == null)
    return res.status(400).send({message: `La propiedad teléfono debe ser un valor numérico positivo y se ingresó: ${req.body.phone}`})

  Usuario.findOne({alias: req.body.alias}, (err, hayUsuario) => {
    if(err)
      return res.status(500).send({message: `Error al crear el usuario: ${err}`})

    if(hayUsuario)
      return res.status(400).send({message: `Ya existe un usuario con el alias: ${req.body.alias}`})

    if(req.body.group == '' || req.body.group == null)
      Usuario.findOne({}).sort({id: -1}).exec((err, usuario) => {
        let newId
        if(usuario)
          newId = parseInt(usuario.id) + 1
        else
          newId = 1

        let nuevoUsuario = new Usuario()
        nuevoUsuario.id = newId
        nuevoUsuario.self = req.url + '/' + newId
        nuevoUsuario.alias = req.body.alias
        nuevoUsuario.name = req.body.name
        nuevoUsuario.surname = req.body.surname
        nuevoUsuario.age = req.body.age
        nuevoUsuario.phone = req.body.phone
        nuevoUsuario.photo = req.body.photo

        nuevoUsuario.save((err, usuarioGuardado) => {
            if(err)
              res.status(500).send({message: `Error al guardar los datos: ${err}`})
            res.status(201).send({usuario: usuarioGuardado})
        })
      })
    else
      Grupo.findOne({name: req.body.group}, (err, hayGrupo) => {
        if(err)
          return res.status(500).send({message: `Error al crear el usuario: ${err}`})

        if(!hayGrupo)
          return res.status(400).send({message: `No existe un grupo con nombre: ${req.body.group}`})

        Usuario.findOne({}).sort({id: -1}).exec((err, usuario) => {
          let newId
          if(usuario)
            newId = parseInt(usuario.id) + 1
          else
            newId = 1

          let nuevoUsuario = new Usuario()
          nuevoUsuario.id = newId
          nuevoUsuario.self = req.url + '/' + newId
          nuevoUsuario.alias = req.body.alias
          nuevoUsuario.name = req.body.name
          nuevoUsuario.surname = req.body.surname
          nuevoUsuario.age = req.body.age
          nuevoUsuario.phone = req.body.phone
          nuevoUsuario.group = hayGrupo.id
          nuevoUsuario.photo = req.body.photo

          nuevoUsuario.save((err, usuarioGuardado) => {
              if(err)
                res.status(500).send({message: `Error al guardar los datos: ${err}`})
              res.status(201).send({usuario: usuarioGuardado})
          })
        })
      })
    })
})

/*
 * PUT /rest/usuario/:id/:property para actualizar el valor de una propiedad
 * de un usuario dado su id y property
 */
app.put('/rest/usuario/:id/:property', (req, res) => {
  let id = req.params.id
  let property = req.params.property
  let newValue = req.body[`${property}`]

  if(!property.match("self|id|alias|name|surname|age|phone|group|photo"))
    return res.status(404).send({message: `No existe la propiedad: ${property}`})

  if(property == 'id')
    return res.status(400).send({message: `El id del usuario es único y no puede modificarse`})

  if((property == 'age' || property == 'phone') && (newValue == undefined || newValue.match(/^[0-9]+$/) == null))
    return res.status(400).send({message: `La propiedad ${property} debe ser un valor numérico positivo y se ingresó: ${newValue == undefined ? 'ningún valor' : newValue}`})

  if((property == 'alias' || property == 'name' || property == 'surname') && !newValue)
    return res.status(400).send({message: `Es obligatorio ingresar la propiedad ${property}`})

  if(property == 'alias')
    Usuario.findOne({alias: newValue}, (err, hayUsuario) => {
      if(err)
        return res.status(500).send({message: `Error al crear el usuario: ${err}`})

      if(hayUsuario)
        return res.status(400).send({message: `Ya existe un usuario con el alias: ${newValue}`})

      Usuario.findOne({id: id}, (err, usuario) => {
        if(err)
          return res.status(500).send({message: `Error al modificar el usuario: ${err}`})

        if(!usuario)
          return res.status(404).send({message: `No se encuentra el usuario con id: ${id}`})

        usuario[`${property}`] = newValue
        usuario.save((err, usuarioGuardado) => {
            if(err)
              res.status(500).send({message: `Error al guardar los datos: ${err}`})
            res.status(200).send({message: `Se modificó la propiedad '${property}' por '${newValue}' del usuario con id: ${id}`})
        })
      })
    })
  else if (property == 'group')
    Grupo.findOne({name: newValue}, (err, hayGrupo) => {
      if(err)
        return res.status(500).send({message: `Error al crear el usuario: ${err}`})

      if(!hayGrupo)
        return res.status(400).send({message: `No existe un grupo con nombre: ${req.body.group}`})

      Usuario.findOne({id: id}, (err, usuario) => {
        if(err)
          return res.status(500).send({message: `Error al modificar el usuario: ${err}`})

        if(!usuario)
          return res.status(404).send({message: `No se encuentra el usuario con id: ${id}`})

        usuario[`${property}`] = hayGrupo.id
        usuario.save((err, usuarioGuardado) => {
            if(err)
              res.status(500).send({message: `Error al guardar los datos: ${err}`})
            res.status(200).send({message: `Se modificó la propiedad '${property}' por '${newValue}' del usuario con id: ${id}`})
        })
      })
    })
  else
    Usuario.findOne({id: id}, (err, usuario) => {
      if(err)
        return res.status(500).send({message: `Error al modificar el usuario: ${err}`})

      if(!usuario)
        return res.status(404).send({message: `No se encuentra el usuario con id: ${id}`})

      usuario[`${property}`] = newValue
      usuario.save((err, usuarioGuardado) => {
          if(err)
            res.status(500).send({message: `Error al guardar los datos: ${err}`})

          res.status(200).send({message: `Se modificó la propiedad '${property}' por '${newValue}' del usuario con id: ${id}`})
      })
    })
})

/*
 * DELETE /rest/usuario/:id para eliminar un usuario dado su id
 */
app.delete('/rest/usuario/:id', (req, res) => {
  let id = req.params.id

  Usuario.findOne({id: id}, (err, usuario) => {
    if(err)
      return res.status(500).send({message: `Error al eliminar el usuario: ${err}`})
    if(!usuario)
      return res.status(400).send({message: `No existe el usuario con id: ${id}`})
    usuario.remove(err => {
      if(err)
        return res.status(500).send({message: `Error al eliminar el usuario: ${err}`})
      res.status(200).send({message: `Se eliminó el usuario con id: ${id}`})
    })
  })
})

/*
 * DELETE /rest/usuario/:id/:property para eliminar una propiedad
 * de un usuario dado su id y property
 */
app.delete('/rest/usuario/:id/:property', (req, res) => {
 let id = req.params.id
 let property = req.params.property

 if(!property.match("self|id|alias|name|surname|age|phone|group|photo"))
   return res.status(404).send({message: `No existe la propiedad: ${property}`})

 if(property == 'id')
   return res.status(400).send({message: `El id del usuario es único y no puede borrarse`})

 if(property == 'alias' || property == 'name' || property == 'surname')
   return res.status(400).send({message: `La propiedad ${property} es obligatoria y no puede borrarse`})

 Usuario.findOne({id: id}, (err, usuario) => {
   if(err)
     return res.status(500).send({message: `Error al eliminar la propiedad: ${err}`})

   if(!usuario)
     return res.status(404).send({message: `No se encuentra el usuario con id: ${id}`})

   if(usuario[`${property}`] == undefined)
     return res.status(400).send({message: `El usuario no tiene la propiedad ${property}`})

   usuario[`${property}`] = undefined
   usuario.save((err, usuarioGuardado) => {
       if(err)
         res.status(500).send({message: `Error al guardar los datos: ${err}`})

       res.status(200).send({message: `Se eliminó la propiedad '${property}' del usuario con id: ${id}`})
   })
 })
})

/*
 * GET /rest/grupo para obtener todos los grupos
 */
app.get('/rest/grupo', (req, res) => {
  Grupo.find({}, (err, grupos) => {
    if(err)
      return res.status(500).send({message: `Error al realizar la petición: ${err}`})

    if(!grupos)
      return res.status(404).send({message: 'No se encuentran grupos'})

    res.send(200, {grupos})
  })
})

/*
 * POST /rest/grupo para crear un nuevo grupo
 */
app.post('/rest/grupo', (req, res) => {
  Grupo.findOne({name: req.body.name}, (err, hayGrupo) => {
    if(err)
      return res.status(500).send({message: `Error al crear el grupo: ${err}`})

    if(hayGrupo)
      return res.status(400).send({message: `Ya existe un grupo con el nombre: ${req.body.name}`})

    let nuevoGrupo = new Grupo()
    nuevoGrupo.name = req.body.name
    nuevoGrupo.self = req.url + '/' + newId

    nuevoGrupo.save((err, grupoGuardado) => {
        if(err)
          res.status(500).send({message: `Error al guardar los datos: ${err}`})
        res.status(201).send({grupo: grupoGuardado})
    })
  })
})

mongoose.connect('mongodb://localhost:27017/dedam-db', (err, res) => {
  if(err)
   return console.log(`Error al conectar con la base de datos: ${err}`)
  console.log('Conexión establecida con la base de datos')

  app.listen(port, () => {
    console.log(`API REST corriendo en http://localhost:${port}`)
  })
})
