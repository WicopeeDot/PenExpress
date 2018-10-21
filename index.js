const express = require('express')
const mongoose = require('mongoose')
const config = require('./config.json')
const bodyParser = require('body-parser')
const request = require('request')

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http)

const url = `mongodb://${config.mdbuser}:${config.mdbpass}@${config.mdbhost}:${config.mdbport}/?authSource=admin&authMechanism=${config.mdbauthmetd}`;
mongoose.connect(url, err => { if(err) console.log(err) })

app.use(express.static('static'));
app.use(express.static('node_modules'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('index', { captcha: config.recaptchasite })
})

app.post('/subm', async (req, res) => {
	let options = {
		secret: config.recaptchasecret,
		response: req.body["g-recaptcha-response"]
	}

	request.post('https://www.google.com/recaptcha/api/siteverify', {form: options}, function(_,__,resp) {
		console.log(resp)
		if(!resp.success) 
			return res.status(400).send({success:false,msg:'captcha not correct'})

		res.send('egg')
	});
})

http.listen(8000, function() {
	console.log('listening on *:8000')
})