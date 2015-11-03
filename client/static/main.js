var template = function() {
	this.templates = {};
}

template.prototype = {
	add: function(t) {
		this.templates = $.extend({}, this.templates, t)
	},
	render: function(name, params) {
		var out = this.templates[name]	
		for (var i in params) {
			out = out.replace(new RegExp("{{"+i+"}}", "g"), params[i]);
		}
		return out;
	}
}

$(window).on("load", function() {
	$(".slide-out").sideNav({
		edge: "left",
	});
	app = {}
	app.dirdata = {}

	app.loadDir = function(dirname) {
		if (app.dirdata[dirname]) {
			app.renderDir(app.dirdata[dirname], dirname);
		}
		fetch("/dirs/"+dirname).then(d => d.json()).then(function(data) {
			app.dirdata[dirname] = data;
			app.renderDir(app.dirdata[dirname], dirname);
		})
	}

	app.renderDir = (data, dir) => {
		out = ""
		for (var n of data) {
			out += app.templates.render("file-item", {name: n, dir: dir}); 
		}
		$("#content").html(app.templates.render("selection", {name:dir, contents: out}));
	}

	app.loadFile = (filename) => {
		$("#content").html(app.templates.render("file-page", {url: filename, name: filename.split("/")[1]}));
	}

	app.templates = new template();

	var t = $(".template").toArray()
	var s = {}
	for (var p of t) {
		s[$(p).attr("id")] = $(p).html()
	}
	app.templates.add(s)
	console.log(app.templates.templates)

	fetch("/dirs").then( f=>f.json() ).then( function(data) {
		app.dirs = data	
		var out = ""
		for (var d of app.dirs) {
			out += app.templates.render("side-link", {
				name: d,
			})
		}
		console.log(out);
		$("#slide-out").html(out);
	})

	$(window).on("hashchange", update)
	update();
})

var update = function() {
	console.log("Updating");
	var hash = location.hash.slice(1);
	var type = hash.split("-")[0];

	if (type == "dir") {
		app.loadDir(hash.split("-")[1]);
	}
	if (type == "file") {
		app.loadFile(hash.split("-")[1]);
	}
}
