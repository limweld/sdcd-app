'use strict';

angular.module('Management')
.controller('management_controller',[
	'$scope',
	'$location',
	'$timeout',
	'$rootScope',
	'$cookieStore',
	'$filter',
	'management_model',
	function ($scope,$location,$timeout,$rootScope,$cookieStore,$filter,management_model) {
		
		let currentUser = $rootScope.globals.currentUser;

		$scope.user = {};
		$scope.user.fullname = currentUser.fullname;
		
		$scope.main_navigation_open = function(){
			$('.sidenav-place').css("display","block");
	    }	
		
	   	$(".sidenav-place").css("width", "100px");	
	   
	   	$scope.management = {};
	 
		let managementTabs = function( val ){
			$scope.management.devices.tabActive = (val == "devices" ? "w3-gray" : "w3-black");			
			$scope.management.users.tabActive = (val == "users" ? "w3-gray" : "w3-black");
			$scope.management.features.tabActive = (val == "features" ? "w3-gray" : "w3-black");
			$scope.management.devices.tableViewVisibility = (val == "devices" ? true : false);
			$scope.management.users.tableViewVisibility = (val == "users" ? true : false);
			$scope.management.features.tableViewVisibility = (val == "features" ? true : false);
		}


		$scope.management.features = {};

		$scope.management.features.clickTab = function(){
			managementTabs("features");
		}


		/*** Users Panel TOP ***/

		let createModifyUserEntryPanel = function( val ){
			$scope.management.users.entryListViewPanel = val == "modify" || val == "create" ? false : true;
			$scope.management.users.addModifyViewEntryPanel = val == "modify" || val == "create" ? true : false;
			$scope.management.users.deleteUserEntryButtonVisibility = val == "modify" ? true : false;
			$scope.management.users.saveUserEntryButtonVisibility = val == "modify" ? true : false;
			$scope.management.users.addUserEntryButtonVisibility = val == "create" ? true : false;
			$scope.management.users.idFieldVisibility = val == "modify" ? true : false;
			$scope.management.users.createdAtFieldVisibility = val == "modify" ? true : false;
			$scope.management.users.updatedAtFieldVisibility = val == "modify" ? true : false;
			$scope.management.users.usernameFieldDisabled = val == "modify" ? true : false;
			$scope.management.users.user.passwordAction = val == "modify" ? "Update" : "Create";
			$scope.management.users.userEntryAction = val == "modify" ? "Update" : "Create";
		}

		let userEntryFeilds = function( actionType, obj ){

			$scope.management.users.user.id = actionType == "modify" ? obj.id : "";
			$scope.management.users.user.username = actionType == "modify" ? obj.username : "";
			$scope.management.users.user.password = actionType == "modify" ? obj.password : "";
			$scope.management.users.user.confirmPassword = actionType == "modify" ? obj.confirmPassword : "";
			$scope.management.users.user.firstname = actionType == "modify" ? obj.firstname : "";
			$scope.management.users.user.lastname = actionType == "modify" ? obj.lastname : "";
			$scope.management.users.user.details = actionType == "modify" ? obj.details : "";
			$scope.management.users.user.enabled = actionType == "modify" ? (obj.enabled == 1 ? true : false): "";
			$scope.management.users.user.createdAt = actionType == "modify" ? ( obj.created_at != undefined ? new Date(obj.created_at).toUTCString(): "") : "";
			$scope.management.users.user.updatedAt = actionType == "modify" ? ( obj.updated_at != undefined ? new Date(obj.updated_at).toUTCString(): "") : "";

			$scope.management.users.errorAddUserValidationMessageVisibility = false;
		}

		$scope.management.users = {};
		$scope.management.users.user = {};

		$scope.management.users.pagination = {};
        $scope.management.users.pagination.state = {};

		$scope.management.users.searchUserFieldType = "username";
		$scope.management.users.searchUserInputField = "";

		$scope.management.users.clickTab = function(){
			$scope.management.users.page = 1;
			managementTabs("users");
			createModifyUserEntryPanel("back");
			usersCount( $scope.management.users.searchUserFieldType, $scope.management.users.searchUserInputField);
			$scope.management.users.searchUserInputField = "";
		}

		$scope.management.users.rangeRows = [
			{ id : 0, value : 5 }, 
			{ id : 1, value : 10 },
            { id : 2, value : 20 },
            { id : 3, value : 50 },
            { id : 4, value : 100 },
            { id : 5, value : 200 },
        ];

		$scope.management.users.selectedRangeRow = $scope.management.users.rangeRows[0];

		$scope.management.users.selectedRangeRowChange = function(){
			$scope.management.users.selected = $scope.management.users.selectedRangeRow;
		}

		$scope.management.users.createUserEntryButton = function(){
			createModifyUserEntryPanel("create");
			userEntryFeilds("create", $scope.management.users.user);
		}

		$scope.management.users.searchUserEntryButton = function(){
			$scope.management.users.page = 1;
			usersCount( $scope.management.users.searchUserFieldType, $scope.management.users.searchUserInputField);
		}

		
		$scope.management.users.addUserEntryButton = function(){

			
			if($scope.management.users.user.username == undefined || $scope.management.users.user.username == "" ){
				$scope.management.users.errorAddUserValidationMessageVisibility =true;
				$scope.management.users.errorAddUserValidationMessage = ( $scope.management.users.user.username == "" ? "Username " : "" ) + "Required Confirmed Password not Equal!"
			}else{
			
				if($scope.management.users.user.confirmPassword == $scope.management.users.user.password && $scope.management.users.user.confirmPassword != ""){
					
					usersCreate(
						$scope.management.users.user.username, 
						$scope.management.users.user.password, 
						$scope.management.users.user.firstname, 
						$scope.management.users.user.lastname , 
						$scope.management.users.user.details, 
						$scope.management.users.user.enabled == true ? 1 : 0
					);

				}else{
					$scope.management.users.errorAddUserValidationMessageVisibility =true;
					$scope.management.users.errorAddUserValidationMessage = ( $scope.management.users.user.username == "" ? "Username " : "" ) + "Required Confirmed Password not Equal!"
				}
			}

			
		}

		$scope.management.users.updateUserEntryButton = function(){

			if($scope.management.users.user.username == undefined || $scope.management.users.user.username == "" ){
				$scope.management.users.errorAddUserValidationMessageVisibility =true;
				$scope.management.users.errorAddUserValidationMessage =  "Username Required!"
			}else{
					
				usersUpdate(
					$scope.management.users.user.username, 
					$scope.management.users.user.firstname, 
					$scope.management.users.user.lastname , 
					$scope.management.users.user.details, 
					$scope.management.users.user.enabled == true ? 1 : 0
				);
			}
		}

		$scope.management.users.deleteUserEntryButton = function(){
			$("#addUserModal").modal('show'); 
		}

		$scope.management.users.cancelUserEntryButton = function(){
			createModifyUserEntryPanel("back");
			$scope.management.users.clickTab();
		}



		$scope.management.users.confirmDeleteUserEntryButton = function(){
			usersDelete($scope.management.users.user.username);
			$("#addUserModal").modal('hide'); 
		}

		$scope.management.users.cancelDeleteUserEntryButton = function(){

		}

		$scope.management.users.modifyEntryClickButton = function( obj ){
			createModifyUserEntryPanel("modify");
			userEntryFeilds("modify", obj);
		}

		let usersListTransformed = function( obj ){
			$scope.management.users.user = obj;
			$scope.management.users.user.enabledCheck =  obj.enabled == 1 ? true: false;
			$scope.management.users.usersListTransformed.push($scope.management.users.user);			
		}

		let usersCount = function( field, search ){
            $scope.management.users.loadingListEntryVisibility = true;
            management_model.usersReadCount(
                currentUser.token,
				field,
				search,
                function(response){
                    if(response.status == 200 && response.data[0] != undefined){
                        $scope.management.users.totalrows = response.data[0].total;
                        $scope.management.users.pagination.state = management_model.pagination_state($scope.management.users.page, $scope.management.users.totalrows ,$scope.management.users.selected.value);
                        usersList( $scope.management.users.searchUserFieldType, $scope.management.users.searchUserInputField, $scope.management.users.page, $scope.management.users.selected.value);
                    }
                }
            );
        }

		let usersList = function( field, search, page, range ){
            management_model.usersRead(
                currentUser.token,
				field,
				search,
				page,
				range,
                function(response){
                    $scope.management.users.list = [];
                    if(response.status == 200){

						$scope.management.users.usersListTransformed = [];
						let dataList = response.data;

						dataList.forEach(usersListTransformed);

                        $scope.management.users.list = response.data;                        
                        $scope.management.users.showfrom = $scope.management.users.list.length == 0 ? 0 : ((page - 1) * range) + 1;
                        $scope.management.users.showto = ((page - 1) * range) + $scope.management.users.list.length;
                        //$scope.management.users.search = $scope.management.users.search_temp;
                        $scope.management.users.loadingListEntryVisibility = false;
                    }
                }
            );
        }

		let usersCreate = function(username, password, firstname, lastname, details, enabled){
			$scope.management.users.loadingActionEntryVisibility = true;
			management_model.usersCreate(
				currentUser.token,
				username, 
				password, 
				firstname, 
				lastname, 
				details, 
				enabled,
				function(response){
					if(response.status == 200){
						$scope.management.users.loadingActionEntryVisibility = false;
						$scope.management.users.clickTab();
					}
				}
			);
		}

		let usersUpdate = function(username, firstname, lastname, details, enabled){
			$scope.management.users.loadingActionEntryVisibility = true;
			management_model.usersUpdate(
                currentUser.token,
				username, 
				firstname, 
				lastname, 
				details, 
				enabled,
				function(response){
					if(response.status == 200){
						$scope.management.users.loadingActionEntryVisibility = false;
						$scope.management.users.clickTab();
					}
				}
			);
		}

		let usersUpdatePassword = function(username, password){
			$scope.management.users.loadingPasswordUpdateActionEntryVisibility = true;
			management_model.usersUpdatePassword(
                currentUser.token,
				username, 
				password,
				function(response){
					if(response.status == 200){
						$scope.management.users.loadingPasswordUpdateActionEntryVisibility = false;
						$("#updateUserPasswordModal").modal('hide'); 
					}
				}
			);
		}

		let usersDelete = function(username){
			$scope.management.users.loadingActionEntryVisibility = true;
			management_model.usersDelete(
                currentUser.token,
				username,
				function(response){
					if(response.status == 200){
						$scope.management.users.loadingActionEntryVisibility = false;
						$scope.management.users.clickTab();
					}
				}
			);
		}


		$scope.management.users.pagination.first_click =  function(){
            if($scope.management.users.pagination.state.currentPage > 1){
                $scope.management.users.page = 1;
				usersCount( $scope.management.users.searchUserFieldType, $scope.management.users.searchUserInputField);
            }	
        }
        
        $scope.management.users.pagination.previous_click =  function(){
            if($scope.management.users.pagination.state.currentPage > 1){
                $scope.management.users.page = $scope.management.users.pagination.state.currentPage - 1;
				usersCount( $scope.management.users.searchUserFieldType, $scope.management.users.searchUserInputField);
            }
        }
        
        $scope.management.users.pagination.previouspages_click =  function(){
            if($scope.management.users.pagination.state.currentPage > 1){
                $scope.management.users.page = $scope.management.users.pagination.state.currentPageFrom - 1;
				usersCount( $scope.management.users.searchUserFieldType, $scope.management.users.searchUserInputField);
            }
        }

        $scope.management.users.pagination.pages_click = function(value){
            $scope.management.users.page = value.page;
			usersCount( $scope.management.users.searchUserFieldType, $scope.management.users.searchUserInputField);
        }

        $scope.management.users.pagination.nextpages_click =  function(){
            	
            if($scope.management.users.pagination.state.currentPage < $scope.management.users.pagination.state.totalPages){
                
                $scope.management.users.page = $scope.management.users.pagination.state.currentPageTo + 1;
				usersCount( $scope.management.users.searchUserFieldType, $scope.management.users.searchUserInputField);
            }
        }
        
        $scope.management.users.pagination.next_click = function(){	
            if($scope.management.users.pagination.state.currentPage < $scope.management.users.pagination.state.totalPages){
				$scope.management.users.page = $scope.management.users.pagination.state.currentPage + 1,
				usersCount( $scope.management.users.searchUserFieldType, $scope.management.users.searchUserInputField);
            }
        }
        
        $scope.management.users.pagination.last_click = function(){
            if( $scope.management.users.pagination.state.currentPage < $scope.management.users.pagination.state.totalPages){
                $scope.management.users.page = $scope.management.users.pagination.state.totalPages;
				usersCount( $scope.management.users.searchUserFieldType, $scope.management.users.searchUserInputField);
            }
        }

		$scope.management.users.updatePasswordButton = function(){
			$("#updateUserPasswordModal").modal('show'); 
			$scope.management.users.user.password = "";
			$scope.management.users.user.confirmPassword = "";
			$scope.management.users.errorPasswordValidationMessageVisibility = false;
		}

		$scope.management.users.passwordConfirmEntryButton = function(){
			if($scope.management.users.user.passwordAction == "Update"){
				if($scope.management.users.user.confirmPassword == $scope.management.users.user.password && $scope.management.users.user.confirmPassword != ""){
					usersUpdatePassword(
						$scope.management.users.user.username,
						$scope.management.users.user.confirmPassword
					);
				}else{
					$scope.management.users.errorPasswordValidationMessageVisibility = true;
					$scope.management.users.errorPasswordValidationMessage = "Confirmed Password not Equal!";
				}
			}

			if($scope.management.users.user.passwordAction == "Create"){
				if($scope.management.users.user.confirmPassword == $scope.management.users.user.password && $scope.management.users.user.confirmPassword != ""){
					$("#updateUserPasswordModal").modal('hide'); 
				}else{
					$scope.management.users.errorPasswordValidationMessageVisibility = true;
					$scope.management.users.errorPasswordValidationMessage = "Confirmed Password not Equal!";
				}
			}
		}

		
		

		/*** User Panel Init ***/

		$scope.management.users.entryListViewPanel = true;

		$scope.management.users.loadingActionEntryVisibility = false;
		$scope.management.users.loadingListEntryVisibility = false;

		$scope.management.users.searchUserFieldType = "username";
		$scope.management.users.searchUserInputField = "";

		$scope.management.users.selected = $scope.management.users.rangeRows[0];


		/*** Users Panel BOTTOM ***/


		/*** Devices Panel BOTTOM ***/
		$scope.management.devices = {};
		$scope.management.devices.user = {};

		$scope.management.devices.pagination = {};
        $scope.management.devices.pagination.state = {};

		$scope.management.devices.searchUserFieldType = "username";
		$scope.management.devices.searchUserInputField = "";


		let createModifyDeviceEntryPanel = function( val ){
			$scope.management.devices.entryListViewPanel = val == "modify" || val == "create" ? false : true;
			$scope.management.devices.addModifyViewEntryPanel = val == "modify" || val == "create" ? true : false;
			$scope.management.devices.deleteDeviceEntryButtonVisibility = val == "modify" ? true : false;
			$scope.management.devices.saveDeviceEntryButtonVisibility = val == "modify" ? true : false;
			$scope.management.devices.addDeviceEntryButtonVisibility = val == "create" ? true : false;
			$scope.management.devices.idFieldVisibility = val == "modify" ? true : false;
			$scope.management.devices.createdAtFieldVisibility = val == "modify" ? true : false;
			$scope.management.devices.updatedAtFieldVisibility = val == "modify" ? true : false;
			$scope.management.devices.nameFieldDisabled = val == "modify" ? true : false;
			$scope.management.devices.credentialsAction = val == "modify" ? "Update" : "Create"; 
			$scope.management.devices.deviceEntryAction = val == "modify" ? "Update" : "Create";
		}

		let deviceEntryFeilds = function( actionType, obj ){

			$scope.management.devices.device.id = actionType == "modify" ? obj.id : "";
			$scope.management.devices.device.name = actionType == "modify" ? obj.name : "";
			$scope.management.devices.device.username = actionType == "modify" ? obj.username : "";
			$scope.management.devices.device.ipAddress = actionType == "modify" ? obj.ip : "";
			$scope.management.devices.device.password = actionType == "modify" ? obj.password : "";
			$scope.management.devices.device.confirmPassword = actionType == "modify" ? obj.confirmPassword : "";
			$scope.management.devices.device.protocol = actionType == "modify" ? obj.protocol : "";
			$scope.management.devices.device.port = actionType == "modify" ? obj.port : "";
			$scope.management.devices.device.details = actionType == "modify" ? obj.details : "";
			$scope.management.devices.device.onDemand = actionType == "modify" ? (obj.onDemand == 1 ? true : false): "";
			$scope.management.devices.device.createdAt = actionType == "modify" ? ( obj.created_at != undefined ? new Date(obj.created_at).toUTCString(): "") : "";
			$scope.management.devices.device.updatedAt = actionType == "modify" ? ( obj.updated_at != undefined ? new Date(obj.updated_at).toUTCString(): "") : "";

			$scope.management.devices.errorAddUserValidationMessageVisibility = false;
		}

		$scope.management.devices.clickTab = function(){
			$scope.management.devices.page = 1;
			createModifyDeviceEntryPanel("back");
			devicesCount($scope.management.devices.searchDeviceFieldType, $scope.management.devices.searchDeviceInputField);
			$scope.management.devices.searchDeviceInputField = "";
			managementTabs("devices");
		}

		$scope.management.devices.rangeRows = [
			{ id : 0, value : 5 }, 
			{ id : 1, value : 10 },
            { id : 2, value : 20 },
            { id : 3, value : 50 },
            { id : 4, value : 100 },
            { id : 5, value : 200 },
        ];

		let devicesCount = function( field, search ){
            $scope.management.devices.loadingListEntryVisibility = true;
            management_model.devicesReadCount(
                currentUser.token,
				field,
				search,
                function(response){
                    if(response.status == 200 && response.data[0] != undefined){
                        $scope.management.devices.totalrows = response.data[0].total;
                        $scope.management.devices.pagination.state = management_model.pagination_state($scope.management.devices.page, $scope.management.devices.totalrows ,$scope.management.devices.selected.value);
						devicesList( $scope.management.devices.searchDeviceFieldType, $scope.management.devices.searchDeviceInputField, $scope.management.devices.page, $scope.management.devices.selected.value);
                    }
                }
            );
        }

		
		let devicesListTransformed = function( obj ){
			$scope.management.devices.device = obj;
			$scope.management.devices.device.enabledCheck =  obj.onDemand == 1 ? true: false;
			$scope.management.devices.devicesListTransformed.push($scope.management.devices.device);			
		}

		let devicesList = function( field, search, page, range ){
            management_model.devicesRead(
                currentUser.token,
				field,
				search,
				page,
				range,
                function(response){
					$scope.management.devices.list = [];
                    if(response.status == 200){ 

						$scope.management.devices.devicesListTransformed = [];
						let dataList = response.data;

						dataList.forEach(devicesListTransformed);

                        $scope.management.devices.list = response.data;                        
                        $scope.management.devices.showfrom = $scope.management.devices.list.length == 0 ? 0 : ((page - 1) * range) + 1;
                        $scope.management.devices.showto = ((page - 1) * range) + $scope.management.devices.list.length;
                        //$scope.management.devices.search = $scope.management.devices.search_temp;
                        $scope.management.devices.loadingListEntryVisibility = false;
                    }
                }
            );
        }

		$scope.management.devices.pagination.first_click =  function(){
			if($scope.management.devices.pagination.state.currentPage > 1){
				$scope.management.devices.page = 1;
				devicesCount( $scope.management.devices.searchDeviceFieldType, $scope.management.devices.searchDeviceInputField);
			}	
		}
		
		$scope.management.devices.pagination.previous_click =  function(){
			if($scope.management.devices.pagination.state.currentPage > 1){
				$scope.management.devices.page = $scope.management.devices.pagination.state.currentPage - 1;
				devicesCount( $scope.management.devices.searchDeviceFieldType, $scope.management.devices.searchDeviceInputField);
			}
		}
		
		$scope.management.devices.pagination.previouspages_click =  function(){
			if($scope.management.devices.pagination.state.currentPage > 1){
				$scope.management.devices.page = $scope.management.devices.pagination.state.currentPageFrom - 1;
				devicesCount( $scope.management.devices.searchDeviceFieldType, $scope.management.devices.searchDeviceInputField);
			}
		}
		
		$scope.management.devices.pagination.pages_click = function(value){
			$scope.management.devices.page = value.page;
			devicesCount( $scope.management.devices.searchDeviceFieldType, $scope.management.devices.searchDeviceInputField);
		}
		
		$scope.management.devices.pagination.nextpages_click =  function(){
				
			if($scope.management.devices.pagination.state.currentPage < $scope.management.devices.pagination.state.totalPages){
				
				$scope.management.devices.page = $scope.management.devices.pagination.state.currentPageTo + 1;
				devicesCount( $scope.management.devices.searchDeviceFieldType, $scope.management.devices.searchDeviceInputField);
			}
		}
		
		$scope.management.devices.pagination.next_click = function(){	
			if($scope.management.devices.pagination.state.currentPage < $scope.management.devices.pagination.state.totalPages){
				$scope.management.devices.page = $scope.management.devices.pagination.state.currentPage + 1,
				devicesCount( $scope.management.devices.searchDeviceFieldType, $scope.management.devices.searchDeviceInputField);
			}
		}
		
		$scope.management.devices.pagination.last_click = function(){
			if( $scope.management.devices.pagination.state.currentPage < $scope.management.devices.pagination.state.totalPages){
				$scope.management.devices.page = $scope.management.devices.pagination.state.totalPages;
				devicesCount( $scope.management.devices.searchDeviceFieldType, $scope.management.devices.searchDeviceInputField);
			}
		}


		$scope.management.devices.createDeviceEntryButton = function(){
			createModifyDeviceEntryPanel("create");
			deviceEntryFeilds("create", $scope.management.devices.device);
		}

		$scope.management.devices.searchDeviceEntryButton = function(){
			$scope.management.devices.page = 1;
			devicesCount( $scope.management.devices.searchDeviceFieldType, $scope.management.devices.searchDeviceInputField);
		}


		$scope.management.devices.deleteDeviceEntryButton = function(){
			$("#addDeviceModal").modal('show'); 
		}

		$scope.management.devices.cancelDeviceEntryButton = function(){
			createModifyDeviceEntryPanel("back");
			$scope.management.devices.clickTab();
		}
		
		$scope.management.devices.modifyEntryClickButton = function( obj ){
			createModifyDeviceEntryPanel("modify");
			deviceEntryFeilds("modify", obj);
		}

		$scope.management.devices.updateCredentialsButton = function(){
			$("#updateUserCredentialsModal").modal('show'); 
			$scope.management.devices.device.password = "";
			$scope.management.devices.device.confirmPassword = "";
			$scope.management.devices.errorPasswordValidationMessageVisibility = false;
		}

		$scope.management.devices.selectedRangeRowChange = function(){
			$scope.management.devices.selected = $scope.management.devices.selectedRangeRow;
		}

		let devicesCreate = function(name, ipAddress, onDemand, protocol, port, username, password, details){
			$scope.management.devices.loadingActionEntryVisibility = true;
			management_model.devicesCreate(
				currentUser.token,
				name, 
				ipAddress,
				onDemand, 
				protocol,
				port, 
				username,
				password,
				details,
				function(response){
					if(response.status == 200){
						$scope.management.devices.loadingActionEntryVisibility = false;
						$scope.management.devices.clickTab();
					}
				}
			);
		}

		let devicesUpdate = function(name, ipAddress, onDemand, protocol, port, details){
			$scope.management.devices.loadingActionEntryVisibility = true;
			management_model.devicesUpdate(
                currentUser.token,
				name,
				ipAddress,
				onDemand,
				protocol,
				port,
				details,
				function(response){
					if(response.status == 200){
						$scope.management.devices.loadingActionEntryVisibility = false;
						$scope.management.devices.clickTab();
					}
				}
			);
		}

		let devicesUpdatePassword = function(name, username, password){
			$scope.management.devices.loadingCredentialsUpdateActionEntryVisibility = true;
			management_model.devicesUpdatePassword(
                currentUser.token,
				name,
				username, 
				password,
				function(response){
					if(response.status == 200){
						$scope.management.devices.loadingCredentialsUpdateActionEntryVisibility = false;
						$("#updateUserCredentialsModal").modal('hide'); 
					}
				}
			);
		}

		let devicesDelete = function(name){
			$scope.management.devices.loadingActionEntryVisibility = true;
			management_model.devicesDelete(
                currentUser.token,
				name,
				function(response){
					if(response.status == 200){
						$scope.management.devices.loadingActionEntryVisibility = false;
						$scope.management.devices.clickTab();
					}
				}
			);
		}

		let devicesReload = function(){
			$("#addReloadModal").modal('show'); 
			$scope.management.devices.loadingReloadVisibility = true;
			management_model.devicesReload(
                currentUser.token,
				function(response){
					if(response.status == 200){
						
						setTimeout(function() {
							$scope.management.devices.loadingReloadVisibility = false;
							$("#addReloadModal").modal('hide'); 
							$scope.management.devices.clickTab();
							$scope.$digest();
						}, 5000);

						
					}
				}
			);
		}

		$scope.management.devices.confirmDeleteDeviceEntryButton = function(){
			devicesDelete($scope.management.devices.device.name);
			$("#addDeviceModal").modal('hide'); 
		}

		$scope.management.devices.updateDeviceEntryButton = function(){
			console.log("updateDeviceEntryButton")
			devicesUpdate(
				$scope.management.devices.device.name, 
				$scope.management.devices.device.ipAddress, 
				$scope.management.devices.device.onDemand == true ? 1 : 0, 
				$scope.management.devices.device.protocol, 
				$scope.management.devices.device.port, 
				$scope.management.devices.device.details 
			);
		}

		$scope.management.devices.credentialsConfirmEntryButton = function(){
			if($scope.management.devices.credentialsAction == "Update"){
				if($scope.management.devices.device.confirmPassword == $scope.management.devices.device.password && $scope.management.devices.device.confirmPassword != ""){
					devicesUpdatePassword(
						$scope.management.devices.device.name, 
						$scope.management.devices.device.username, 
						$scope.management.devices.device.confirmPassword
					);
				}else{
					$scope.management.devices.errorCredentialsValidationMessageVisibility = true;
					$scope.management.devices.errorCredentialsValidationMessage = "Confirmed Password not Equal!";
				}
			}

			if($scope.management.devices.credentialsAction == "Create"){
				if($scope.management.devices.device.confirmPassword == $scope.management.devices.device.password && $scope.management.devices.device.confirmPassword != ""){
					$("#updateUserCredentialsModal").modal('hide'); 
				}else{
					$scope.management.devices.errorCredentialsValidationMessageVisibility = true;
					$scope.management.devices.errorCredentialsValidationMessage = "Confirmed Password not Equal!";
				}
			}

		}

		$scope.management.devices.addDeviceEntryButton = function(){
			devicesCreate(
				$scope.management.devices.device.name, 
				$scope.management.devices.device.ipAddress, 
				$scope.management.devices.device.onDemand == true ? 1 : 0, 
				$scope.management.devices.device.protocol, 
				$scope.management.devices.device.port, 
				$scope.management.devices.device.username, 
				$scope.management.devices.device.confirmPassword, 
				$scope.management.devices.device.details
			);
		}

		$scope.management.devices.reloadDeviceEntryButton = function(){
			console.log("reloadDeviceEntryButton");
			devicesReload();
		}

		$scope.management.devices.selectedRangeRow = $scope.management.devices.rangeRows[0];

		$scope.management.devices.entryListViewPanel = true;

		$scope.management.devices.loadingActionEntryVisibility = false;
		$scope.management.devices.loadingListEntryVisibility = false;

		$scope.management.devices.searchDeviceFieldType = "name";
		$scope.management.devices.searchDeviceInputField = "";

		$scope.management.devices.selected = $scope.management.devices.rangeRows[0];

		$scope.management.devices.clickTab();

	}
]);