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

app.use(express.static(public_dir));


// GET request handler for '/'
app.get('/', (req, res) => {
    ReadFile(path.join(template_dir, 'index.html')).then((template) => {
        let response = template;
		db.all("SELECT * FROM Consumption WHERE year = ? ORDER BY state_abbreviation", ['2017'], (err, rows) => {
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
		if (parseInt(curyear) <= 2017 && parseInt(curyear) >= 1960) {
			response = response.replace('US Energy Consumption', curyear+' US Energy Consumption');
			response = response.replace('National Snapshot', curyear+' National Snapshot');
			db.all("SELECT * FROM Consumption WHERE year = ? ORDER BY state_abbreviation", [curyear], (err, rows) => {
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
				response = response.replace('var year;', 'var year='+curyear+";");
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
		} else {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Error: no data for year '+curyear);
			res.end();
		}
    });
});

// GET request handler for '/state/*'
app.get('/state/:selected_state', (req, res) => {
    ReadFile(path.join(template_dir, 'state.html')).then((template) => {
        let response = template;
		var curstate = req.params.selected_state;
		if (curstate=='AK'||curstate=='AL'||curstate=='AR'||curstate=='AZ'||curstate=='CA'||curstate=='CO'||curstate=='CT'||curstate=='DC'||
		curstate=='DE'||curstate=='FL'||curstate=='GA'||curstate=='HI'||curstate=='IA'||curstate=='ID'||curstate=='IL'||curstate=='IN'||
		curstate=='KS'||curstate=='KY'||curstate=='LA'||curstate=='MA'||curstate=='MD'||curstate=='ME'||curstate=='MI'||curstate=='MN'||
		curstate=='MO'||curstate=='MS'||curstate=='MT'||curstate=='NC'||curstate=='ND'||curstate=='NE'||curstate=='NH'||curstate=='NJ'||
		curstate=='NM'||curstate=='NV'||curstate=='NY'||curstate=='OH'||curstate=='OK'||curstate=='OR'||curstate=='PA'||curstate=='RI'||
		curstate=='SC'||curstate=='SD'||curstate=='TN'||curstate=='TX'||curstate=='UT'||curstate=='VA'||curstate=='VT'||curstate=='WA'||
		curstate=='WI'||curstate=='WV'||curstate=='WY') {
			response = response.replace('US Energy Consumption', curstate+' US Energy Consumption');
			db.all("SELECT * FROM Consumption WHERE state_abbreviation = ? ORDER BY year", [curstate], (err, rows) => {
				var statetotal = 0;
				var coalList = new Array(rows.length);
				var natural_gasList = new Array(rows.length);
				var nuclearList = new Array(rows.length);
				var petroleumList = new Array(rows.length);
				var renewableList = new Array(rows.length);
				var tableInfo = '';
				for(var i=0; i<rows.length; i++) {
					coalList[i] = (rows[i].coal);
					natural_gasList[i] = (rows[i].natural_gas);
					nuclearList[i] = (rows[i].nuclear);
					petroleumList[i] = (rows[i].petroleum);
					renewableList[i] = (rows[i].renewable);
					statetotal = rows[i].coal + rows[i].natural_gas + rows[i].nuclear + rows[i].petroleum + rows[i].renewable;
					tableInfo = tableInfo + '<tr>\n<td>'+rows[i].year+'</td>\n<td>'+rows[i].coal+'</td>\n<td>'+rows[i].natural_gas+'</td>\n<td>'+rows[i].nuclear+'</td>\n<td>'+rows[i].petroleum+'</td>\n<td>'+rows[i].renewable+'</td>\n<td>'+statetotal+'</td>\n</tr>\n';
				}
				response = response.replace('coal_counts;', 'coal_counts=['+coalList+"];");
				response = response.replace('natural_gas_count;', 'natural_gas_count=['+natural_gasList+"];");
				response = response.replace('nuclear_counts;', 'nuclear_counts=['+nuclearList+"];");
				response = response.replace('petroleum_counts;', 'petroleum_counts=['+petroleumList+"];");
				response = response.replace('renewable_counts;', 'renewable_counts=['+renewableList+"];");
				response = response.replace('<!-- Data to be inserted here -->', tableInfo);
			
				db.all("SELECT * FROM States WHERE state_abbreviation = ? ", [curstate], (err, rows) => {
					var fullname = '';
					fullname = rows[0].state_name;
					response = response.replace('var state;', 'var state="'+fullname+'";');
					response = response.replace('Yearly Snapshot', fullname+' Yearly Snapshot');
					db.all("SELECT state_abbreviation FROM States ORDER BY state_abbreviation", (err, rows) => {
						var nameList = new Array(rows.length);
						for(var i=0; i<rows.length; i++) {
							nameList[i] = (rows[i].state_abbreviation);
						}
						for(var k=0; k<nameList.length; k++) {
							if (nameList[k] == curstate) {
								var aim = k;
							}
						}
						if (curstate == 'AK') {
							response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev state, link to WY if state is AK -->', '<a class="prev_next" href="http://localhost:8000/state/WY">WY</a>');
							response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next state, link to AK if state is WY -->', '<a class="prev_next" href="http://localhost:8000/state/'+nameList[aim+1]+'">'+nameList[aim+1]+'</a>');
						} else if (curstate == 'WY') {
							response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev state, link to WY if state is AK -->', '<a class="prev_next" href="http://localhost:8000/state/'+nameList[aim-1]+'">'+nameList[aim-1]+'</a>');
							response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next state, link to AK if state is WY -->', '<a class="prev_next" href="http://localhost:8000/state/AK">AK</a>');
						} else {
							response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev state, link to WY if state is AK -->', '<a class="prev_next" href="http://localhost:8000/state/'+nameList[aim-1]+'">'+nameList[aim-1]+'</a>');
							response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next state, link to AK if state is WY -->', '<a class="prev_next" href="http://localhost:8000/state/'+nameList[aim+1]+'">'+nameList[aim+1]+'</a>');
						}
						response = response.replace('<img src="/images/noimage.jpg" alt="No Image" width="250" height="auto" />', '<img src="/images/'+nameList[aim]+'.jpg" alt="'+nameList[aim]+' flag CopyFrom:https://flaglane.com/category/state/" width="250" height="auto" />');
						WriteHtml(res, response);
					});
				});
			}).catch((err) => {
				Write404Error(res);
			});
		} else {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Error: no data for state '+curstate);
			res.end();
		}
    });
});

// GET request handler for '/energy-type/*'
app.get('/energy-type/:selected_energy_type', (req, res) => {
    ReadFile(path.join(template_dir, 'energy.html')).then((template) => {
        let response = template;
		var curtype = req.params.selected_energy_type;
		if (curtype == 'coal'||curtype == 'natural_gas'||curtype == 'nuclear'||curtype == 'petroleum'||curtype == 'renewable') {
			var returnString='';
			if (curtype == 'coal') {
				var tt = 'Coal';
				response = response.replace('US Energy Consumption', 'US '+tt+' Energy Consumption');
			} else if (curtype == 'natural_gas') {
				var tt = 'Natural gas';
				response = response.replace('US Energy Consumption', 'US '+tt+' Energy Consumption');
			} else if (curtype == 'nuclear') {
				var tt = 'Nuclear';
				response = response.replace('US Energy Consumption', 'US '+tt+' Energy Consumption');
			} else if (curtype == 'petroleum') {
				var tt = 'Petroleum';
				response = response.replace('US Energy Consumption', 'US '+tt+' Energy Consumption');
			} else {
				var tt = 'Renewable';
				response = response.replace('US Energy Consumption', 'US '+tt+' Energy Consumption');
			}
			response = response.replace('US Energy Consumption', curtype+' US Energy Consumption');
			db.all("SELECT "+curtype+",state_abbreviation FROM Consumption ORDER BY state_abbreviation,year", (err, rows) => {
				var tableInfo = '';
				var bag = new Array(51);
				var energy_countsString = '';
				var originyear=1960;
				var name;
				for(var i=0; i<bag.length; i++) {
					bag[i] = new Array(2);
					var temp = new Array(58);
					name = rows[i*(58)].state_abbreviation;
					for(var k=0; k<58; k++) {
						temp[k] = rows[(i*58)+k][curtype];
					}
					bag[i][0] = name;
					bag[i][1] = temp;
				}
				for(var j=0; j<bag.length; j++) {
					energy_countsString = energy_countsString + bag[j][0] + ': [' + bag[j][1] + '], ';
				}
				response = response.replace('energy_counts;', 'energy_counts={'+energy_countsString+'};');
				for(var n=0; n<58; n++) { //year
					var totaleachyear = 0;
					var eachrow = '';
					for(var m=0; m<51; m++) { //state
						eachrow = eachrow + '<td>'+bag[m][1][n]+'</td>';
						totaleachyear = totaleachyear+bag[m][1][n];
					}
					tableInfo = tableInfo + '<tr>\n<td>'+(originyear+n)+'</td>'+eachrow+'<td>'+totaleachyear+'</td>\n</tr>\n';
				}
				response = response.replace('<!-- Data to be inserted here -->', tableInfo);
				response = response.replace('Consumption Snapshot', curtype+' Consumption Snapshot');
				response = response.replace('var energy_type;', 'var energy_type="'+curtype+'";');
				response = response.replace('<img src="/images/noimage.jpg" alt="No Image" width="250" height="auto" />', '<img src="/images/'+curtype+'.jpg" alt="'+curtype+' CopyFrom:https://unsplash.com/" width="250" height="auto" />');
				var typeList = new Array(5);
				typeList[0] = 'coal';
				typeList[1] = 'natural_gas';
				typeList[2] = 'nuclear';
				typeList[3] = 'petroleum';
				typeList[4] = 'renewable';
				for(var i=0; i<typeList.length; i++) {
					if(curtype == typeList[i]) {
						var ans = i;
					}
				}
				if(curtype == 'coal') {
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev enery type, link to Renewable if energy is Coal -->', '<a class="prev_next" href="http://localhost:8000/energy-type/renewable">renewable</a>');
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next enery type, link to Coal if energy is Renewable -->', '<a class="prev_next" href="http://localhost:8000/energy-type/'+typeList[ans+1]+'">'+typeList[ans+1]+'</a>');
				} else if (curtype == 'renewable') {
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev enery type, link to Renewable if energy is Coal -->', '<a class="prev_next" href="http://localhost:8000/energy-type/'+typeList[ans-1]+'">'+typeList[ans-1]+'</a>');
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next enery type, link to Coal if energy is Renewable -->', '<a class="prev_next" href="http://localhost:8000/energy-type/coal">coal</a>');
				} else {
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev enery type, link to Renewable if energy is Coal -->', '<a class="prev_next" href="http://localhost:8000/energy-type/'+typeList[ans-1]+'">'+typeList[ans-1]+'</a>');
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next enery type, link to Coal if energy is Renewable -->', '<a class="prev_next" href="http://localhost:8000/energy-type/'+typeList[ans+1]+'">'+typeList[ans+1]+'</a>');				
				}
				WriteHtml(res, response);
			}).catch((err) => {
				Write404Error(res);
			});
		} else {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Error: no data for consumption type '+curtype);
			res.end();
		}
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
