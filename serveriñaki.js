var express = require('express');
var app=express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var file=require('fs');
var path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var userSchema = new Schema({
	email : { type: String, required: true, unique: true },
	password : String,
	conpassword : String,
	nombre : String,
	apellido : String,
	sexo : String,
	dia : String,
	mes : String,
	año :String,
	nif : String,
	pais : String,
	provincia : String,
	municipio : String,
	calle : String,              //registro con schema de alta de usuario
	codpostal : String,
	telefono : String,
	tarjeta: String,
	publicidad : String,
	created_at : Date,
	updated_at : Date
});
var cookieSchema = new Schema({
	email : { type: String, required: true, unique: true },
	id : Schema.ObjectId
});
var User = mongoose.model('User', userSchema);
var Cookie = mongoose.model('Cookie', cookieSchema);
function servidor()
{
	mongoose.connect('mongodb://localhost/hipercor', function (err) {
			if (err) throw err;
			console.log('Successfully connected');
				app.post('/registro', function (req, res) {
					var pro = req.body.Provincia;
					var muni = req.body.Municipio;
					var calle = req.body.Calle;
					if(pro.includes('x'))
					{
						pro = pro.split('x')[1];
						muni = muni.split('x')[1];					//para filtrar datos de capital de provincia
						calle = calle.substr(6,calle.lenght);
					}
					else
					{
						pro = pro.substr(3,pro.lenght);         //resto de municipios
						muni = muni.substr(3,pro.lenght);
						calle = calle.substr(5,calle.lenght);
					}
					var user = new User (
					{
						email : req.body.Email,
						password : req.body.Password,
						conpassword : req.body.Conpassword,
						nombre : req.body.Nombre,
						apellido : req.body.Apellido,
						sexo : req.body.Sexo,
						dia : req.body.Dia,                //cargar datos con bodyparse
						mes : req.body.Mes,
						año : req.body.Año,
						nif : req.body.NIF,
						pais : req.body.Pais,
						provincia : pro,
						municipio : pro,
						calle : calle,
						codpostal : req.body.CodigoPostal,
						telefono : req.body.Telefono,
						tarjeta: req.body.Tarjeta,
						publicidad : req.body.Publicidad
					});
					user.save(function(err) {
					if(err)
					{
						
					} 
					else
					{
						res.end("ok");
					}
					});
			});
			app.post('/login', function (req, res) {
				User.findOne({'email':req.body.email}, function(err, user) {
					if (err) {
						console.log('Datos no econtrados');
						res.end(null);
					}
					else
					{
						if(user!=null)
						{
							cookie(user);  //si hay logeo se creo cookie. y se devuelve usuario
							res.end(JSON.stringify(user));
						}
					}
			}
			);
			});	
			app.get('/conectado', function(req,res)
			{
				var email = req.query.email;
				Cookie.findOne({'email': email}, function(err, usercookie)
				{
					if(err)
					{
						res.send("n");      //para tras el logeo encontrar si tiene cookie el usuario
					}
					else
					{
						res.send("s");
					}
				});
			});
			app.get('/ficheros', function(req,res)
			{
				var fichero = req.query.archivo;
				res.sendFile(path.join(__dirname+'/codigos/'+fichero)); //para gestion de fichero de direccion
			});
			app.get('/borrarcookie', function(req,res)
			{
				var email = req.query.email;
				Cookie.remove({ email: email }, function(err) {
				if (!err) {
					console.log('borrada');
					res.end("AAADDDIOSSSS"); //borrar cookie tras logout
				}
				else {
					message.type = 'error';
				}
				});
			});
			app.get('/password', function(req,res)
			{
				var email = req.query.email;
				User.findOne({'email': email}, function(err, user)
				{
					if(err)
					{               //encontrar password tras blur en login
						
					}
					else
					{
						res.send(JSON.stringify(user));
					}
				});
			});
	});
}
function cookie(user)
{
	console.log(user);
	var cookie = new Cookie(
	{
		email : user.email,
		id : user._id    //evitar error de campos vacios en caso de fallo de login.
	}
	);
	Cookie.findOne({'id':user._id}, function(err, user) {
	if (err) 
	{
		cookie.save(function(err) {
		if  (err) throw err;
		}); 
		}
	});
}

var server=app.listen(3000,function(){
    servidor();
});