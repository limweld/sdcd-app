'use strict';

angular.module('Main')
.controller('home_controller',[
	'$scope',
	'$location',
	'$timeout',
	'$rootScope',
	'$cookieStore',
	'$filter',
	'home_model',
	function ($scope,$location,$timeout,$rootScope,$cookieStore,$filter,home_model) {


		let currentUser = $rootScope.globals.currentUser;

		$scope.user = {};
		$scope.user.fullname = currentUser.fullname;
		
		$scope.main_navigation_open = function(){
			$('.sidenav-place').css("display","block");
	    }	
		
	    $(".sidenav-place").css("width", "100px");	

		$scope.home = {};
		$scope.home.devices = {};
		$scope.home.devices.selected = {};
		$scope.home.devices.cameras = {};
		$scope.home.clength = 600;
		$scope.home.cwidth = 1000;

		$scope.home.aiPanel = {};
		$scope.home.aiPanel.videoModeTabVisibility = true;
		$scope.home.aiPanel.videoModePanelVisibility = true;

		$scope.home.aiPanel.videoAIModeONOFF = "OFF";

		$scope.navigation = {};
		$scope.navigation.featuresIcons = [];

		let findFeature = function(code) {
			return $scope.navigation.featuresIcons.findIndex(object => {
				return object.code === code;
			});
		}

		let featuresEnabledList = function(){
			$scope.home.aiPanel.loadingListEntryVisibility = true;
            home_model.featuresReadEnabled(
                currentUser.token,
                function(response){
                    if(response.status == 200){  
						$scope.home.aiPanel.loadingListEntryVisibility = false;
						$scope.navigation.featuresIcons = response.data;
					}
                }
            );
        }

		let archivesCreate = function(sourceFrom, image){
			home_model.archivesCreate(
				currentUser.token,
				sourceFrom, 
				image,
				function(response){
					if(response.status == 200){
						console.log("Image Inserted!")
					}
				}
			);
		}

		let defaultAIPanelSetting = function( val ){
			$scope.home.aiPanel.videoAIModeONOFFColor = (val  == "ON" ? "w3-teal" : "w3-red");
			$scope.home.aiPanel.socialDistancingModeTabVisibility = val == "ON" && findFeature("SD") != -1 ? true: false;
			$scope.home.aiPanel.faceMaskDetectionModeTabVisibility = val == "ON" && findFeature("FM") != -1 ? true: false;
			$scope.home.aiPanel.videoModePanelVisibility = val == "OFF" ? true: false;
		}

		let defaultAIPanelFunctionType = function( val ){
			$scope.home.aiPanel.socialDistancingModeONSelected = val == "SD" ? "w3-gray" : "";
			$scope.home.aiPanel.faceMaskDetectionModeONSelected = val == "FM" ? "w3-gray" : "" ;
			$scope.home.aiPanel.socialDistancingModePanelVisibility = val == "SD" && $scope.home.aiPanel.videoAIModeONOFF == "ON" ? true : false; 
			$scope.home.aiPanel.faceMaskDetectionModePanelVisibility = val == "FM" && $scope.home.aiPanel.videoAIModeONOFF == "ON" ? true : false;
			
		}

		$scope.home.aiPanel.videoModeClickPanel = function(){
			$scope.home.aiPanel.videoAIModeONOFF = $scope.home.aiPanel.videoAIModeONOFF == "OFF" ? "ON" : "OFF";
			defaultAIPanelSetting( $scope.home.aiPanel.videoAIModeONOFF );
			if($scope.navigation.featuresIcons.length != 0){
				defaultAIPanelFunctionType($scope.navigation.featuresIcons[0].code);
			//	videoElem.play();
			}
		}

		$scope.home.aiPanel.socialDistancingModeClickPanel = function(){
			defaultAIPanelFunctionType("SD");
		}

		$scope.home.aiPanel.faceMaskDetectionModeClickPanel  = function(){
			defaultAIPanelFunctionType("FM");
			insertSnapshot();
		}

		let idIndex = 0;

		let devicesListTransformed = function( obj ){
			$scope.home.devices.device = {};
			$scope.home.devices.device.id = idIndex++;
			$scope.home.devices.device.value = obj.name;
			$scope.home.devices.devicesListTransformed.push($scope.home.devices.device);	
		}

		let devicesList = function( field, search, page, range ){
            home_model.devicesRead(
                currentUser.token,
				field,
				search,
				page,
				range,
                function(response){
                    if(response.status == 200){  
						
						$scope.home.devices.devicesListTransformed = [];
						let dataList = response.data;
						dataList.forEach(devicesListTransformed);
						$scope.home.devices.cameras = $scope.home.devices.devicesListTransformed;

						selectdefaultCam("default");
						getCodecInfo();
						insertSnapshot();
					}
                }
            );
        }

		let findDeviceIndex = function(id) {
			return $scope.home.devices.cameras.findIndex(object => {
				return object.id === id;
			});
		}

		$scope.home.devices.selectedChange = function(){
			selectdefaultCam("onChange");
		}

		let selectdefaultCam = function( action ){


			 console.log( action)
			 console.log($rootScope.globals.indexCamValue);
			

			if( action === "default" && ($rootScope.globals.indexCamValue === undefined || $rootScope.globals.indexCamValue === -1)){
			 	$scope.home.devices.selected = $scope.home.devices.cameras[0];
			 	$rootScope.globals.indexCamValue = findDeviceIndex($scope.home.devices.selected.id);
			 	$cookieStore.put('globals', $rootScope.globals);
			}

			if( action === "default" && ($rootScope.globals.indexCamValue !== undefined || $rootScope.globals.indexCamValue !== -1)){
				$scope.home.devices.selected = $scope.home.devices.cameras[$rootScope.globals.indexCamValue];
				$rootScope.globals.indexCamValue = findDeviceIndex($scope.home.devices.selected.id);
				$cookieStore.put('globals', $rootScope.globals);
		   }

			if( action === "onChange" ){
			 	console.log("ID ======================")
			 	console.log($scope.home.devices.selected);
				console.log($scope.home.devices.selected.value);
				$rootScope.globals.indexCamValue = findDeviceIndex($scope.home.devices.selected.id);
				$cookieStore.put('globals', $rootScope.globals);

				location.reload();
			}
		}

		devicesList("name","",1,100);

		defaultAIPanelSetting( $scope.home.aiPanel.videoAIModeONOFF );

		featuresEnabledList();


		/* CAMERA SCRIPT START */

		let config = {};

		let stream = new MediaStream();


		const pc = new RTCPeerConnection(config);
		pc.onnegotiationneeded = handleNegotiationNeededEvent;

		let log = msg => {
			document.getElementById('div').innerHTML += msg + '<br>'
		}

		pc.ontrack = function(event) {
			stream.addTrack(event.track);
			videoElem.srcObject = stream;
			log(event.streams.length + ' track is delivered')
		}

		pc.oniceconnectionstatechange = e => log(pc.iceConnectionState)

		async function handleNegotiationNeededEvent() {
			let offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			getRemoteSdp();
		}


		function getCodecInfo() {
		$.get("../rstp/stream/codec/" + $scope.home.devices.selected.value, function(data) {
			try {
			data = JSON.parse(data);
			} catch (e) {
			console.log(e);
			} finally {
			$.each(data,function(index,value){
				pc.addTransceiver(value.Type, {
				'direction': 'sendrecv'
				})
			})
			//send ping becouse PION not handle RTCSessionDescription.close()
			sendChannel = pc.createDataChannel('foo');
			sendChannel.onclose = () => console.log('sendChannel has closed');
			sendChannel.onopen = () => {
				console.log('sendChannel has opened'); 
				sendChannel.send('ping');
				setInterval(() => {
				sendChannel.send('ping');
				}, 1000)
			}
			sendChannel.onmessage = e => log(`Message from DataChannel '${sendChannel.label}' payload '${e.data}'`);
			}
		});
		}

		let sendChannel = null;

		function getRemoteSdp() {
		$.post("../rstp/stream/receiver/"+  $scope.home.devices.selected.value, {
			suuid: $scope.home.devices.selected.value,
			data: btoa(pc.localDescription.sdp)
		}, function(data) {
			try {
			pc.setRemoteDescription(new RTCSessionDescription({
				type: 'answer',
				sdp: atob(data)
			}))
			} catch (e) {
			console.warn(e);
			}
		});
		}

		/* CAMERA SCRIPT END */

		var video = document.getElementById('videoElem');

		var canvassd = document.getElementById('canvassd');
		var canvasfm = document.getElementById('canvasfm');
		var ctx1 = canvassd.getContext('2d');
		var ctx2 = canvasfm.getContext('2d');

		// set canvas size = video size when known
		video.addEventListener('loadedmetadata', function() {
			canvassd.width = $scope.home.cwidth;
			canvassd.height = $scope.home.clength;
			canvasfm.width = $scope.home.cwidth;
			canvasfm.height = $scope.home.clength;
		});

		video.addEventListener('play', function() {
		var $this = this; //cache
		(
			function loop() {
				if (!$this.paused && !$this.ended) {
					ctx1.drawImage($this, 0, 0, $scope.home.cwidth, $scope.home.clength);
					ctx2.drawImage($this, 0, 0, $scope.home.cwidth, $scope.home.clength);
					setTimeout(loop, 1000 / 30); // drawing at 30fps
				}
			}
		)();
		}, 0);

		let clientId = "clinetId";

		// Create a client instance
		let client = new Paho.MQTT.Client("192.168.1.150", 9001, clientId);

		// set callback handlers
		client.onConnectionLost = onConnectionLost;
		client.onMessageArrived = onMessageArrived;

		// connect the client
		client.connect({
			timeout: 10,
			keepAliveInterval: 20,
			cleanSession: true,
			invocationContext: {'clientId': clientId},
			userName : "mulemq",
			password : "!Y2df@35836",
			onSuccess: onConnect,
			onFailure: function(err) {
				console.log(err);
			}
		});


		// called when the client connects
		function onConnect() {
		// Once a connection has been made, make a subscription and send a message.
			console.log("onConnect");
			client.subscribe("soundalarm");

		
		}


		// let triggerSound = function(){
		// 	let data = {"channel": $scope.home.devices.selected.id };
		// 	let dataJSON = JSON.stringify(data);


		// 	let message = new Paho.MQTT.Message(dataJSON);
		// 	message.destinationName = "soundalarm";
		// 	client.send(message);
		// }


		// // called when the client loses its connection
		function onConnectionLost(responseObject) {
			if (responseObject.errorCode !== 0) {
				console.log("onConnectionLost:"+responseObject.errorMessage);
			}
		}

		// called when a message arrives
		function onMessageArrived(message) {
			console.log("onMessageArrived:"+message.payloadString);
		}


		let insertSnapshot = function(){
			let canvas1 = document.getElementById('canvassd');
			let dataURL = canvas1.toDataURL();
			// console.log(dataURL);
	
			archivesCreate($scope.home.devices.selected.value,dataURL);
		}

	
	}

]);