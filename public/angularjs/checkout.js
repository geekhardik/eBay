
var app = angular.module('myApp',[]);

app.controller('checkout',function($scope,$http){
		
	$scope.getcart = function(){	
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

	$scope.buy = function(){	
	console.log("in buy!");
	$http({			
		method: "POST",
		url : '/boughtPage',
		data : {
			"cart" : $scope.cart_check,
			"total" : $scope.price,
			"cc": $scope.cc ,
			"cvv": $scope.cvv,
			"exp_month": $scope.exp_month,
			"exp_year": $scope.exp_year
		}
					
	}).success(function(data){
		if (data.success == 200) {
			console.log("done");
//			window.location.assign('cart');
						
		}else{
			alert("Please sign-in first!");
//			window.location.assign('signin');
			
		}
	});
}
	
});
	

	