var isLooping = true;
var scene, camera, renderer;
var params;
var mousedown = false;
var textureLoader;
var mouse;
var raycaster;
var objectsArray = [];
var audioListener;
var audioLoader;
var bongSound;
var bingSound;
var lastPlayed = 0;

function getParams() {
	return {
		sunRotSpeedy: 0.001,
		earthRotSpeedY: 0.002,
		venusRotSpeedY: 0.005,
		jupiterRotSpeedY: 0.001,

		earthOrbitSpeed: 0.002,
		moonOrbitSpeedy: 0.003,
		moonOrbitSpeedx: 0.0005,
		venusOrbitSpeed: 0.001,
		jupiterOrbitSpeed: 0.001
	};
}

window.onload = function()  {
	if (Detector.webgl) {
	    init();
		var objects = createObjects();
		alterObjects(objects);
		render(objects);
		addListeners();
	} else {
	    var warning = Detector.getWebGLErrorMessage();
	    document.getElementById('container').appendChild(warning);
	}
}

function init() {
	params = getParams();
	scene = new THREE.Scene();
	// vertical angle of view, ratio, near, far
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);

	textureLoader = new THREE.TextureLoader();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild( renderer.domElement );

	camera.position.z = 40;
	camera.position.y = 20;
	//camera.rotation.x = -0.5;
	camera.lookAt(new THREE.Vector3(0,0,0));

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	audioListener = new THREE.AudioListener();
	camera.add( audioListener );
}

function createObjects() {
	var parent = new THREE.Object3D();
	scene.add(parent);

	//SUN
	var sunTexture = textureLoader.load("assets/img/textures/sunmap.jpg");
	var geometry = new THREE.SphereGeometry( 5, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {map: sunTexture} );
	var sun = new THREE.Mesh( geometry, material );
	sun.name = "sun";

	var spriteMaterial = new THREE.SpriteMaterial( 
	{ 
		map: textureLoader.load( 'assets/img/textures/glow.png' ),
		color: 0xF9DB64, transparent: false, blending: THREE.AdditiveBlending
	});
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(15, 15, 1.0);
	sun.add(sprite);
	scene.add( sun );
	objectsArray.push(sun);

	//EARTH
	var geometry = new THREE.SphereGeometry( 2.8, 32, 32 );

	var earthTexture = textureLoader.load("assets/img/textures/earth.jpg");
	var earthBumpMap = textureLoader.load('assets/img/textures/earthbump.jpg');
	var earthSpecularMap = textureLoader.load('assets/img/textures/earthspec.jpg');
	var material = new THREE.MeshPhongMaterial( {map: earthTexture, bumpMap: earthBumpMap, specularMap: earthSpecularMap} );
	material.bumpScale = 0.05;
	material.specular  = new THREE.Color('grey');

	var earth = new THREE.Mesh( geometry, material );
	earth.name = "earth";
	earth.castShadow = true;
	earth.receiveShadow = true;
	scene.add( earth );

	var earthPivot = new THREE.Object3D();
	scene.add(earthPivot);
	earthPivot.add(earth);
	objectsArray.push(earth);
	objectsArray.push(earthPivot);

	//MOON
	var geometry = new THREE.SphereGeometry( 0.6, 20, 20 );
	var moonTexture = textureLoader.load("assets/img/textures/moonmap.jpg");
	var moonBumpMap = textureLoader.load('assets/img/textures/moonbump.jpg');
	var material = new THREE.MeshLambertMaterial( {map: moonTexture, bumpMap: moonBumpMap} );
	material.bumpScale = 0.05;
	var moon = new THREE.Mesh( geometry, material );
	moon.name = "moon";
	moon.castShadow = true;
	moon.receiveShadow = true;
	var moonPivot = new THREE.Object3D();
	moonPivot.add(moon);
	earth.add(moonPivot);
	objectsArray.push(moon);
	objectsArray.push(moonPivot);

	//VENUS
	var geometry = new THREE.SphereGeometry( 2, 32, 32 );
	var venusTexture = textureLoader.load("assets/img/textures/venusmap.jpg");
	var material = new THREE.MeshLambertMaterial( {map: venusTexture} );
	material.bumpScale = 0.05;
	var venus = new THREE.Mesh( geometry, material );
	venus.name = "venus";
	venus.castShadow = true;
	venus.receiveShadow = true;
	scene.add( venus );

	var venusPivot = new THREE.Object3D();
	scene.add(venusPivot);
	venusPivot.add(venus);
	objectsArray.push(venus);
	objectsArray.push(venusPivot);


	//JUPITER
	var geometry = new THREE.SphereGeometry( 4.2, 32, 32 );
	var jupiterTexture = textureLoader.load("assets/img/textures/texture3.png");
	var material = new THREE.MeshLambertMaterial( {map: jupiterTexture} );
	var jupiter = new THREE.Mesh( geometry, material );
	jupiter.name = "jupiter";
	jupiter.castShadow = true;
	jupiter.receiveShadow = true;
	scene.add( jupiter );

	var jupiterPivot = new THREE.Object3D();
	scene.add(jupiterPivot);
	jupiterPivot.add(jupiter);
	objectsArray.push(jupiter);
	objectsArray.push(jupiterPivot);


	//LIGHTS
	var ambientLight = new THREE.AmbientLight( 0x101010 );
	scene.add(ambientLight);
	var sunLight = new THREE.PointLight( 0xffffcc, 1, 100, 2);
	sunLight.castShadow = true;
	sunLight.position.set(0, 0, 0);
	scene.add( sunLight );


	//SKYBOX
	createSkybox();

	// Audio
	bongSound = new THREE.Audio( audioListener );
	scene.add( bongSound );
	audioLoader = new THREE.AudioLoader();
	audioLoader.load(
	'assets/sounds/bong-trump.ogg',
	function ( audioBuffer ) {
		// set the audio object buffer to the loaded object
		bongSound.setBuffer( audioBuffer );
	});

	bingSound = new THREE.Audio( audioListener );
	scene.add( bingSound );
	audioLoader = new THREE.AudioLoader();
	audioLoader.load(
	'assets/sounds/bing-trump.ogg',
	function ( audioBuffer ) {
		// set the audio object buffer to the loaded object
		bingSound.setBuffer( audioBuffer );
	});


	return {
		sun: sun,
		earth: earth,
		moon: moon,
		venus: venus,
		jupiter: jupiter,

		earthPivot: earthPivot,
		moonPivot: moonPivot,
		venusPivot: venusPivot,
		jupiterPivot: jupiterPivot
	};
}

function alterObjects(objects) {
	//starting positions
	objects.earth.position.x = 22;
	objects.venus.position.x = 14;
	objects.jupiter.position.x = 35;
	objects.moon.position.x = 5;

	objects.earthPivot.rotation.y = Math.random() * 2 * Math.PI;
	objects.venusPivot.rotation.y = Math.random() * 2 * Math.PI;
	objects.jupiterPivot.rotation.y = Math.random() * 2 * Math.PI;
}

function createSkybox() {
	var skyboxUrl = "assets/img/skybox/";
	var urls = [skyboxUrl + "Left.jpg", skyboxUrl + "Right.jpg", skyboxUrl + "Up.jpg", skyboxUrl + "Down.jpg", skyboxUrl + "Front.jpg", skyboxUrl + "Back.jpg"];
	
	
	var materialsArray = [];
	for (var k in urls) {
		var url = urls[k];
		materialsArray.push(new THREE.MeshBasicMaterial({map: textureLoader.load(url), side: THREE.BackSide}));
	}
	skyboxMesh = new THREE.Mesh(new THREE.CubeGeometry( 5000, 5000, 5000, 1, 1, 1), materialsArray);
	skyboxMesh.name = "skybox";
	scene.add(skyboxMesh);
}

function render(objects) {

	function animate() {
		requestAnimationFrame(animate);

		if (isLooping) {
			objects.sun.rotation.y += params.sunRotSpeedy;
			objects.earth.rotation.y += params.earthRotSpeedY;
			objects.venus.rotation.y += params.venusRotSpeedY;
			objects.jupiter.rotation.y += params.jupiterRotSpeedY;

			objects.earthPivot.rotation.y += params.earthOrbitSpeed;
			objects.venusPivot.rotation.y += params.venusOrbitSpeed;
			objects.jupiterPivot.rotation.y += params.jupiterOrbitSpeed;
			objects.moonPivot.rotation.y += params.moonOrbitSpeedy;
			objects.moonPivot.rotation.x += params.moonOrbitSpeedx;

			TWEEN.update();
		}
		
		
		renderer.render(scene, camera);
		
	}
	animate();
}

/**
 * Listeners
 */
function addListeners() {
	document.body.addEventListener( 'mousewheel', cameraZoom, false );
	document.body.addEventListener( 'DOMMouseScroll', cameraZoom, false ); // firefox

	document.body.addEventListener('mousedown', onMouseDown, false);
	document.body.addEventListener('mousemove', onMouseDrag, false);
	document.body.addEventListener('mouseup', onMouseUp, false);
	document.body.addEventListener('keypress', onKeyPress, false);
}

function cameraZoom(event) {
	var target;
	var position = camera.position.z;

	// zoom out
    if(event.wheelDelta > 0) {
        //if(camera.position.z < 1000) {
        	target = position - 5;
        //}
	}
	else if (event.wheelDelta < 0) {
		//if (camera.position.z > 0.1) {
			target = position + 5;
	    //}
	}
	cameraTween = new TWEEN.Tween(camera.position)
                .to({ z: target} , 300)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
}

function onMouseDrag(event) {
	if (mousedown) {
		var moveX = event.movementX / 10 * -1;
		var moveY = event.movementY / 10;
		camera.position.x += moveX;
	    camera.position.y += moveY;
	}
}

function onMouseDown(event) {
	mousedown = true;

	onDocumentMouseDown(event);
}
function onMouseUp() {
	mousedown = false;
}

// inspired from https://threejs.org/examples/canvas_interactive_cubes.html
function onDocumentMouseDown( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( objectsArray );

	if ( intersects.length > 0 && intersects[0].object.name !== "skybox") {
		var clickedObj = intersects[0].object;

		clickedObj.add(camera);
		if (lastPlayed === 0) {
			if (bingSound.isPlaying) {
				bingSound.stop();
			}
			bingSound.play();
			lastPlayed = 1;
		} else  {
			if (bongSound.isPlaying) {
				bongSound.stop();
			}
			bongSound.play();
			lastPlayed = 0;
		}

	} else {
		if (camera.parent && camera.parent.type !== "Scene") {
			THREE.SceneUtils.detach( camera, camera.parent, scene );
			camera.position.z = 40;
			camera.position.y = 20;
			camera.lookAt(new THREE.Vector3(0,0,0));
		}
	}
}


function onKeyPress(event) {
	if (event.keyCode === 32) {
		isLooping = !isLooping;
	}
}
