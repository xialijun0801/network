angular.module('authService', [])
    .factory('Auth', function($http, $q, AutoToken) {
    	var authFactory = {};

    	authFactory.login = function(username, password) {
    		return $http.post('../login/process', {
    			username: username,
    			password: password
    		}).success(function(data) {
    			AuthToken.setToken(data.token);
    			return data;
    		});
    	}

    	authFactory.logout = function() {
    		AuthToken.setToken();
    	}

    	authfactory.isLoggedIn = function() {
    		if(AuthToken.getToken())
    			return true;
    		else 
    			return false;
    	}
    })