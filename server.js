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
		//goes through each state in the data base and gets their total amount of each resoruce used for 2017.
		//we then make a string to fill the table, and set the strings equal to the total amounts so the table works
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
		});
    }).catch((err) => {
		Write404Error(res);
	});
});

// GET request handler for '/year/*'
app.get('/year/:selected_year', (req, res) => {
    ReadFile(path.join(template_dir, 'year.html')).then((template) => {
        let response = template;
		var curyear = req.params.selected_year;

		//Sees if we have a year in our range
		if (parseInt(curyear) <= 2017 && parseInt(curyear) >= 1960) {
			//replaces titles with the current year plus the title
			response = response.replace('US Energy Consumption', curyear+' US Energy Consumption');
			response = response.replace('National Snapshot', curyear+' National Snapshot');

			//goes through each state in the data base and gets their total amount of each resoruce used for the year selected.
			//we then make a string to fill the table, and set the strings equal to the total amounts so the table works
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

				//this code is to get the buttons working. If it is 1960 or 2017, we do not want to go to 1959 or 2018.
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
			});
		} else {
			//if year is out of range
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Error: no data for year '+curyear);
			res.end();
		}
    }).catch((err) => {
		Write404Error(res);
	});
});

// GET request handler for '/state/*'
app.get('/state/:selected_state', (req, res) => {
    ReadFile(path.join(template_dir, 'state.html')).then((template) => {
        let response = template;
		var curstate = req.params.selected_state;
		var states = ['AK','AL','AR','AZ','CA','CO','CT','DC',
		'DE','FL','GA','HI','IA','ID','IL','IN',
		'KS','KY','LA','MA','MD','ME','MI','MN',
		'MO','MS','MT','NC','ND','NE','NH','NJ',
		'NM','NV','NY','OH','OK','OR','PA','RI',
		'SC','SD','TN','TX','UT','VA','VT','WA',
		'WI','WV','WY'];
		//if we have a valid state
		if (states.includes(curstate)==true) {
			response = response.replace('US Energy Consumption', curstate+' Energy Consumption');
			//in this one we create arrays where each spot in the array is one year of total consumption i.e. the first element
			//in coalList is the coal consumption for the current state in the year 1960.
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
				response = response.replace('natural_gas_counts;', 'natural_gas_counts=['+natural_gasList+"];");
				response = response.replace('nuclear_counts;', 'nuclear_counts=['+nuclearList+"];");
				response = response.replace('petroleum_counts;', 'petroleum_counts=['+petroleumList+"];");
				response = response.replace('renewable_counts;', 'renewable_counts=['+renewableList+"];");
				response = response.replace('<!-- Data to be inserted here -->', tableInfo);
				
				//this allows us to get the states fullname so we can replace the titles with it and the title
				db.all("SELECT * FROM States WHERE state_abbreviation = ? ", [curstate], (err, rows) => {
					var fullname = '';
					fullname = rows[0].state_name;
					response = response.replace('var state;', 'var state="'+fullname+'";');
					response = response.replace('Yearly Snapshot', fullname+' Yearly Snapshot');

					var aim = states.indexOf(curstate);
					
					//this is to get the buttons working. If it is AK or WY, we want to loop back around
					if (curstate == 'AK') {
						response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev state, link to WY if state is AK -->', '<a class="prev_next" href="http://localhost:8000/state/WY">WY</a>');
						response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next state, link to AK if state is WY -->', '<a class="prev_next" href="http://localhost:8000/state/'+states[aim+1]+'">'+states[aim+1]+'</a>');
					} else if (curstate == 'WY') {
						response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev state, link to WY if state is AK -->', '<a class="prev_next" href="http://localhost:8000/state/'+states[aim-1]+'">'+states[aim-1]+'</a>');
						response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next state, link to AK if state is WY -->', '<a class="prev_next" href="http://localhost:8000/state/AK">AK</a>');
					} else {
						response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev state, link to WY if state is AK -->', '<a class="prev_next" href="http://localhost:8000/state/'+states[aim-1]+'">'+states[aim-1]+'</a>');
						response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next state, link to AK if state is WY -->', '<a class="prev_next" href="http://localhost:8000/state/'+states[aim+1]+'">'+states[aim+1]+'</a>');
					}
					//puts the correct image in 
					response = response.replace('<img src="/images/noimage.jpg" alt="No Image" width="250" height="auto" />', '<img src="/images/'+states[aim]+'.jpg" alt="'+states[aim]+' flag CopyFrom:https://flaglane.com/category/state/" width="250" height="auto" />');
					WriteHtml(res, response);
				});
			});
		} else {
			//if do not have a valid state
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Error: no data for state '+curstate);
			res.end();
		}
    }).catch((err) => {
		Write404Error(res);
	});
});

// GET request handler for '/energy-type/*'
app.get('/energy-type/:selected_energy_type', (req, res) => {
    ReadFile(path.join(template_dir, 'energy.html')).then((template) => {
        let response = template;
		var curtype = req.params.selected_energy_type;
		var energys = ['coal','natural_gas','nuclear','petroleum','renewable'];
		//makes sure we have a valid energy type
		if (energys.includes(curtype)==true) {
			//these ifs make a variable with the energy type name in a more formal form with each first letter capitalized
			if (curtype == 'coal') {
				var tt = 'Coal';
				response = response.replace('US Energy Consumption', 'US '+tt+' Energy Consumption');
			} else if (curtype == 'natural_gas') {
				var tt = 'Natural Gas';
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
			
			db.all("SELECT "+curtype+",state_abbreviation FROM Consumption ORDER BY state_abbreviation,year", (err, rows) => {
				//sets the variable energy_counts to a json object 
				var counts = {"AK":"","AL":"","AR":"","AZ":"","CA":"","CO":"","CT":"","DC":"",
				"DE":"","FL":"","GA":"","HI":"","IA":"","ID":"","IL":"","IN":"",
				"KS":"","KY":"","LA":"","MA":"","MD":"","ME":"","MI":"","MN":"",
				"MO":"","MS":"","MT":"","NC":"","ND":"","NE":"","NH":"","NJ":"",
				"NM":"","NV":"","NY":"","OH":"","OK":"","OR":"","PA":"","RI":"",
				"SC":"","SD":"","TN":"","TX":"","UT":"","VA":"","VT":"","WA":"",
				"WI":"","WV":"","WY":""};
				var states = ['AK','AL','AR','AZ','CA','CO','CT','DC',
				'DE','FL','GA','HI','IA','ID','IL','IN',
				'KS','KY','LA','MA','MD','ME','MI','MN',
				'MO','MS','MT','NC','ND','NE','NH','NJ',
				'NM','NV','NY','OH','OK','OR','PA','RI',
				'SC','SD','TN','TX','UT','VA','VT','WA',
				'WI','WV','WY'];
				var j = 0;
				var k = 0;
				var array = new Array(57);
				var tableInfo = '';
				var originyear = 1960;
				for(var i = 0;i<rows.length;i++) {
					// since it displays one states 58 years at a time, we have to make sure we are populating
					// an array for one state
					if(rows[i].state_abbreviation == states[j]) {
						array[k] = rows[i][curtype];
						k++;
					}
					else {
						//if it doesnt equal, that means we need to move on to the next state and put the first one in the array
						counts[states[j]] = array;
						k = 0;
						array = new Array(57);
						array[k] = rows[i][curtype];
						k++;
						j++;
					}
					if(i==rows.length-1) {
						//at end of rows array
						counts[states[j]] = array;
					}
				}
				response = response.replace('energy_counts;', 'energy_counts='+JSON.stringify(counts));

				//makes the table elements from our json object
				for(var n=0; n<58; n++) { //year
					var totaleachyear = 0;
					var eachrow = '';
					for(var m=0; m<51; m++) { //state
						eachrow = eachrow + '<td>'+counts[states[m]][n]+'</td>';
						totaleachyear = totaleachyear+counts[states[m]][n];
					}
					tableInfo = tableInfo + '<tr>\n<td>'+(originyear+n)+'</td>'+eachrow+'<td>'+totaleachyear+'</td>\n</tr>\n';
				}

				response = response.replace('<!-- Data to be inserted here -->', tableInfo);
				response = response.replace('Consumption Snapshot', tt+' Consumption Snapshot');
				response = response.replace('var energy_type;', 'var energy_type="'+tt+'";');
				response = response.replace('<img src="/images/noimage.jpg" alt="No Image" width="250" height="auto" />', '<img src="/images/'+curtype+'.jpg" alt="'+curtype+' CopyFrom:https://unsplash.com/" width="250" height="auto" />');

				var ans = energys.indexOf(curtype);
				
				// getting the functionality for the buttons
				if(curtype == 'coal') {
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev enery type, link to Renewable if energy is Coal -->', '<a class="prev_next" href="http://localhost:8000/energy-type/renewable">renewable</a>');
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next enery type, link to Coal if energy is Renewable -->', '<a class="prev_next" href="http://localhost:8000/energy-type/'+energys[ans+1]+'">'+energys[ans+1]+'</a>');
				} else if (curtype == 'renewable') {
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev enery type, link to Renewable if energy is Coal -->', '<a class="prev_next" href="http://localhost:8000/energy-type/'+energys[ans-1]+'">'+energys[ans-1]+'</a>');
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next enery type, link to Coal if energy is Renewable -->', '<a class="prev_next" href="http://localhost:8000/energy-type/coal">coal</a>');
				} else {
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to prev enery type, link to Renewable if energy is Coal -->', '<a class="prev_next" href="http://localhost:8000/energy-type/'+energys[ans-1]+'">'+energys[ans-1]+'</a>');
					response = response.replace('<a class="prev_next" href="">XX</a> <!-- change XX to next enery type, link to Coal if energy is Renewable -->', '<a class="prev_next" href="http://localhost:8000/energy-type/'+energys[ans+1]+'">'+energys[ans+1]+'</a>');				
				}
				WriteHtml(res, response);
			});
		} else {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Error: no data for consumption type '+curtype);
			res.end();
		}
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
