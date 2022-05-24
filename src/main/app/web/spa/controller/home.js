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

		// // set canvas size = video size when known
		// video.addEventListener('loadedmetadata', function() {
		// 	canvassd.width = $scope.home.cwidth;
		// 	canvassd.height = $scope.home.clength;
		// 	canvasfm.width = $scope.home.cwidth;
		// 	canvasfm.height = $scope.home.clength;
		// });

		// video.addEventListener('play', function() {
		// var $this = this; //cache
		// (
		// 	function loop() {
		// 		if (!$this.paused && !$this.ended) {
		// 			ctx1.drawImage($this, 0, 0, $scope.home.cwidth, $scope.home.clength);
		// 			ctx2.drawImage($this, 0, 0, $scope.home.cwidth, $scope.home.clength);
		// 			setTimeout(loop, 1000 / 30); // drawing at 30fps
		// 		}
		// 	}
		// )();
		// }, 0);

		let clientId = (Math.random() + 1).toString(36).substring(7);

		// Create a client instance
		let client = new Paho.MQTT.Client("192.168.4.150", 9001, clientId);

		// set callback handlers
		client.onConnectionLost = onConnectionLost;
		client.onMessageArrived = onMessageArrived;

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


		function onConnect() {
			console.log("onConnect");
			client.subscribe("soundalarm");
			client.subscribe("mask_interval");
		}

	

		let triggerSound = function(){
			let data = {"channel": 0 };
			let dataJSON = JSON.stringify(data);
			let message = new Paho.MQTT.Message(dataJSON);
			message.destinationName = "soundalarm";
			client.send(message);
		}


		function onConnectionLost(responseObject) {
			if (responseObject.errorCode !== 0) {
				console.log("onConnectionLost:"+responseObject.errorMessage);
			}
		}

		function onMessageArrived(message) {
	
			if(message.destinationName == "mask_interval"){

				let data = JSON.parse(message.payloadString);
				if(data.posting == 0){
					console.log(data.posting);
					insertSnapshot();
				}
			}
	
		}


		let insertSnapshot = function(){
			let canvas1 = document.getElementById('canvasfm');
			let dataURL = canvas1.toDataURL();	
			archivesCreate($scope.home.devices.selected.value,dataURL);
		}





		//triggerSound();


		/** Facemask Detector */
	
		let model;

		let id2class = {0:"FaceMask", 1:"No_FaceMask"};

		let detectImage = function() {
			
			detect(video).then((results) => {
				canvasfm.width = video.width;
				canvasfm.height = video.height;
				ctx2.clearRect(0, 0, canvasfm.width, canvasfm.height);
				ctx2.drawImage(video, 0, 0, video.width, video.height);
				
				results.forEach(bboxInfoFunc);

			})
		}


		function bboxInfoFunc(bboxInfo, index) {
				let bbox = bboxInfo[0];
				let classID = bboxInfo[1];
				let score = bboxInfo[2];
				ctx2.beginPath();
				ctx2.lineWidth="4";
				if (classID == 0) {
					ctx2.strokeStyle="green";
					ctx2.fillStyle="green";
				} else {
					ctx2.strokeStyle="red";
					ctx2.fillStyle="red";
					triggerSound();
			
				}
				
				ctx2.rect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
				ctx2.stroke();
				
				ctx2.font="15px Arial";
				

				let content = id2class[classID] + " " + score.toFixed(2);
				
				ctx2.fillText(content, bbox[0], bbox[1] < 20 ? bbox[1] + 30 : bbox[1]-5);
				
		}

		async function detect(imgToPredict) {
			const detectionResults = tf.tidy(() => {
				// eslint-disable-next-line
				const width = imgToPredict.width;
				// eslint-disable-next-line
				const height = imgToPredict.height;
				let img = tf.browser.fromPixels(imgToPredict);
				img = tf.image.resizeBilinear(img, [260, 260]);
				img = img.expandDims(0).toFloat().div(tf.scalar(255));
				const [rawBBoxes, rawConfidences] = model.predict(img);
				const bboxes = decodeBBox(anchors, tf.squeeze(rawBBoxes));
				const Results = nonMaxSuppression(bboxes, tf.squeeze(rawConfidences), 0.5, 0.5,  width, height );
				return Results;
			})
			return detectionResults;
		}

		// decode the output according to anchors
		function decodeBBox(anchors, rawOutput, variances=[0.1,0.1,0.2,0.2]) {
			const [anchorXmin, anchorYmin, anchorXmax, anchorYmax] = tf.split(anchors, [1,1,1,1], -1);
			const anchorCX = tf.div(tf.add(anchorXmin, anchorXmax), 2);
			const anchorCY = tf.div(tf.add(anchorYmin, anchorYmax), 2);

			const anchorW = tf.sub(anchorXmax, anchorXmin);
			const anchorH = tf.sub(anchorYmax, anchorYmin);

			const rawOutputScale = tf.mul(rawOutput, tf.tensor(variances));
			const [rawOutputCX, rawOutputCY, rawOutputW, rawOutputH] = tf.split(rawOutputScale, [1,1,1,1], -1);
			const predictCX = tf.add(tf.mul(rawOutputCX, anchorW), anchorCX);
			const predictCY = tf.add(tf.mul(rawOutputCY,anchorH), anchorCY);
			const predictW = tf.mul(tf.exp(rawOutputW), anchorW);
			const predictH = tf.mul(tf.exp(rawOutputH), anchorH);
			const predictXmin = tf.sub(predictCX, tf.div(predictW, 2));
			const predictYmin = tf.sub(predictCY, tf.div(predictH, 2));
			const predictXmax = tf.add(predictCX, tf.div(predictW, 2));
			const predictYmax = tf.add(predictCY, tf.div(predictH, 2));
			// eslint-disable-next-line
			const predictBBox = tf.concat([predictYmin, predictXmin, predictYmax, predictXmax],-1);
			return predictBBox
		}

		// generate anchors
		function anchorGenerator(featureMapSizes, anchorSizes, anchorRatios) {
			let anchorBBoxes = [];
			// eslint-disable-next-line
			featureMapSizes.map((featureSize, idx) =>{
				const cx = tf.div(tf.add(tf.linspace(0, featureSize[0] - 1, featureSize[0]) , 0.5) , featureSize[0]);
				const cy = tf.div(tf.add(tf.linspace(0, featureSize[1] - 1, featureSize[1]) , 0.5) , featureSize[1]);
				const cxGrid = tf.matMul(tf.ones([featureSize[1], 1]), cx.reshape([1,featureSize[0]]));
				const cyGrid = tf.matMul(cy.reshape([featureSize[1], 1]), tf.ones([1, featureSize[0]]));
				// eslint-disable-next-line
				const cxGridExpend = tf.expandDims(cxGrid, -1);
				// eslint-disable-next-line
				const cyGridExpend = tf.expandDims(cyGrid, -1);
				// eslint-disable-next-line
				const center = tf.concat([cxGridExpend, cyGridExpend], -1);
				const numAnchors = anchorSizes[idx].length + anchorRatios[idx].length -1;
				const centerTiled = tf.tile(center, [1, 1, 2*numAnchors]);
				// eslint-disable-next-line
				let anchorWidthHeights = [];
				
				// eslint-disable-next-line
				for (const scale of anchorSizes[idx]) {
					const ratio = anchorRatios[idx][0];
					const width = scale * Math.sqrt(ratio);
					const height = scale / Math.sqrt(ratio);

					const halfWidth = width /  2;
					const halfHeight = height / 2;
					anchorWidthHeights.push(-halfWidth, -halfHeight, halfWidth, halfHeight);
				}

				// eslint-disable-next-line
				for ( const ratio of anchorRatios[idx].slice(1)) {
					const scale = anchorSizes[idx][0];
					const width = scale * Math.sqrt(ratio);
					const height = scale / Math.sqrt(ratio);
					const halfWidth = width /  2;
					const halfHeight = height / 2;
					anchorWidthHeights.push(-halfWidth, -halfHeight, halfWidth, halfHeight);
				}
				const bboxCoord = tf.add(centerTiled , tf.tensor(anchorWidthHeights));
				const bboxCoordReshape = bboxCoord.reshape([-1, 4]);
				anchorBBoxes.push(bboxCoordReshape);
			})
			// eslint-disable-next-line
			anchorBBoxes = tf.concat(anchorBBoxes, 0);
			return anchorBBoxes;
		}

		let featureMapSizes = [[33, 33], [17, 17], [9, 9], [5, 5], [3,3]];


		let anchorSizes =  [[0.04, 0.056], [0.08, 0.11], [0.16, 0.22], [0.32, 0.45], [0.64, 0.72]];
		let anchorRatios = [[1, 0.62, 0.42], [1, 0.62, 0.42], [1, 0.62, 0.42], [1, 0.62, 0.42], [1, 0.62, 0.42]];
		let anchors = anchorGenerator(featureMapSizes, anchorSizes, anchorRatios);
	

		//  nms function
		let nonMaxSuppression = function(bboxes, confidences, confThresh, iouThresh, width, height, maxOutputSize=100) {
			const bboxMaxFlag = tf.argMax(confidences, -1);
			const bboxConf = tf.max(confidences, -1);
			const keepIndices = tf.image.nonMaxSuppression(bboxes, bboxConf, maxOutputSize, iouThresh, confThresh);
			// eslint-disable-next-line
			let results = []
			const keepIndicesData = keepIndices.dataSync();
			const bboxConfData = bboxConf.dataSync();
			const bboxMaxFlagData = bboxMaxFlag.dataSync();
			const bboxesData = bboxes.dataSync();
			// eslint-disable-next-line
			keepIndicesData.map((idx) => {
				const xmin = Math.round(Math.max(bboxesData[4*idx + 1] * width, 0));
				const ymin = Math.round(Math.max(bboxesData[4*idx + 0] * height, 0));
				const xmax = Math.round(Math.min(bboxesData[4*idx+3] * width, width))
				const ymax = Math.round(Math.min(bboxesData[4*idx + 2] * height, height));
				results.push([[xmin, ymin, xmax, ymax],
					bboxMaxFlagData[idx], bboxConfData[idx]])
			});
			return results;
		}

	
		video.addEventListener("loadeddata", async () => {
			setInterval(detectImage, 40);
			//detectImage();
		});

		async function loadModel() {
			 //model = await tf.loadLayersModel('https://raw.githubusercontent.com/alifwahyd/FaceMaskDetection-Webapp/master/tfjs-models/model.json');
			model = await tf.loadLayersModel('ai/models/mask_model/model.json');
			return model;
		}

		async function setup() {
			await loadModel();
		}

		setup();

	}

]);