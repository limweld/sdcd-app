'use strict';

angular.module('Archiver')
.controller('archiver_controller',[
	'$scope',
	'$location',
	'$timeout',
	'$rootScope',
	'$cookieStore',
	'$filter',
	'archiver_model',
	function ($scope,$location,$timeout,$rootScope,$cookieStore,$filter,archiver_model) {
		
		let currentUser = $rootScope.globals.currentUser;
		
		$scope.archiver = {};
		$scope.archiver.faceMaskArchiverPanelVisibility = false;

		$scope.user = {};
		$scope.user.fullname = currentUser.fullname;

		$scope.archiver.faceMaskArchiverPanelVisibility = false;
		
		$scope.navigation = {};
		$scope.navigation.featuresIcons = [];

		let findFeature = function(code) {
			return $scope.navigation.featuresIcons.findIndex(object => {
				return object.code === code;
			});
		}

		let featuresEnabledList = function(){
            archiver_model.featuresReadEnabled(
                currentUser.token,
                function(response){
                    if(response.status == 200){  
						$scope.navigation.featuresIcons = response.data;
						$scope.archiver.faceMaskArchiverPanelVisibility = findFeature("FM") != -1 ? true : false;
						$scope.archiver.NoPanelVisibility = findFeature("FM") == -1 ? true : false;
					}
                }
            );
        }
		
		$scope.main_navigation_open = function(){
			$('.sidenav-place').css("display","block");
	    }	
		
	   $(".sidenav-place").css("width", "100px");	
	   
	   featuresEnabledList();


	  

	   	$scope.archivers = {};
	   	$scope.archivers.archive = {};

		$scope.archivers.archive.rangeRows = [
			{ id : 0, value : 5 }, 
			{ id : 1, value : 10 },
			{ id : 2, value : 20 },
			{ id : 3, value : 50 },
			{ id : 4, value : 100 },
			{ id : 5, value : 200 },
		];

		$scope.archivers.archive.pagination = {};
        $scope.archivers.archive.pagination.state = {};

		$scope.archivers.archive.searchArchiveFieldType = "source_from";
		$scope.archivers.archive.searchArchiveInputField = "";

	   

		$scope.archivers.archive.clickTab = function(){
			$scope.archivers.archive.entryListViewPanel = true;
			$scope.archivers.archive.tableViewVisibility = true;
			$scope.archivers.archive.addModifyViewEntryPanel = false;
			$scope.archivers.archive.page = 1;
			archivesListCount( $scope.archivers.archive.searchArchiveFieldType, $scope.archivers.archive.searchArchiveInputField);
		}


		let archivesListTransformed = function( obj ){

			let valObject = {};

			valObject.id = obj.id;
			valObject.source_from = obj.source_from;
			valObject.created_at = obj.created_at != undefined ? new Date(obj.created_at).toUTCString() : "";

			$scope.archivers.archive.archiveListTransformed.push(valObject);			
		}

		let archivesCreate = function( sourceFrom, image ){

		}

		let archivesListCount = function( field, search ){
			$scope.archivers.archive.loadingListEntryVisibility = true;
            archiver_model.archivesReadCount(
                currentUser.token,
				field,
				search,
                function(response){
                    if(response.status == 200 && response.data[0] != undefined){
                        $scope.archivers.archive.totalrows = response.data[0].total; 
                        $scope.archivers.archive.pagination.state = archiver_model.pagination_state($scope.archivers.archive.page, $scope.archivers.archive.totalrows ,$scope.archivers.archive.selected.value);
                        archivesList( $scope.archivers.archive.searchArchiveFieldType, $scope.archivers.archive.searchArchiveInputField, $scope.archivers.archive.page, $scope.archivers.archive.selected.value);
                    }
                }
            );
		}

		let archivesList = function( field, search, page, range ){
			$scope.archivers.archive.loadingListEntryVisibility = true;
			archiver_model.archivesRead(
                currentUser.token,
				field,
				search,
				page,
				range,
                function(response){
                    $scope.archivers.archive.list = [];
                    if(response.status == 200){

						$scope.archivers.archive.archiveListTransformed = [];

						let dataList = response.data;
						dataList.forEach(archivesListTransformed);

						$scope.archivers.archive.list = $scope.archivers.archive.archiveListTransformed;

                        $scope.archivers.archive.showfrom = $scope.archivers.archive.list.length == 0 ? 0 : ((page - 1) * range) + 1;
                        $scope.archivers.archive.showto = ((page - 1) * range) + $scope.archivers.archive.list.length;
                        //$scope.archivers.archive.search = $scope.archivers.archive.search_temp;
                        $scope.archivers.archive.loadingListEntryVisibility = false;
                    }
                }
            );

		}

		let archivesReadSingle = function( id ){
			$scope.archivers.archive.loadingActionEntryVisibility = true;
			archiver_model.archivesReadSingle(
                currentUser.token,
				id,
                function(response){
                    $scope.archivers.archive.list = [];
                    if(response.status == 200 && response.data.length != 0 ){
						$scope.archivers.archive.image = response.data[0].image;
						$scope.archivers.archive.loadingActionEntryVisibility = false;
                    }
                }
			);
		}

		let archivesDelete = function( id ){
			$scope.archivers.archive.loadingActionEntryVisibility = true;
			archiver_model.archivesDelete(
                currentUser.token,
				id,
				function(response){
					if(response.status == 200){
						$scope.archivers.archive.loadingActionEntryVisibility = false;
						$scope.archivers.archive.clickTab();
					}
				}
			);
		}

		$scope.archivers.archive.searchArchivesEntryButton = function(){
			$scope.archivers.archive.page = 1;
			archivesListCount( $scope.archivers.archive.searchArchiveFieldType, $scope.archivers.archive.searchArchiveInputField);
		}

		$scope.archivers.archive.selectedRangeRowChange = function(){
			$scope.archivers.archive.selected = $scope.archivers.archive.selectedRangeRow;
		}

		$scope.archivers.archive.pagination.first_click =  function(){
            if($scope.archivers.archive.pagination.state.currentPage > 1){
                $scope.archivers.archive.page = 1;
				archivesListCount( $scope.archivers.archive.searchArchiveFieldType, $scope.archivers.archive.searchArchiveInputField);
            }	
        }
        
        $scope.archivers.archive.pagination.previous_click =  function(){
            if($scope.archivers.archive.pagination.state.currentPage > 1){
                $scope.archivers.archive.page = $scope.archivers.archive.pagination.state.currentPage - 1;
				archivesListCount( $scope.archivers.archive.searchArchiveFieldType, $scope.archivers.archive.searchArchiveInputField);
            }
        }
        
        $scope.archivers.archive.pagination.previouspages_click =  function(){
            if($scope.archivers.archive.pagination.state.currentPage > 1){
                $scope.archivers.archive.page = $scope.archivers.archive.pagination.state.currentPageFrom - 1;
				archivesListCount( $scope.archivers.archive.searchArchiveFieldType, $scope.archivers.archive.searchArchiveInputField);
            }
        }

        $scope.archivers.archive.pagination.pages_click = function(value){
            $scope.archivers.archive.page = value.page;
			archivesListCount( $scope.archivers.archive.searchArchiveFieldType, $scope.archivers.archive.searchArchiveInputField);
        }

        $scope.archivers.archive.pagination.nextpages_click =  function(){
            	
            if($scope.archivers.archive.pagination.state.currentPage < $scope.archivers.archive.pagination.state.totalPages){
                
                $scope.archivers.archive.page = $scope.archivers.archive.pagination.state.currentPageTo + 1;
				archivesListCount( $scope.archivers.archive.searchArchiveFieldType, $scope.archivers.archive.searchArchiveInputField);
            }
        }
        
        $scope.archivers.archive.pagination.next_click = function(){	
            if($scope.archivers.archive.pagination.state.currentPage < $scope.archivers.archive.pagination.state.totalPages){
				$scope.archivers.archive.page = $scope.archivers.archive.pagination.state.currentPage + 1,
				archivesListCount( $scope.archivers.archive.searchArchiveFieldType, $scope.archivers.archive.searchArchiveInputField);
            }
        }
        
        $scope.archivers.archive.pagination.last_click = function(){
            if( $scope.archivers.archive.pagination.state.currentPage < $scope.archivers.archive.pagination.state.totalPages){
                $scope.archivers.archive.page = $scope.archivers.archive.pagination.state.totalPages;
				archivesListCount( $scope.archivers.archive.searchArchiveFieldType, $scope.archivers.archive.searchArchiveInputField);
            }
        }

	
		let createModifyArchiveEntryPanel = function( val ){
			$scope.archivers.archive.entryListViewPanel = val == "modify" || val == "create" ? false : true;
			$scope.archivers.archive.addModifyViewEntryPanel = val == "modify" || val == "create" ? true : false;
		}

		let archiveEntryFeilds = function( actionType, obj ){

			$scope.archivers.archive.id = actionType == "modify" ? obj.id : "";
			$scope.archivers.archive.sourceFrom = actionType == "modify" ? obj.source_from : "";
			$scope.archivers.archive.image = actionType == "modify" ? obj.image : "";
			$scope.archivers.archive.createdAt = actionType == "modify" ? ( obj.created_at != undefined ? new Date(obj.created_at).toUTCString(): "") : "";

			$scope.archivers.archive.errorAddUserValidationMessageVisibility = false;
		}

		$scope.archivers.archive.modifyEntryClickButton = function( obj ){
			createModifyArchiveEntryPanel("modify");
			archiveEntryFeilds("modify", obj);		
			archivesReadSingle(obj.id);
		}

		$scope.archivers.archive.cancelArchiveEntryButton = function(){
			createModifyArchiveEntryPanel("back");
			$scope.archivers.archive.clickTab();
		}

		$scope.archivers.archive.deleteArchiveEntryButton = function(){
			$("#addArchiveModal").modal('show'); 
		}

		$scope.archivers.archive.confirmDeleteUserEntryButton = function(){
			archivesDelete($scope.archivers.archive.id);
			$("#addArchiveModal").modal('hide'); 
		}

		$scope.archivers.archive.selected = $scope.archivers.archive.rangeRows[0];
		$scope.archivers.archive.selectedRangeRow = $scope.archivers.archive.rangeRows[0];

		$scope.archivers.archive.clickTab();

	}
]);