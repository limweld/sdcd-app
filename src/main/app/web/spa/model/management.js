'use strict';

angular.module('Management')
.factory('management_model',[
	'$http', 
	'$cookieStore',
	function ($http,$cookieStore) {
		
		var service = {};
		
		service.pagination_state = function(currentPage,totalRows,rangeRows){
		
            var buttonRange = 3;
            var totalPages = parseInt(((totalRows-1)/rangeRows) + 1);
    
            var pagination_obj = {};
    
            var currentPageFrom = (parseInt((currentPage-1)/buttonRange) * buttonRange)+1;
            var currentPageLimit = (parseInt((currentPage-1)/buttonRange)+1) * buttonRange;
            var currentPageTo = currentPageLimit < (totalPages) ? currentPageLimit : (parseInt(totalPages));
    
            pagination_obj["first"] = 1 < totalPages  ? true : false;
            pagination_obj["next"] = 1 < totalPages  ? true : false;
            pagination_obj["nextPages"] = totalPages  ? ( currentPageTo != totalPages ? true : false) : false;
            pagination_obj["pages"] = [];
            pagination_obj["previousPages"] = 1 < totalPages  ? ( currentPageFrom != 1 ? true : false) : false;
            pagination_obj["previous"] = 1 < totalPages  ? true : false;
            pagination_obj["last"] = 1 < totalPages  ? true : false;
            pagination_obj["totalPages"] = totalPages;
            pagination_obj["skipRow"] = (currentPage-1) * rangeRows;
            pagination_obj["currentPage"] = currentPage;
            pagination_obj["rangeRow"] = rangeRows < totalRows  ? true : false;
            pagination_obj["groupRange"] = parseInt((currentPage)/buttonRange) + 1;
            pagination_obj["currentPageFrom"] = currentPageFrom;
            pagination_obj["currentPageTo"] = currentPageTo;
            pagination_obj["rangeRowData"] = rangeRows;
    
            if( 1 < totalPages){
                for (var i = currentPageFrom; i <= currentPageTo; i++) {
                    pagination_obj["pages"].push({"page":i,"active": i == currentPage ? "active" : ""});
                }
            }else{ pagination_obj["pages"] = []; }
    
            return pagination_obj;
        }

        service.usersCreate = function(
            token,
            username,
            password,
            firstname,
            lastname,
            details,
            enabled,
            callback
        ){
            $http.post(
                'api/users/create',
                { 
                    api_token: token,
                    username: username,
                    password: password,
                    firstname: firstname,
                    lastname: lastname,
                    details: details,
                    enabled: enabled
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);		
        }

		service.usersReadCount = function(
            token,
			field,
			search,
			callback		
		){
			$http.post(
                'api/users/read/count',
                { 
					api_token : token,
                    field_type : field,
					input_value : search
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);			
        }

		service.usersRead = function(
            token,
			field,
			search,
			page,
			range,
			callback		
		){
			$http.post(
                'api/users/read',
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

        service.usersUpdate = function(
            token,
            username,
            firstname,
            lastname,
            details,
            enabled,
            callback
        ){
            $http.post(
                'api/users/update',
                { 
                    api_token: token,
                    username: username,
                    firstname: firstname,
                    lastname: lastname,
                    details: details,
                    enabled: enabled
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);			
        }

        service.usersUpdatePassword = function(
            token,
            username,
            password,
            callback
        ){
            $http.post(
                'api/users/update/password',
                { 
                    api_token: token,
                    username: username,
                    password: password
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);		
        }

        service.usersDelete = function(
            token,
            username,
            callback
        ){
            $http.post(
                'api/users/delete',
                { 
					api_token: token,
                    username: username           
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);		
        }

        service.devicesReadCount = function(
            token,
			field,
			search,
			callback		
		){
			$http.post(
                'api/devices/read/count',
                { 
					api_token : token,
                    field_type : field,
					input_value : search
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);			
        }

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

        service.devicesCreate = function(
            token,
            name,
            ip,
            onDemand,
            protocol,
            port,
            username,
            password,
            details,
            callback
        ){
            $http.post(
                'api/devices/create',
                { 
                    api_token: token,
                    name: name,
                    ip: ip,
                    onDemand: onDemand,
                    protocol: protocol,
                    port: port,
                    username: username,
                    password: password,
                    details: details
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);		
        }

        service.devicesUpdate = function(
            token,
            name,
            ipAddress,
            onDemand,
            protocol,
            port,
            details,
            callback
        ){
            $http.post(
                'api/devices/update',
                { 
                    api_token: token,
                    name: name,
                    ipAddress: ipAddress,
                    onDemand: onDemand,
                    protocol: protocol,
                    port: port,
                    details: details
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);			
        }

        service.devicesUpdatePassword = function(
            token,
            name,
            username,
            password,
            callback
        ){
            $http.post(
                'api/devices/update/password',
                { 
                    api_token: token,
                    name: name,
                    username: username,
                    password: password
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);		
        }

        service.devicesDelete = function(
            token,
            name,
            callback
        ){
            $http.post(
                'api/devices/delete',
                { 
					api_token: token,
                    name: name           
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);		
        }

        service.devicesReload = function(
            token,
            callback
        ){
            $http.post(
                'api/devices/service/reload',
                { 
					api_token: token
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);		
        }

		return service;
	}
]);	