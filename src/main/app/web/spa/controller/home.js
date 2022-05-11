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

		let idIndex = 0;

		let devicesListTransformed = function( obj ){
			$scope.home.devices.device = {};
			$scope.home.devices.device.id = idIndex++;
			$scope.home.devices.device.value = obj.name;
			$scope.home.devices.devicesListTransformed.push($scope.home.devices.device);	
		}

		
   
		let devicesList = function( field, search, page, range ){
			let idIndex = 0;
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

			getCodecInfo();


		}


		devicesList("name","",1,100);







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

		// Experiment using TensorFlow & COCO-SSD
		// const app = document.getElementById('app');
		// const loader = document.getElementById('loader');
		const canvas = document.getElementById('canvas');
		const video = document.getElementById('videoElem');
		const ctx =  canvas.getContext('2d');

		let modelPromise;
		let model;
		let predictions;
		let maxDistance = 75;



		window.onload = async () => {
			modelPromise = cocoSsd.load({ base: 'mobilenet_v2' });
			model = await modelPromise;

			video.addEventListener('play', () => requestAnimationFrame(updateCanvas), false);


			ctx.font = '14px Arial';
			ctx.fillStyle = 'lightgrey';
			const title = 'Real-time social distancing detection';
			const textSize = ctx.measureText(title).width;
			ctx.fillText(
				title,
				canvas.width / 2 - textSize / 2,
				canvas.height / 2
			);
			
			//loader.style.display = 'none';
			//app.style.display = 'block';
		};

		const drawBbox = () => {
			predictions.map(prediction => {
				if (prediction.class === 'person') {
					setDistance(prediction);
					const { distanceBreach, bbox: [x, y, width, height] } = prediction;

					if (distanceBreach) {
						const { distanceBreachLinks } = prediction;
						for (let i = 0; i < distanceBreachLinks.length; i++) {
							const [x, y, x2, y2] = distanceBreachLinks[i];
							ctx.strokeStyle = 'rgb(250, 0, 0)';
							ctx.fillStyle = 'rgb(250, 0, 0)';
							ctx.lineWidth = 1;
							ctx.fillRect(x - 2, y - 2, 4, 4);
							ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
							ctx.beginPath();
							ctx.moveTo(x, y);
							ctx.lineTo(x2, y2);
							ctx.stroke();
						}

						console.log("Distance Breach");
						triggerSound();
					}else{
						console.log("Distance NOT Breach");
					}
					ctx.lineWidth = 1;
					ctx.strokeStyle = 'rgb(0, 250, 0)';
					ctx.fillStyle = 'rgb(0, 250, 0)';
					ctx.strokeRect(x, y, width, height);
					ctx.font = '9px Arial';
					ctx.fillText('Person', x, y - 2);
				}
			});
		};

		const setDistance = person => {
			const [x, y, w, h] = person.bbox;
			let tmpBreachDistances = [];

			for (let i = 0; i < predictions.length - 1; i++) {
				const { bbox } = predictions[i];
				const [x2, y2, w2, h2] = bbox;
				const a = x + w / 2 - (x2 + w2 / 2);
				const b = y + h / 2 - (y2 + h2 / 2);
				const distance = Math.sqrt(a * a + b * b);

				if (distance !== 0 && distance < maxDistance) {
				person.distanceBreach = true;
				tmpBreachDistances.push([
				x + w / 2,
				y + h / 2,
				x2 + w2 / 2,
				y2 + h2 / 2]);

				}
			}

			person.distanceBreachLinks = tmpBreachDistances;
		};

		const updateCanvas = async () => {
			const { ended, paused, width, height } = video;
			//if (ended || paused) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(video, 0, 0, width, height);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			predictions = await model.detect(imageData);
			drawBbox();

			requestAnimationFrame(updateCanvas);
		};


				// Create a client instance
		let client = new Paho.MQTT.Client("192.168.1.150", 9001, "clientId");

		// client.startTrace();

		// // set callback handlers
		// client.onConnectionLost = onConnectionLost;
		// client.onMessageArrived = onMessageArrived;
		
		// // connect the client
		// // client.connect({onSuccess:onConnect,
		// // 				useSSL: true});

		// client.connect({
		// 	onSuccess: onConnect, 
		// 	userName : "mulemq",
		// 	password : "!Y2df@35836"
		// });

		// console.log("attempting to connect...")
		
		
		// // called when the client connects
		// function onConnect() {
		//   // Once a connection has been made, make a subscription and send a message.
		//   console.log("onConnect");
		//   client.subscribe("/World");
		//   let message = new Paho.MQTT.Message("Hello");
		//   message.destinationName = "/World";
		//   //client.send(message);
		// //console.log(client.getTraceLog());
		
		//   //client.getTraceLog().forEach(function(line){
		//   //  console.log('Trace: ' + line)
		//   //});
		//   //newMessage = new Paho.MQTT.Message("Sent using synonyms!");
		//   //newMessage.topic = "/World";
		//   client.publish(message)
		//   client.publish("/World", "Hello from a better publish call!", 1, false)
		
		//   topicMessage = new Paho.MQTT.Message("This is a message where the topic is set by setTopic");
		//   topicMessage.topic = "/World";
		//   client.publish(topicMessage)
		
		
		// }
		
		// // called when the client loses its connection
		// function onConnectionLost(responseObject) {
		//   if (responseObject.errorCode !== 0) {
		// 	console.log("onConnectionLost:"+responseObject.errorMessage);
		//   }
		// }
		
		// // called when a message arrives
		// function onMessageArrived(message) {
		//   console.log("onMessageArrived:"+message.payloadString);
		// }

		// set callback handlers
		client.onConnectionLost = onConnectionLost;
		client.onMessageArrived = onMessageArrived;

		// connect the client
		// client.connect({onSuccess:onConnect});

			client.connect({
			onSuccess: onConnect, 
			userName : "mulemq",
			password : "!Y2df@35836"
		});


		// called when the client connects
		function onConnect() {
		// Once a connection has been made, make a subscription and send a message.
			console.log("onConnect");
			client.subscribe("soundalarm");

		
		}


		let triggerSound = function(){
			let data = {"channel": $scope.home.devices.selected.id };
			let dataJSON = JSON.stringify(data);


			let message = new Paho.MQTT.Message(dataJSON);
			message.destinationName = "soundalarm";
			client.send(message);
		}


		// called when the client loses its connection
		function onConnectionLost(responseObject) {
			if (responseObject.errorCode !== 0) {
				console.log("onConnectionLost:"+responseObject.errorMessage);
			}
		}

		// called when a message arrives
		function onMessageArrived(message) {
		console.log("onMessageArrived:"+message.payloadString);
		}

	











	}

]);