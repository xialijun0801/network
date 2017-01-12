/**should be put into router folder**/
angular.module('homeApp', [])
.controller('myCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.loginClicked = function() {
    	window.location.href = "/login";
    };
    $scope.registerClicked = function() {
    	window.location.href = "/register";
	}
}]);
