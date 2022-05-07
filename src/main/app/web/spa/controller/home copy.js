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
   
		
		// SCRIPTING START
		$scope.mgmt= {};

		$scope.mgmt.regCamera = [
			{ "id" : "1", "value" : "CAM 1" },
			{ "id" : "2", "value" : "CAM 2" }
		]

		$scope.mgmt.regCamera.selected = $rootScope.globals.indexCamValue;

		console.log("CAMERA Selected");
		console.log($scope.mgmt.regCamera.selected);
		
		$scope.mgmt.regCamera.selected_change = function(){		
			streamSelectCookie();
		}

		if($rootScope.globals.indexCamValue == null){
			$rootScope.globals.indexCamValue = $scope.mgmt.regCamera[0];	
			$cookieStore.put('globals', $rootScope.globals);
		}

		getCodecInfo();

		let streamSelectCookie = function(){
			
			$rootScope.globals.indexCamValue = $scope.mgmt.regCamera.selected;	
			$cookieStore.put('globals', $rootScope.globals)
			
			location.reload();
		
		}

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
		$.get("../rstp/stream/codec/" + encodeURI($scope.mgmt.regCamera.selected.value), function(data) {
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
		$.post("../rstp/stream/receiver/"+  encodeURI($scope.mgmt.regCamera.selected.value), {
			suuid: $scope.mgmt.regCamera.selected.value,
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


	}

]);