'use strict';

angular.module('Archiver')
.factory('archiver_model',[
	'$http', 
	'$cookieStore',
	function ($http,$cookieStore) {
		
		var service = {};
		
		service.featuresReadEnabled = function(
            token,
			callback		
		){
			$http.post(
                'api/features/read/enabled',
                { 
					api_token : token
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);			
        }

		return service;
	}
]);	