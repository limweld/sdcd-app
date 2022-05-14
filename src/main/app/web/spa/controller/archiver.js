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
	}
]);