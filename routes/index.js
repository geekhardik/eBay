var express = require('express');
var router = express.Router();
var mysql = require('./mysql');
var ejs = require("ejs");

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('signin');
});

router.get('/cart', function(req, res, next) {
	res.render('cart');
});

router.get('/home', function(req, res, next) {
	console.log("inside home");
	if(req.session.user){
	res.render('home',{username : req.session.user.username});
	}
	else{
		res.render('home',{username : 'Guest'});
	}
});

router.post('/home', function(req, res, next) {
	
	if(req.session.user){
	res.send({entry : "signout"});
	}
	else{
		res.send({entry : "signin"});
	}
});


router.post('/getCart', function(req, res, next) {
	console.log("in getcart!");
	var query = "select ebay.sell.item,ebay.cart.qty,ebay.sell.price from ebay.sell,ebay.users,ebay.cart where ebay.users.user_id=ebay.cart.user_id and ebay.sell.id = ebay.cart.id and ebay.cart.user_id ='"+req.session.user.user_id+"'";
	var total_price = 0;
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0) {
				console.log("successful retirval of cart");
				
				for(var i=0;i<results.length;i++){
					total_price += (Number(results[i].price)*Number(results[i].qty));						
				}				
				
				JSON_obj = {
						"cart" : results,
						"price" : total_price
				}
				
				res.send(JSON_obj);							
			} else {
				console.log("no entries found in DB!");
			}
		}
	},query); 
	
});




router.post('/cart', function(req, res, next) {
	
// var cart_items = [];
	
	if(req.session.user){	
		
		var cart_item = req.body.obj;
		var qty = req.body.qty;
		var user = req.session.user.user_id;
		console.log("username in cart is "+req.session.user.username);
	
		
		var query = "select * from cart where cart.id = '"+cart_item.id+"'";
		
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				
				if (results.length > 0) {
					console.log("already exist!");
					var current_qty = results[0].qty;
					new_qty = qty + current_qty
					var query = "update cart SET cart.qty ='"+ new_qty+"' where cart.id = '"+cart_item.id+"'";
					
					mysql.fetchData(function(err, answer) {
						if (err) {
							throw err;
						} else {
							if (answer.length == null) {
								console.log("qty updated to cart");	
								res.send({success : 200});
							}else{
								console.log("no records!");
							} 
						}
					}, query); 			
			
				} else {
					console.log("no entries found in DB!");
					var query = "INSERT INTO cart SET ?	";
					
					var JSON_query = {
							"id" : cart_item.id,
							"item" : cart_item.item,
							"qty" : qty,
							"user_id" : user,
							"seller_name" : cart_item.seller				
						};
					
					mysql.fetchData(function(err, results) {
						if (err) {
							throw err;
						} else {
							if (results.affectedRows === 1) {
								console.log("added to cart");	
								res.send({success : 200});
							} 
						}
					}, query,JSON_query); 
				}
			}
		}, query); 		
		
							
	}else{		
		res.send({success : 401});
	}
});


router.get('/item', function(req, res, next) {
	res.render('item');	
	
});

router.post('/item', function(req, res, next) {
	
	var id = req.body.id;
	var query = "select * from sell where id=?";
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0) {
				res.send({list : results});
						
			} else {
				console.log("no entries found in DB!");
			}
		}
	}, query,id);
});



router.post('/cataLouge', function(req, res, next) {
	console.log("in CataLouge");
		
	// let's get sell items info from table sell into DB
	var query = "select * from sell";
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0) {
// console.log("items exists in catalouge");
// console.log(results);
				res.send({list : results});
						
			} else {
				console.log("no entries found in DB!");
			}
		}
	}, query);
	
});


router.get('/signup', function(req, res, next) {
	res.render('signup', {title : 'Signup'});
});

router.get('/signin', function(req, res, next) {
	
	if(req.session.user){
		res.render('home',{"username" : req.session.user.username});
	}
	else{	
		console.log("redirecting to signin..");
		res.render('signin');
		
	}
});

router.post('/logout', function(req, res, next) {
	req.session.destroy();	
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.send({"statusCode" : 200});
});



router.post('/afterSignIn', function(req, res, next) {

	var username = req.body.inputUsername;
	var password = req.body.inputPassword;

	var getUser = "select * from users where username=? and password = ?";

	// console.log("Query is:"+getUser);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0) {
				
				console.log("result of DB is : "+ results);
				console.log("valid Login");
				console.log("making session..");

				req.session.user = {
						"user_id" : results[0].user_id,
						"username" : username
				};				
				console.log("user_id is : " + req.session.user.user_id);	
			res.send({"statusCode" : 200});	
			} else {

				console.log("Invalid Login");
				res.send({"statusCode" : 401});	
			}
		}
	}, getUser, [ username, password ]);
});

router.get('/sell', function(req, res, next) {
	res.render('sell', {
		title : 'sell'
	});
});

router.post('/sell', function(req, res, next) {
	console.log("inside sell");
	var JSON_query = {

		"item" : req.body.item,
		"desc" : req.body.desc,
		"seller" : "hardik",
		"price_option" : req.body.price_option,
		"price" : req.body.price,
		"qty" : req.body.qty,
		"duration" : req.body.duration,
		"location" : req.body.location,
	};
	console.log(JSON_query);
	var query_string = "INSERT INTO sell SET ?";

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.affectedRows === 1) {
				console.log("signup successful");
				var json_responses = {
					"statusCode" : 200
				};
				res.send(json_responses);
			} else {
				console.log("didn't insert the query!");
				 json_responses = {
					"statusCode" : 401
				};
				res.send(json_responses);
			}
		}
	}, query_string, JSON_query);

});

router.post('/signup_scccess', function(req, res, next) {

	var first_name = req.body.firstname;
	var last_name = req.body.lastname;
	var user_name = req.body.username;
	var get_password = req.body.password;

	// console.log(firstname + " " + lastname + " "+ username+ " "+ password);

	var query_string = "INSERT INTO users SET ?";

	var JSON_query = {

		"firstname" : first_name,
		"lastname" : last_name,
		"username" : user_name,
		"password" : get_password
	};

	// insert signup data into DB
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.affectedRows === 1) {
				console.log("signup successful");
				res.redirect('signin');
			} else {
				console.log("didn't insert the query!");
			}
		}
	}, query_string, JSON_query);

});

module.exports = router;
