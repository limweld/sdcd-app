'use strict';

angular.module('Main')
.factory('home_model',[
	'$http', 
	'$cookieStore',
	function ($http,$cookieStore) {
		
		var service = {};
		
		return service;
	}
]);	