'use strict';

angular.module('Archiver')
.factory('archiver_model',[
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
		
		service.archivesReadCount = function(
            token,
			field,
			search,
			callback		
		){
			$http.post(
                'api/archives/read/count',
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

		service.archivesRead = function(
            token,
			field,
			search,
			page,
			range,
			callback		
		){
			$http.post(
                'api/archives/read',
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

		service.archivesReadSingle = function(
            token,
			id,
			callback		
		){
			$http.post(
                'api/archives/read/single',
                { 
					api_token : token,
    				id : id
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);			
        }

        service.archivesDelete = function(
            token,
            id,
            callback
        ){
            $http.post(
                'api/archives/delete',
                { 
					api_token: token,
                    id: id           
                }
			).then(
			   function(response){ callback(response); }, 
			   function(response){ callback(response); }
			);		
        }

		return service;
	}
]);	