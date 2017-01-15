angular.module("loginApp", []).controller("LoginController", ['$scope', '$http' , function($scope, $http) {
 	$scope.count= 0;
 	$scope.loginSubmit = function(){
 		var username = $scope.username;
 	    var password = $scope.password;
 	    $scope.count++;
 	    console.log("submitted");
 	    if($scope.count >= 3) {
 	    	console.log("you have tried to login for more than 3 times");
 	    }
 	    var data = {
 	    		username:username,
 	    		password:password
 	    };

 	    $http.post("/login/process", data).then(function(response) {
 	    	console.log(response.data);
 	    	console.log(response.data.message);

 	    	if(response.data.success == true) {
 	    	    console.log('Log in successfully ');
 	    	    $scope.loginMessage = "Login Successfully, please wait for redirection";
 	    	    window.location.href = "/coding";
 	        }
 	        else {
 	        	console.log('Log in Failed');
 	        	$scope.loginMessage = "Login Failed: " ;
 	        	$scope.failedReason = response.data.message;
 	        }
 	    }, function(response) {
            console.log('Some error happened when submit ');
            $scope.loginMessage = "Login Failed: " ;
 	    });
 	}
 }]);