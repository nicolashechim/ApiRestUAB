const should = require('should')
const assert = require('assert')
const request = require('supertest')

describe('API REST - Tests', function() {
  var url = 'http://localhost:3001';
  before(function(done) {
    done();
  });

  describe('Usuario', function() {
    it('Cód. 400: Crear usuario con age no numérico', function(done) {
      var usuario = {
        alias: 'nico',
        name: 'Nicolás',
        surname: 'Hechim',
        age: 'unaEdad'
      };
    request(url)
  	.post('/rest/usuario')
  	.send(usuario)
    .expect(400)
  	.end(function(err, res) {
          if (err) {
            throw err;
          }
        done();
      });
    });
    it('Cód. 400: Crear usuario sin alias', function(done) {
      var usuario = {
        name: 'Nicolás',
        surname: 'Hechim',
      };
    request(url)
  	.post('/rest/usuario')
  	.send(usuario)
    .expect(400)
  	.end(function(err, res) {
          if (err) {
            throw err;
          }
        done();
      });
    });
    it('Cód. 400: Crear usuario sin name', function(done) {
      var usuario = {
        alias: 'nico',
        surname: 'Hechim',
      };
    request(url)
  	.post('/rest/usuario')
  	.send(usuario)
    .expect(400)
  	.end(function(err, res) {
          if (err) {
            throw err;
          }
        done();
      });
    });
    it('Cód. 400: Crear usuario sin surname', function(done) {
      var usuario = {
        alias: 'nico',
        name: 'Nicolás',
      };
    request(url)
  	.post('/rest/usuario')
  	.send(usuario)
    .expect(400)
  	.end(function(err, res) {
          if (err) {
            throw err;
          }
        done();
      });
    });
    it('Cód. 201: Crear usuario exitosamente', function(done) {
      var usuario = {
        alias: 'LioMessi10',
        name: 'Pablo Nicolás',
        surname: 'Hechim',
        age: '25',
        phone: '635123456'
      };
    request(url)
  	.post('/rest/usuario')
  	.send(usuario)
    .expect(201)
  	.end(function(err, res) {
          if (err) {
            throw err;
          }
        done();
      });
    });
    it('Cód. 400: Crear usuario con alias repetido', function(done) {
      var usuario = {
        alias: 'LioMessi10',
        name: 'Lionel',
        surname: 'Messi',
      };
    request(url)
  	.post('/rest/usuario')
  	.send(usuario)
    .expect(400)
  	.end(function(err, res) {
          if (err) {
            throw err;
          }
        done();
      });
    });
    it('Cód. 200: Actualizar nombre del usuario', function(done){
    	var body = {
    		name: 'Pablo Nicolás',
    	};
    	request(url)
    		.put('/rest/usuario/63/name')
    		.send(body)
    		.expect('Content-Type', /json/)
    		.expect(200)
    		.end(function(err,res) {
    			if (err) {
    				throw err;
    			}
    			done();
    		});
    	});
    });
});
