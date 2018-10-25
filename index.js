const express = require('express')
const mongodb = require('mongodb')
const config = require('./config.json')
const bodyParser = require('body-parser')
const request = require('request')
const util = require('./util')

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http)

let db;

const url = `mongodb://${config.mdbuser}:${config.mdbpass}@${config.mdbhost}:${config.mdbport}/?authSource=admin&authMechanism=${config.mdbauthmetd}`;
mongodb.connect(url, { useNewUrlParser: true }, (err,dat) => { if(err) throw err; db = dat.db('penexpress'); })

app.use(express.static('static'));
app.use(express.static('node_modules'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('index', { captcha: config.recaptchasite })
})

app.get('/pedit/:id', async (req, res) => {
	try {
		let id = new mongodb.ObjectId(req.params.id)
		let data = await db.collection('posts').find(id).toArray()
		data = data[0]

		if(!data)
			res.render('404', { id: req.params.id })
		else
			res.render('edit', { text: data.content, id: req.params.id, captcha: config.recaptchasite })
	} catch(err) {
		res.render('404', { id: req.params.id })
	}
})

app.get('/p/:id', async (req, res) => {
	try {
		let id = new mongodb.ObjectId(req.params.id)
		let data = await db.collection('posts').find(id).toArray()
		data = data[0]

		if(!data)
			res.render('404', { id: req.params.id })
		else
			res.render('page', { text: data.content, id: req.params.id  })
	} catch(err) {
		res.render('404', { id: req.params.id })
	}
})

app.post('/submedit', async (req, res) => {
	let options = {
		secret: config.recaptchasecret,
		response: req.body["g-recaptcha-response"]
	}

	request.post('https://www.google.com/recaptcha/api/siteverify', {form: options}, async function(_,__,resp) {
		resp = JSON.parse(resp)
		if(!resp.success) 
			return res.status(400).send({success:false,msg:'captcha not correct'})

		let id = new mongodb.ObjectId(req.body.__id)

		let yes = await db.collection('posts').find(id).toArray()
		yes = yes[0]

		if(!yes)
			return res.send({success:false,msg:'could not find document'}).status(400)

		util.comparePassword(req.body.pswd, yes.pswd, async function(err, resp1) {
			console.log(err)
			if(err)
				return res.status(500);

			if(!resp1)
				return res.status(400).send({success:false,msg:'incorrect password'})

			let resp2 = await db.collection('posts').updateOne({_id: id}, {$set: {content: req.body.new_content}})
			res.redirect('/p/' + req.body.__id)
		})
	});
});

app.post('/subm', async (req, res) => {
	let options = {
		secret: config.recaptchasecret,
		response: req.body["g-recaptcha-response"]
	}

	request.post('https://www.google.com/recaptcha/api/siteverify', {form: options}, function(_,__,resp) {
		resp = JSON.parse(resp)
		if(!resp.success) 
			return res.status(400).send({success:false,msg:'captcha not correct'})

		if(!db)
			return res.status(400).send({success:false,msg:'database not available'})

		util.cryptPassword(req.body.pswd, async function(err, hash) {
			console.log(err)
			if(err)
				return res.status(500); 

			let obj = {
				pswd: hash,
				content: req.body.text
			}

			let resp1 = await db.collection('posts').insertOne(obj)
			res.redirect('/p/' + resp1.insertedId)
		})
	});
})

http.listen(8000, function() {
	console.log('listening on *:8000')
})