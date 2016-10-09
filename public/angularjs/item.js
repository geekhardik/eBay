
var app = angular.module('myApp',[]);

app.controller('item',function($scope,$http,$window){
	
	$scope.id = $window.id;
	$scope.getitem = function(x){	
	console.log("Item : "+$scope.id);
	$http({			
		method: "POST",
		url : '/item',
		data : {
			"id" : $scope.id
		}
					
	}).success(function(data){
		if (data.list) {			
			$scope.x = data.list[0];			
		}else{
			alert("somthing's wrong in callback of item.js");
		}
	});	
}
	$scope.cart = function(x){	
		
		$http({			
			method: "POST",
			url : '/cart',
			data : {
				"obj" : x,
				"qty" : $scope.qty
			}
						
		}).success(function(data){
			if (data.success == 200) {
				console.log("done");
				window.location.assign('cart');
							
			}else{
				alert("Please sign-in first!");
				window.location.assign('signin');
				
			}
		});
	}
	
});
	

	