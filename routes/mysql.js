var ejs= require('ejs');
var mysql = require('mysql');

//Put your mysql configuration settings - user, password, database and port
function getConnection(){
	var connection = mysql.createConnection({
	    host     : 'localhost',
	    user     : 'root',
	    password : 'welcome123#',
	    database : 'ebay',
	    port	 : 3306
	});
	return connection;
}


function fetchData(callback,sqlQuery,JSON_args){
	
	
//	sqlQuery = sqlQuery + "VALUES" + JSON_args;
//	console.log("\nSQL Query::"+sqlQuery);
	
	var connection=getConnection();
	
	var query = connection.query(sqlQuery,JSON_args, function(err, rows, fields) {
		if(err){
			
			console.log("ERROR: " + err.message);
		}
		else 
		{	// return err or result
			console.log(query.sql);
			console.log("DB Results:"+rows);
			callback(err, rows);
		}
		
	});
	console.log(query.sql);
	console.log("\nConnection closed..");
	connection.end();
}	

exports.fetchData=fetchData;