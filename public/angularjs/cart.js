
var app = angular.module('myApp',[]);

app.controller('cart',function($scope,$http){
		
	$scope.load = function(){	
	$http({			
		method: "POST",
		url : '/getCart',						
	}).success(function(data){
		if(data.cart){
			$scope.cart_check = data.cart;
			$scope.price = data.price;	
		}else{
			alert("somthing's wrong in callback of cart.js");
		}
	});	
};

	$scope.home = function(){
		window.location.assign('home');
	}
	$scope.checkout = function(){	
		
		$http({			
			method: "POST",
			url : '/gotoCheckout',
			/*data : {
				
			}*/
						
		})
		.success(function(data){
			if (data.success == 200) {
				window.location.assign('checkout');
							
			}else{
				alert("something is wrong in checking out!!");
						
			}
		});
	}
	
});
	

	