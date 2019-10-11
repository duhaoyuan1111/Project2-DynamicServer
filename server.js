// Built-in Node.js modules
var fs = require('fs')
var path = require('path')

// NPM modules
var express = require('express')
var sqlite3 = require('sqlite3')


var public_dir = path.join(__dirname, 'public');
var template_dir = path.join(__dirname, 'templates');
var db_filename = path.join(__dirname, 'db', 'usenergy.sqlite3');

var app = express();
var port = 8000;

// open usenergy.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
		//TestSql();
    }
});

function TestSql() {
	db.all("SELECT * FROM Consumption WHERE year = ?", ['2017'], (err, rows) => {
		
		console.log(rows);
		
	});
	
}

app.use(express.static(public_dir));


// GET request handler for '/'
app.get('/', (req, res) => {
    ReadFile(path.join(template_dir, 'index.html')).then((template) => {
        let response = template;
		db.all("SELECT * FROM Consumption WHERE year = ?", ['2017'], (err, rows) => {
			var totalcoal = 0;
			var totalnatural_gas = 0;
			var totalnuclear = 0;
			var totalpetroleum = 0;
			var totalrenewable = 0;
			var tableInfo = '';
			for(var i=0; i<rows.length; i++) {
				totalcoal = totalcoal + rows[i].coal;
				totalnatural_gas = totalnatural_gas + rows[i].natural_gas;
				totalnuclear = totalnuclear + rows[i].nuclear;
				totalpetroleum = totalpetroleum + rows[i].petroleum;
				totalrenewable = totalrenewable + rows[i].renewable;
				tableInfo = tableInfo + '<tr>\n<td>'+rows[i].state_abbreviation+'</td>\n<td>'+rows[i].coal+'</td>\n<td>'+rows[i].natural_gas+'</td>\n<td>'+rows[i].nuclear+'</td>\n<td>'+rows[i].petroleum+'</td>\n<td>'+rows[i].renewable+'</td>\n</tr>\n';
			}
			response = response.replace('coal_count;', 'coal_count='+totalcoal+";");
			response = response.replace('natural_gas_count;', 'natural_gas_count='+totalnatural_gas+";");
			response = response.replace('nuclear_count;', 'nuclear_count='+totalnuclear+";");
			response = response.replace('petroleum_count;', 'petroleum_count='+totalpetroleum+";");
			response = response.replace('renewable_count;', 'renewable_count='+totalrenewable+";");
			response = response.replace('<!-- Data to be inserted here -->', tableInfo);
			WriteHtml(res, response);
		}).catch((err) => {
			Write404Error(res);
		});
    });
});

// GET request handler for '/year/*'
app.get('/year/:selected_year', (req, res) => {
    ReadFile(path.join(template_dir, 'year.html')).then((template) => {
        let response = template;
		var curyear = req.params.selected_year;
		response = response.replace('US Energy Consumption', curyear+' US Energy Consumption');
		response = response.replace('National Snapshot', curyear+' National Snapshot');
		db.all("SELECT * FROM Consumption WHERE year = ?", [curyear], (err, rows) => {
			var totalcoal = 0;
			var totalnatural_gas = 0;
			var totalnuclear = 0;
			var totalpetroleum = 0;
			var totalrenewable = 0;
			var statetotal = 0;
			var tableInfo = '';
			for(var i=0; i<rows.length; i++) {
				totalcoal = totalcoal + rows[i].coal;
				totalnatural_gas = totalnatural_gas + rows[i].natural_gas;
				totalnuclear = totalnuclear + rows[i].nuclear;
				totalpetroleum = totalpetroleum + rows[i].petroleum;
				totalrenewable = totalrenewable + rows[i].renewable;
				statetotal = rows[i].coal + rows[i].natural_gas + rows[i].nuclear + rows[i].petroleum + rows[i].renewable;
				tableInfo = tableInfo + '<tr>\n<td>'+rows[i].state_abbreviation+'</td>\n<td>'+rows[i].coal+'</td>\n<td>'+rows[i].natural_gas+'</td>\n<td>'+rows[i].nuclear+'</td>\n<td>'+rows[i].petroleum+'</td>\n<td>'+rows[i].renewable+'</td>\n<td>'+statetotal+'</td>\n</tr>\n';
			}
			response = response.replace('coal_count;', 'coal_count='+totalcoal+";");
			response = response.replace('natural_gas_count;', 'natural_gas_count='+totalnatural_gas+";");
			response = response.replace('nuclear_count;', 'nuclear_count='+totalnuclear+";");
			response = response.replace('petroleum_count;', 'petroleum_count='+totalpetroleum+";");
			response = response.replace('renewable_count;', 'renewable_count='+totalrenewable+";");
			response = response.replace('<!-- Data to be inserted here -->', tableInfo);
			if (req.params.selected_year == '1960') {
				response = response.replace('<a class="prev_next" href="">Prev</a>', '<a class="prev_next" href="http://localhost:8000/year/1960">Prev</a>');
				response = response.replace('<a class="prev_next" href="">Next</a>', '<a class="prev_next" href="http://localhost:8000/year/'+(parseInt(curyear)+1)+'">Next</a>');
			} else if (req.params.selected_year == '2017') {
				response = response.replace('<a class="prev_next" href="">Prev</a>', '<a class="prev_next" href="http://localhost:8000/year/'+(parseInt(curyear)-1)+'">Prev</a>');
				response = response.replace('<a class="prev_next" href="">Next</a>', '<a class="prev_next" href="http://localhost:8000/year/2017">Next</a>');
			} else {
				response = response.replace('<a class="prev_next" href="">Prev</a>', '<a class="prev_next" href="http://localhost:8000/year/'+(parseInt(curyear)-1)+'">Prev</a>');
				response = response.replace('<a class="prev_next" href="">Next</a>', '<a class="prev_next" href="http://localhost:8000/year/'+(parseInt(curyear)+1)+'">Next</a>');
			}
			WriteHtml(res, response);
		}).catch((err) => {
			Write404Error(res);
		});
    });
});

// GET request handler for '/state/*'
app.get('/state/:selected_state', (req, res) => {
    ReadFile(path.join(template_dir, 'state.html')).then((template) => {
        let response = template;
		
		/*
			1 改变html里title US Energy Consumption 的年份
			  从req.params.selected_state 获得相应的州
			2 从database里获取的数据存到相对应的每个州的消耗数量里
			3 
		
		
		*/
		
        WriteHtml(res, response);
    }).catch((err) => {
        Write404Error(res);
    });
});

// GET request handler for '/energy-type/*'
app.get('/energy-type/:selected_energy_type', (req, res) => {
    ReadFile(path.join(template_dir, 'energy.html')).then((template) => {
        let response = template;
        // modify `response` here

        WriteHtml(res, response);
    }).catch((err) => {
        Write404Error(res);
    });
});

function ReadFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data.toString());
            }
        });
    });
}

function Write404Error(res) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('Error: file not found');
    res.end();
}

function WriteHtml(res, html) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html);
    res.end();
}


var server = app.listen(port);
