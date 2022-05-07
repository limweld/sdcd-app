'use strict';

angular.module('Authentication')
.controller('auth_controller',[
	'$scope',
	'$rootScope',
	'$location',
	'auth_model',
	function ($scope, $rootScope, $location, auth_model) {
	
	$scope.login_view = true;
	$scope.register_view = false;
	$scope.register_varification_view = false;
	$scope.account_reset_view = false;
	$scope.navigation = false;

	$scope.login = {};

	let check_btn = function(){
		if($scope.login.username != null && $scope.login.username != "" && $scope.login.password != null && $scope.login.password != ""){
			$scope.login.login_btn_disabled = false;
		}else{
			$scope.login.login_btn_disabled = true;
		}
	}   
	
	let login_ui_postvalidation = function( error_color, error_visibility, error_desc ){
		$scope.login.error_color = error_color;
		$scope.login.error_visibility = error_visibility;
		$scope.login.error_desc = error_desc;
		$scope.login.username =
		$scope.login.password = "";
		$scope.login.login_btn_disabled = true;
		$scope.login.loading = false;
	}

	let set_UserInfo = function(obj){

		auth_model.SetCredentials(
			obj.id, 
			obj.token,	
			obj.username,
			obj.firstname + " " + obj.lastname
		);

		$location.path('/');

	}

	$scope.login.login_click = function(){
            
		$scope.login.loading = true; 
		$scope.login.login_btn_disabled = true;
		auth_model.login(
			$scope.login.username, 
			$scope.login.password,
			function(response){   
				
				if(response.status == 200){
					if(response.data.length > 0){
						set_UserInfo(response.data[0]);
						login_ui_postvalidation( "alert-success", true, "Login Successfully" );
						return 0;
					}
					
					login_ui_postvalidation( "alert-danger", true, "Invalid Credentials" );
					return 0;
				}

				login_ui_postvalidation( "alert-danger", true, "Network Error !" );
		});

	}

	$scope.login.username_change = function(){
		check_btn();
	}

	$scope.login.password_change = function(){
		check_btn();
	}

	$scope.login.key_enter = function(keyEvent){
		if(keyEvent.which === 13){
			$scope.login.login_click();
		}
	}

	$scope.login.login_btn_disabled = true;
	$scope.login.error_visibility = false;

	$(".sidenav-place").css("width", "0px");
	
}]);