'use strict';

angular.module('Main')
.factory('home_model',[
	'$http', 
	'$cookieStore',
	function ($http,$cookieStore) {
		
		var service = {};
		
		service.devicesRead = function(
            token,
			field,
			search,
			page,
			range,
			callback		
		){
			$http.post(
                'api/devices/read',
                { 
					api_token : token,
                    field_type : field,
					input_value : search,
					page : page,
    				range : range
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);			
        }

		return service;
	}
]);	