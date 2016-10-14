
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
	$scope.checkout = function(){	
		
		$http({			
			method: "POST",
			url : '/checkout',
			data : {
				
			}
						
		}).success(function(data){
			if (data.success == 200) {
				
							
			}else{
				alert("Please sign-in first!");
				window.location.assign('signin');
				
			}
		});
	}
	
});
	

	