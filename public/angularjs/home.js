
var app = angular.module('myApp',[]);

app.controller('home',function($scope,$http){
	
	$scope.logout = function(){
		
		$http({			
			method: "POST",
			url : '/logout',
						
		}).success(function(data){
			if (data.statusCode == 401) {
				alert("somthing's wrong in callback of home.js");
			}
			else
				//Making a get call to the '/redirectToHomepage' API
				alert("You are successfully logged out from eBay! Happy shopping..");
				window.location.assign("/signin");
			
		}).error(function(error){
			console.log(data.msg);
			$scope.result = data.msg;			
		});
	};
	
});