'use strict';

angular.module('Navigation')
.controller('navigation_controller',[
	'$scope',
	'$location',
	'$timeout',
	'$rootScope',
	'$cookieStore',
	'navigation_model',
	function ($scope,$location,$timeout,$rootScope,$cookieStore,navigation_model) {
		
		let currentUser = $rootScope.globals.currentUser;
		
		$scope.navigation = {};
		$scope.navigation.featuresIcons = [];

		let defaultNavHighlight = function( val ){
			$scope.home_nav = val == "home" ? "w3-gray": "";
			$scope.archiver_nav = val == "archiver" ? "w3-gray": "";
			$scope.management_nav = val == "management" ? "w3-gray": "";
		}

		let findFeature = function(code) {
			return $scope.navigation.featuresIcons.findIndex(object => {
				return object.code === code;
			});
		}

		let featuresEnabledList = function(){
            navigation_model.featuresReadEnabled(
                currentUser === undefined ? "": currentUser.token,
                function(response){
                    if(response.status == 200){  
						$scope.navigation.featuresIcons = response.data;
						console.log("FM");
						$scope.archiver_nav_panel = findFeature("FM") != -1 ? true : false;
					}
                }
            );
        }
		
		$scope.home_click = function(){
			defaultNavHighlight("home");
		}

		$scope.archiver_click = function(){
			defaultNavHighlight("archiver");
		}

		$scope.management_click= function(){
			defaultNavHighlight("management");
		}

		featuresEnabledList();
	}
]);