var express = require('express');
var router = express.Router();
var mysql = require('./mysql');
var ejs = require("ejs");
var check = require('./cc_check');
var uuid = require('node-uuid');
var crypto = require('crypto');


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('signin');
});

router.get('/cart', function(req, res, next) {
	
	if(req.session.user){
		res.render('cart');
		}
		else{
			res.redirect('signin');
		}	
});

router.post('/gotoCheckout', function(req, res, next) {
	res.send({success : 200});
//	res.render('checkout');
});

router.get('/checkout', function(req, res, next) {
	if(req.session.user){
		res.render('checkout');
		}
		else{
			res.redirect('signin');
		}
});


router.post('/boughtPage', function(req, res, next) {
	
	var cc = req.body.cc;
	var exp_month = req.body.exp_month;
	var exp_year = req.body.exp_year;
	var cvv = req.body.cvv;
	
	var checkout_cart = [];
	checkout_cart = req.body.cart;
	var cart_total = req.body.total;
	
	var size = 0,i=0,count=0,qty=0,cart_item= 0;
	var new_qty = 0;
	
	for (var x in checkout_cart){
		size++;
	}
	console.log(checkout_cart);
	
//	console.log(cc + " " + exp_month + " "+ exp_year + " "+ cvv);
	
//	check.Tocheck(cc,exp_month, exp_year,cvv,function(answer,message){
		
			
//		if(answer){	
			var transection_id = uuid.v1();
			console.log("CC check is OK");
			
			//insert into transection databases		
			var query = "INSERT INTO transection SET ?";
			
			var JSON_query = {
					"total" : cart_total,
					"user_id" : req.session.user.user_id,	
					"id" : transection_id
			};
			
			mysql.fetchData(function(err, results) {
				if (err) {
					throw err;
				} else {
					if (results.affectedRows === 1) {
						console.log("added to transection cart");	
//						
					} 
				}
			}, query,JSON_query); 
			
			//insert detailed item lists into bought_detail table
			
			for (i=0;i<size;i++){
			
				var query = "INSERT INTO order_details SET ?";
				
				var JSON_query = {
						"seller_id" : checkout_cart[i].seller_id,
						"item" : checkout_cart[i].item,	
						"transection_id" : transection_id,
						"qty" : checkout_cart[i].qty					
				};
				
				mysql.fetchData(function(err, results) {
					if (err) {
						throw err;
					} else {
						if (results.affectedRows === 1) {
							
							console.log("added to order_details cart");	
							console.log("i : "+i+" "+count);
							//update qty in sell table
							qty = checkout_cart[count].qty;
							cart_item = checkout_cart[count++].item_id;
							var query = "UPDATE sell SET ebay.sell.qty = ebay.sell.qty -"+qty +" where item_id = '"+cart_item+"'";
							
							mysql.fetchData(function(err, results) {
								if (err) {
									throw err;
								} else {
									if (results.affectedRows === 1) {							
										
										console.log("qty updated in sell table");									
																				
									} else{
										console.log("not inside loop");
									}
								}
							}, query); 
						} 
					}
				}, query,JSON_query); 				
							
			}	
				
		//delete the user cart!
			var query = "DELETE from cart where user_id = '"+req.session.user.user_id+"'";
			
			mysql.fetchData(function(err, results) {
				if (err) {
					throw err;
				} else {
					if (results.affectedRows === 1) {
						console.log("added to transection cart");						
					} 
				}
			}, query); 
	
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
	var query = "select ebay.sell.item,ebay.sell.item_id,ebay.cart.qty,ebay.sell.price,ebay.cart.seller_id from ebay.sell,ebay.users,ebay.cart where ebay.users.user_id=ebay.cart.user_id and ebay.sell.item_id = ebay.cart.id and ebay.cart.user_id ='"+req.session.user.user_id+"'";
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
		console.log("item in cart is "+cart_item.item_id);
		
		var query = "select * from cart where cart.id = '"+cart_item.item_id+"' and cart.user_id = '"+req.session.user.user_id+"'";
		
		mysql.fetchData(function(err, results) {
			if (err) {
				throw err;
			} else {
				
				if (results.length > 0) {
					console.log("already exist!");
					var current_qty = results[0].qty;
					var new_qty = qty + current_qty;
					var query = "update cart SET cart.qty ='"+ new_qty+"' where cart.id = '"+cart_item.item_id+"'";
					
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
							"id" : cart_item.item_id,
							"item" : cart_item.item,
							"qty" : qty,
							"user_id" : user,
							"seller_name" : cart_item.seller,
							"seller_id" : cart_item.seller_id
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
	var query = "select * from sell where item_id=?";
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
	if(req.session.user){
	var query = "select * from sell where not seller_id ='"+ req.session.user.user_id+"'";
	}else{
		var query = "select * from sell";
	}
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

	var getUser = "select * from users where username=?";

	// console.log("Query is:"+getUser);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0) {
				
				console.log(results);
				
				//get salt and hash it with password and check if two passwords are same or not!
				
				var get_salt = results[0].salt;
				var get_password = results[0].password;
				
				var sha512 = function(password, salt){
				    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
				    hash.update(password);
				    var value = hash.digest('hex');
				    return {
				        salt:salt,
				        passwordHash:value
				    };
				};
				
				var hashed_pass;				
				function saltHashPassword(userpassword) {
				    var salt = get_salt; /** Gives us salt of length 16 */
				    var passwordData = sha512(userpassword, salt);
				    hashed_pass = passwordData.passwordHash;				    
				}				
				
				saltHashPassword(password);
				
				if(hashed_pass === get_password){
					console.log("user is valid");
					//since user is valid. let's make his session!
					res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
					req.session.user = {
							"user_id" : results[0].user_id,
							"username" : username
					};
					console.log("user_id is : " + req.session.user.user_id);	
					res.send({"statusCode" : 200});	
				
				}else{
				console.log("Invalid Login");
				res.send({"statusCode" : 401});
				}
			} else {

				console.log("Invalid Login");
				res.send({"statusCode" : 401});	
			}
		}
	}, getUser, [username]);
});

router.get('/sell', function(req, res, next) {
	res.render('sell', {
		title : 'sell'
	});
});

router.post('/sell', function(req, res, next) {
	console.log("inside sell")
	if(req.session.user){
	
	var JSON_query = {

		"item" : req.body.item,
		"desc" : req.body.desc,
		"seller" : req.session.user.username,
		"seller_id" : req.session.user.user_id,
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
	
	}else{
		json_responses = {
				"statusCode" : 401
			};
			res.send(json_responses);
	}

});

router.post('/signup_scccess', function(req, res, next) {

	var first_name = req.body.firstname;
	var last_name = req.body.lastname;
	var user_name = req.body.username;
	var get_password = req.body.password;

	// console.log(firstname + " " + lastname + " "+ username+ " "+ password);
	
	//password salt hash

	var genRandomString = function(length){
	    return crypto.randomBytes(Math.ceil(length/2))
	            .toString('hex') /** convert to hexadecimal format */
	            .slice(0,length);   /** return required number of characters */
	};

	var sha512 = function(password, salt){
	    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
	    hash.update(password);
	    var value = hash.digest('hex');
	    return {
	        salt:salt,
	        passwordHash:value
	    };
	};
	
	var hashed_pass;
	var get_salt="";
	
	function saltHashPassword(userpassword) {
	    var salt = genRandomString(16); /** Gives us salt of length 16 */
	    var passwordData = sha512(userpassword, salt);
//	    console.log('UserPassword = '+userpassword);
//	    console.log('Passwordhash = '+passwordData.passwordHash);
//	    console.log('\nSalt = '+passwordData.salt);
	    hashed_pass = passwordData.passwordHash;
	    get_salt = salt;
	}

	
	saltHashPassword(get_password);
	
	var query_string = "INSERT INTO users SET ?";

	var JSON_query = {

		"firstname" : first_name,
		"lastname" : last_name,
		"username" : user_name,
		"password" : hashed_pass,
		"salt" : get_salt
	};

	var statusCode = 0;
	// insert signup data into DB
	mysql.fetchData(function(err, results) {
		if (err) {
			statusCode = 10;
			throw err;
			
		} else {
			if (results.affectedRows === 1) {
				console.log("signup successful");
//				res.redirect('signin');
				statusCode = 200;
			} else {
				console.log("didn't insert the query!");
				statusCode = 401;
			}
		}
		res.send({"statusCode" : statusCode});
	}, query_string, JSON_query);

});

module.exports = router;
