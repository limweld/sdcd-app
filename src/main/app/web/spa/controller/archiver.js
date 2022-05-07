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
		
		$scope.user = {};
		$scope.user.fullname = currentUser.fullname;
		
		$scope.main_navigation_open = function(){
			$('.sidenav-place').css("display","block");
	    }	
		
	   $(".sidenav-place").css("width", "100px");	
	   
	}
]);