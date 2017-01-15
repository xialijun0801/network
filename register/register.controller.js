

angular.module("registerApp", []).controller("RegisterController", ['$scope', '$http' , function($scope, $http) {
	$scope.count= 0;
	$scope.registerSuccess = false;

	$scope.registerSubmit = function(){
	    console.log("registration submitted");
	    var username = $scope.username;
 	    var password = $scope.password;
 	    var password2 = $scope.password2;
 	    var email = $scope.email;
 		var firstname = $scope.firstname;
 	    var lastname = $scope.lastname;
 	    $scope.count++;
 	    if($scope.count >= 3) {
 	    	console.log("you have tried to register for more than 3 times");
 	    }
 	    if(password !== password2) {
 	    	$scope.registerMessage = "Password does not match";
 	    	return;
 	    }

 	    var data = {
 	    	    firstname:firstname,
 	    	    lastname:lastname,
 	    	    email:email,
 	    		username:username,
 	    		password:password
 	    };

        console.log("send request register " + JSON.stringify(data));

        $http.post("/register/process", data).then(function(response) {
 	    	console.log(response.data);
 	    	console.log(response.data.message);

 	    	if(response.data.success == true) {
 	    	    console.log('register successfully ' + response.data.message);
 	    	    $scope.registerMessage = "Register Successfully";
 	    	    $scope.registerSuccess= true;
 	        }
 	        else {
 	        	console.log('Registration Failed' + response.data.message);
 	        	$scope.registerMessage = "Register Failed";
 	        }
 	    }, function(response) {
            console.log('Some error happened when submit' + response);
            $scope.registerMessage = "Register Failed";
 	    });
    };

    $scope.transferToLogin = function(){
    	window.location.href = "/login";
    }
}]);
