/**should be put into router folder**/
var VHome = angular.module('homeApp', []);
VHome.config(function($routeProvider, $locationProvider) {

        /*$routeProvider
            .when('/', {
                templateUrl : 'partials/home.html',
                controller : mainController
            })
            .when('/about', {
                templateUrl : 'partials/about.html',
                controller : mainController
            })
            .when('/contact', {
                templateUrl : 'partials/contact.html',
                controller : mainController
            });*/
    
        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    });

VHome.controller('myCtrl', ['$scope', '$location', function($scope, $location){
	$scope.loginClicked = function() {
		$location.path('login/login.view.html');
		console.log("login clicked"); 
	}

	$scope.registerClicked = function() {
		$location.path('register/register.view.html');
		console.log("register clicked"); 
	}
}]);
