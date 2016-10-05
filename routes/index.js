var express = require('express');
var router = express.Router();
var mysql = require('./mysql');
var ejs = require("ejs");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('sell', { title: 'sell' });
});

router.get('/signup',function (req,res,next){
	res.render('signup',{ title: 'Signup' });
});

router.get('/signin',function (req,res,next){
ejs.renderFile('./views/signin.ejs',function(err, result) {
	   // render on success
	   if (!err) {
	            res.end(result);
	   }
	   // render or error
	   else {
	            res.end('An error occurred');
	            console.log(err);
	   }
});

});

router.post('/sell', function(req, res, next) {
	console.log("inside sell");  
	var JSON_query = {
			
			"item" : req.body.item,
			"desc" : req.body.desc,
			"seller":"hardik",
			"price_option":req.body.price_option,
			"price":req.body.price,
			"qty":req.body.qty,
			"duration":req.body.duration,
			"location":req.body.location,
	};
	console.log(JSON_query);
	var query_string = "INSERT INTO sell SET ?";
	
	mysql.fetchData(function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.affectedRows === 1){
			console.log("signup successful");			
			json_responses = {"statusCode" : 200};
			res.send(json_responses);
			}else{
				console.log("didn't insert the query!");
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
		}  
	},query_string,JSON_query);
	
});

router.post('/signup_scccess',function (req,res,next){
	
	var first_name = req.body.firstname;
	var last_name = req.body.lastname;
	var user_name = req.body.username;
	var get_password = req.body.password;
	
//	console.log(firstname + " " + lastname + " "+ username+ " "+ password);
	
	var query_string = "INSERT INTO users SET ?";
	
	var JSON_query = {
		
			"firstname" : first_name,
			"lastname" : last_name,
			"username":user_name,
			"password":get_password			
	};
		
//	var query = (firstname,lastname, username,password) VALUES ('"+first_name+"','"+last_name+"','"+user_name+"','"+get_password+"')";
	
	console.log("Query is:"+ query);
	
	//insert signup data into DB
	mysql.fetchData(function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.affectedRows === 1){
			console.log("signup successful");			
			res.redirect('signin');
			}else{
				console.log("didn't insert the query!");
			}
		}  
	},query_string,JSON_query);
	
});

module.exports = router;
