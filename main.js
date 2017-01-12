/**should be put into router folder**/
var VHome = angular.module('homePageApp', []);

VHome.controller('LoginClicked', ['$scope', '$location', function($scope){
	$scope.clicked = function() {
		$location.path('login/login.view.html');
	}
}]);

VHome.controller('RegisterClicked', ['$scope', '$location', function($scope){
	$scope.clicked = function() {
		$location.path('register/register.view.html');
	}
}]);