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

    	authFactory.isLoggedIn = function() {
    		if(AuthToken.getToken())
    			return true;
    		else 
    			return false;
    	}

    	authFactory.getUser = function(){
    		if(AutoToken.getToken())
    			return $http.get('../me');
    		else 
    			return $q.reject({message: "User has no tokne"})
    	}

    	return authFactory;
    })

    .factory('AuthToken', function($window) {
    	var authTokenFactory = {};

    	authTokenFactory.getToken = function() {
    		return $window.localStorage.getItem('token');
    	}

    	authTokenFactory.setToken = function(token) {
    		if(token)
    			$window.localStorage.setItem('token', token);
    		else
    			$window.localStorage.removeItem('token');
    	}
    	return autoTokenFactory;
    })

    .factory('AuthInterceptor', function($q, $location, AutoToken){
    	var interceptorFactory = {};


        interceptorFactory.request = function(config){
            var token = AutoToken.getToken();
            if(token) {
                config.headers['x-access-token'] = token;
            }
            return config;
        }

    	interceptorFactory.responseError = function(response) {
    		if (response.status == 403) {
    			$location.path('/login');
    		}
    		return $q.reject(response);
    	}
    	return interceptorFactory;
    })
   