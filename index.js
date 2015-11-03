var fs        = require("fs");
var express   = require("express");
var app       = express();
var multipart = require("connect-multiparty")();

var ctfroot = "/root/ctfs"

app.get("/", function(req, res) {
	res.sendFile("index.html", {root:__dirname+"/client/"});
})

app.get("/static/:FILE", function(req, res) {
	res.sendFile(req.params.FILE, {root:__dirname+"/client/static"});
})


app.get("/dirs", function(req, res) {
	fs.readdir(ctfroot, function(err, files) {
		if (err) {
			crash(res, 503, "Internal Server Error")
			return;
		}
		res.send(JSON.stringify(files));
		res.end();
	})
})

app.get("/dirs/:DIR", function(req, res) {
	fs.stat(ctfroot+"/"+req.params.DIR, function(err, stat) {
		if (err || !stat.isDirectory()) {
			crash(res, 503, "Bad File Name");
			return;
		}
		fs.readdir(ctfroot+"/"+req.params.DIR, function(err, files) {
			if (err) {
				crash(res, 503, "Internal Server Error");
				return;
			}
			res.send(JSON.stringify(files));
			res.end();
		})
	})
})

app.get("/files/:DIR/:FILE", function(req, res) {
	console.log(req.params);
	fs.readFile(ctfroot+"/"+req.params.DIR+"/"+req.params.FILE, function(err, file) {
		if (err) {
			crash(res, 504, "Bad File Request");
			return;
		}
		res.type("application/octet-stream");
		res.send(file.toString());
		res.end();
	})
})

app.post("/file/add", multipart, function(req, res) {
	console.log(req.files)
	console.log(req.body);
	var name = req.files.file.name.match(/[a-zA-Z]+/)[0]
	var filename = ctfroot+"/"+req.body.directory+"/"+req.files.file.name;
	fs.stat(ctfroot+"/"+req.body.directory+"/"+req.files.file.name, function(err, stat) {
		if (err || stat == undefined) {
			fs.createReadStream(req.files.file.path).pipe(fs.createWriteStream(ctfroot+"/"+req.body.directory+"/"+req.files.file.name));	
		} else {
			crash(res, 504, "File already exists");
		}
	})
})

app.listen(80);


crash = function(res, code, msg) {
	res.status(code);
	res.send(msg);
	res.end();
}

