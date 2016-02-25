// Get the canvas element from our HTML above
var canvas      = document.getElementById("renderCanvas");
var divTime     = document.getElementById("clock");
var divHealth   = document.getElementById("health");
var divPoints   = document.getElementById("points");
var container;

var controlEnabled = false;

// Variable used to create asteroids within a certain time difference
var lastSecondAsteroidCreated = 00;

// Load the BABYLON 3D engine
var engine = new BABYLON.Engine(canvas, true);

var gunshot;
var points = 0;

var stats;

var clock;
var scene;
var camera, map;
var spaceship, planets, skybox;
var spaceshipSpeed;
var healthBar, health;
var ground;
var planetTextures, planetSizes;

var asteroids = [];
var maxNumberOfAsteroids;
var asteroidSpeed;
var asteroidRespawn;

var width, height;

var counter = 0;

document.addEventListener("DOMContentLoaded", function () { init(), animate(); }, false);

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// Now, call the createScene function that you just finished creating
	scene = createScene();
	// Register a render loop to repeatedly render the scene
	engine.runRenderLoop(function () { scene.render(); });

	createStats();

	// initialize clock
	clock = new THREE.Clock();

	// initializing spaceship variables
	spaceshipSpeed = 5.0;
	health         = 1.0;
	
	var difficulty     = localStorage.getItem("difficulty");
	if (difficulty === null) { difficulty = "Easy"; }
	maxNumberOfAsteroids = getMaxNumberOfAsteroids (difficulty);
	asteroidSpeed = getAsteroidSpeed (difficulty);
	asteroidRespawn = getAsteroidRespawn (difficulty);

	initMovement();
	initPointerLock();

	width = scene.getEngine().getRenderWidth();
	height = scene.getEngine().getRenderHeight();

	// Watch for browser/canvas resize events
	window.addEventListener("resize", function () { engine.resize(); });

	window.addEventListener("mousedown", function(evt) {
		// left click to shoot
		if (evt.button === 0 && controlEnabled) { shoot(scene); }
	});
}

function shoot(scene) {
	gunshot.play();

	var pickInfo = scene.pick(width/2, height/2, null, false, camera);
	if (pickInfo.pickedMesh.name === "asteroid") {
		pickInfo.pickedMesh.dispose();
		points++;
	}
}

function animate() {
	requestAnimationFrame( animate );

	render();

	stats.update();
}

function render() {
	// Updating timer
	var elapsedTime = clock.getElapsedTime().toString().split(".")[0];
	var minutes = Math.floor(elapsedTime / 60);
	var seconds = elapsedTime % 60;
	if (elapsedTime < 60) {
		if (elapsedTime.length == 1) { elapsedTime = "0" + elapsedTime; }
		elapsedTime = "00:" + elapsedTime;
	}
	else {
		if (minutes.toString().length == 1) { minutes = "0" + minutes; }
		if (seconds.toString().length == 1) { seconds = "0" + seconds; }
		elapsedTime = minutes + ":" + seconds;
	}
	divTime.innerHTML = elapsedTime;
	
	if ((seconds % asteroidRespawn == 0) && (asteroids.length < maxNumberOfAsteroids) && controlEnabled 
		&& (lastSecondAsteroidCreated != seconds)) {
			lastSecondAsteroidCreated = seconds;
			createAsteroid(scene); 
	}
	
	divPoints.innerHTML = points;

	updateHealthStatus();

	movePlanets();

	if (controlEnabled) { moveAsteroids(); }

	removeAsteroids();

	scene.render();
}

function movePlanets () {
	for (var i = 0; i < planets.length; i++) {
		planets[i].rotation.x += Math.PI / 1024;
		// var rot = new BABYLON.Vector3.RotationFromAxis(BABYLON.Axis.X, 1.0, BABYLON.Space.LOCAL);
		// planets[i].rotation = rot;
	}
}

function moveAsteroids () {
	for (var i = 0; i < asteroids.length; i++) {
		// asteroids[i].position.x += asteroidSpeed;
		// asteroids[i].position.y += asteroidSpeed;
		// asteroids[i].position.z += asteroidSpeed;

		asteroids[i][0].translate(asteroids[i][1], asteroidSpeed, BABYLON.Space.LOCAL);
	}
}

function removeAsteroids () {
	for (var i = 0; i < asteroids.length; i++) {
		if (asteroids[i][0].position.x < -5000.0 || asteroids[i][0].position.x > 5000.0 ||
			asteroids[i][0].position.y < -5000.0 || asteroids[i][0].position.y > 5000.0 ||
			asteroids[i][0].position.z < -5000.0 || asteroids[i][0].position.z > 5000.0) {
				asteroids[i][0].dispose();
				asteroids.splice(i, 1);
		}
	}
}

function createStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top      = '0px';
	container.appendChild( stats.domElement );
}

function createScene() {
    var scene = new BABYLON.Scene(engine);

    scene.gravity = new BABYLON.Vector3(0, 0, 0);
    // scene.enablePhysics(scene.gravity, new BABYLON.OimoJSPlugin());		// no gravity
    // scene.enablePhysics(new BABYLON.Vector3(0,-10,0), new BABYLON.OimoJSPlugin());		// with gravity

    // Enable Collisions
    scene.collisionsEnabled = true;
    

    // engine.isPointerLock = true;

    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    createCamera(scene);

	var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.0;

    var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, -1, 0), scene);
    light2.intensity = 1.0;

    createSkybox(scene);
    createSpaceship(scene);
    createPlanets(scene);
    createHealthStatus();
    createMap(scene);

    gunshot = new BABYLON.Sound("gunshot", "sounds/Blaster-Solo.wav", scene);

   	return scene;	
}

function createCamera (scene) {
	camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 100, 150), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, -200));
    camera.attachControl(canvas, true);

    // Remap keys to move with WASD
    camera.keysUp 			  = [87]; // W
    camera.keysDown 		  = [83]; // S
    camera.keysLeft 		  = [65]; // A
    camera.keysRight 		  = [68]; // D

    camera.ellipsoid       	  = new BABYLON.Vector3(110, 110, 110);
    camera.checkCollisions 	  = true;
    camera.applyGravity       = true;

    camera.speed 		   	  = 10.0;
    camera.inertia 		   	  = 0.9;
    camera.angularInertia 	  = 0;
    camera.angularSensibility = 2500;
    camera.layerMask 		  = 2;
    camera.viewport           = new BABYLON.Viewport(0, 0, 1.0, 1.0);
    scene.activeCameras.push(camera);
    scene.activeCamera 		  = camera;

    camera.onCollide = function (collidedMesh) {
    	if (collidedMesh.id === "asteroid") {
    		collidedMesh.dispose();
    		health -= 0.1;
    		points++;
    	}
    	if ($.inArray(collidedMesh.id + ".jpg", planetTextures) !== -1) {
    		health -= 0.002;
    	}
    }
}

function createMap (scene) {
	map = new BABYLON.FreeCamera("minimap", new BABYLON.Vector3(0,800,150), scene);
	// map.setTarget(new BABYLON.Vector3(4000, 4000, 4000));
	// map.setTarget(new BABYLON.Vector3(0.18,0.18,0.18));
	// map.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

	var size        = 50;
	map.orthoLeft   = - size;
	map.orthoRight  =   size;
	map.orthoTop    =   size;
	map.orthoBottom = - size;

	map.rotation.x = Math.PI/2;
	// map.rotation.y = 2 * Math.PI;
	map.parent = camera;

	var xStart = 0.7;         // 70% from the left
    var yStart = 0.65;        // 65% from the bottom
	var width  = 1-xStart; // Almost until the right edge of the screen
    var	height = 1-yStart;    // Until the top edge of the screen

	map.viewport = new BABYLON.Viewport( xStart, yStart, width, height );

	// Add the camera to the list of active cameras of the game
	scene.activeCameras.push(map);
	scene.activeCamera = camera;

	map.layerMask    = 1;
	camera.layerMask = 2;

	// // The representation of player in the minimap
	// var playerOnMap        = BABYLON.Mesh.CreateSphere("playerOnMap", 16, 4, scene);
	// playerOnMap.position.y = 10;
	
	// // The sphere position will be displayed accordingly to the player position
	// playerOnMap.registerBeforeRender(function() {
	//     playerOnMap.position.x = spaceship.position.x;
	//     playerOnMap.position.z = spaceship.position.z;
	// });

	// var red = new BABYLON.StandardMaterial("red", scene);
	// red.diffuseColor = BABYLON.Color3.Red();
	// red.specularColor = BABYLON.Color3.Black();
	// playerOnMap.material = red;

	// // spaceship.layerMask = 2; // it claims spaceship is undefinied
	// playerOnMap.layerMask = 1; // 001 in binary : won't be displayed on the player camera, only in the minimap
}

function createSkybox (scene) {
	// The box creation
	var skybox = BABYLON.Mesh.CreateSphere("skyBox", 100.0, 10000.0, scene);
	var walls = [
		BABYLON.Mesh.CreateGround("wall1", 10000 / Math.sqrt(3), 10000 / Math.sqrt(3), 2, scene),
		BABYLON.Mesh.CreateGround("wall2", 10000 / Math.sqrt(3), 10000 / Math.sqrt(3), 2, scene),
		BABYLON.Mesh.CreateGround("wall3", 10000 / Math.sqrt(3), 10000 / Math.sqrt(3), 2, scene),
		BABYLON.Mesh.CreateGround("wall4", 10000 / Math.sqrt(3), 10000 / Math.sqrt(3), 2, scene),
		BABYLON.Mesh.CreateGround("wall5", 10000 / Math.sqrt(3), 10000 / Math.sqrt(3), 2, scene),
		BABYLON.Mesh.CreateGround("wall6", 10000 / Math.sqrt(3), 10000 / Math.sqrt(3), 2, scene),
	]

	walls[0].position.x = 5000 / Math.sqrt(3);
	walls[0].rotate(BABYLON.Axis.Z, Math.PI / 2, BABYLON.Space.LOCAL);

	walls[1].position.x = - 5000 / Math.sqrt(3);
	walls[1].rotate(BABYLON.Axis.Z, -Math.PI / 2, BABYLON.Space.LOCAL);

	walls[2].position.y = 5000 / Math.sqrt(3);
	walls[2].rotate(BABYLON.Axis.Z, Math.PI, BABYLON.Space.LOCAL);

	walls[3].position.y = - 5000 / Math.sqrt(3);

	walls[4].position.z = 5000 / Math.sqrt(3);
	walls[4].rotate(BABYLON.Axis.X, - Math.PI / 2, BABYLON.Space.LOCAL);

	walls[5].position.z = - 5000 / Math.sqrt(3);
	walls[5].rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);

	var wallMaterial   = new BABYLON.StandardMaterial("wallTexture", scene);
	wallMaterial.alpha = 0.0;

	for (var i = 0; i < walls.length; i++) {
		walls[i].checkCollisions = true;
		walls[i].material = wallMaterial;
	};

	// The sky creation
	var skyboxMaterial                               = new BABYLON.StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling                   = false;
	skyboxMaterial.diffuseColor                      = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.specularColor                     = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.reflectionTexture                 = new BABYLON.CubeTexture("assets/space", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

	// box + sky = skybox !
	skybox.material = skyboxMaterial;

	return skybox;
}

function createSpaceship (scene) {
	// Load spaceship model
    BABYLON.SceneLoader.ImportMesh("", "assets/", "spaceship.babylon", scene, function (meshes) {
    	spaceship          	         = meshes[0];
		spaceship.scaling  	         = new BABYLON.Vector3(0.08, 0.08, 0.08);
		spaceship.position 	         = new BABYLON.Vector3(0, -45, 120);
		spaceship.rotationQuaternion = null;
		spaceship.checkCollisions 	 = true;
		spaceship.ellipsoid 		 = new BABYLON.Vector3(500, 100, 500);
		spaceship.applyGravity 		 = true;
		// spaceship.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:1, friction:0.001, restitution:1.5});
		spaceship.rotation.x         = 2.0 * Math.PI;
		spaceship.rotation.y         = Math.PI;
		spaceship.parent	         = camera;

		spaceship.onCollide = function (meshCol) {
			console.log("spaceship collided with " + meshCol.id);
		}
    });
}

function createPlanets (scene) {
	planets      		= [];
	planetTextures = ["mercury.jpg", "venus.jpg", "earth.jpg", "mars.jpg",
						  "jupiter.jpg", "saturn.jpg", "uranus.jpg", "neptune.jpg", 
						  "pluto.jpg"];
	planetSizes = [200.0, 600.0, 800.0, 500.0, 1500.0, 1200.0, 1000.0, 900.0, 150.0];
	var planetPositions = populatePlanetPositions();

	for (var i = 0; i < planetTextures.length; ++i) {
		var planet 				= BABYLON.Mesh.CreateSphere(planetTextures[i].split(".")[0], 50.0, planetSizes[i], scene);
		// planet.position 		= new BABYLON.Vector3(getRandomNumber(-3000.0, 3000.0), getRandomNumber(-3000.0, 3000.0), getRandomNumber(-3000.0, 3000.0));
		planet.position         = planetPositions[i];
		planet.checkCollisions 	= true;
		planet.applyGravity		= true;
		// planet.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {mass:1, friction:0.001, restitution:1.5});
		var material 			= new BABYLON.StandardMaterial(planetTextures[i].split(".")[0] + "texture", scene);
		planet.material 		= material;
		material.diffuseTexture = new BABYLON.Texture("assets/" + planetTextures[i], scene);
		planets.push(planet);
	}
}

function populatePlanetPositions ()
{
	var planetPositions = [];
	planetPositions.push(new BABYLON.Vector3 (200.0,   200.0,    -350.0  ));
	planetPositions.push(new BABYLON.Vector3 (1000.0,  900.0,   1524.0));
	planetPositions.push(new BABYLON.Vector3 (-200.0,  2000.0, -2400.0));
	planetPositions.push(new BABYLON.Vector3 (2000.0, -1000.0,  2000.0));
	planetPositions.push(new BABYLON.Vector3 (-2500.0, 780.0,   -300.0));
	planetPositions.push(new BABYLON.Vector3 (0.0,    -2300.0,   600.0));
	planetPositions.push(new BABYLON.Vector3 (680.0,   457.0,    192.0));
	planetPositions.push(new BABYLON.Vector3 (473.0,   2821.0,  -900.0));
	planetPositions.push(new BABYLON.Vector3 (2700.0, -1023.0,   980.0));

	return planetPositions;
}

function getMaxNumberOfAsteroids (difficulty) {
	var number = 30;
	if (difficulty === "Easy")   { number = 30; }
	if (difficulty === "Medium") { number = 40; }
	if (difficulty === "Hard")   { number = 50; }

	return number;
}

function getAsteroidSpeed (difficulty) {
	var speed = 5;
	if (difficulty === "Easy")   { speed = 5; }
	if (difficulty === "Medium") { speed = 7; }
	if (difficulty === "Hard")   { speed = 10; }

	return speed;
}

function getAsteroidRespawn (difficulty) {
	var respawn = 5;
	if (difficulty === "Easy")   { respawn = 5; }
	if (difficulty === "Medium") { respawn = 4; }
	if (difficulty === "Hard")   { respawn = 2; }

	return respawn;
}

function createAsteroid (scene) {
	var asteroid             = BABYLON.Mesh.CreateSphere("asteroid", 5.0, 100.0, scene);
	asteroid.position        = new BABYLON.Vector3(getRandomNumber(-5000, 5000), getRandomNumber(-5000, 5000), getRandomNumber(-5000, 5000));
	asteroid.applyGravity	 = true;
	asteroid.checkCollisions = true;
	// asteroid.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {mass:1, friction:0.001, restitution:1.5});

	var bumpMaterial         = new BABYLON.StandardMaterial("asteroidTexture", scene);
	bumpMaterial.bumpTexture = new BABYLON.Texture("assets/asteroidBump.jpg", scene);

	bumpMaterial.diffuseColor  = new BABYLON.Color3(0.3, 0.3, 0.3);
	bumpMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
	bumpMaterial.specularPower = 10;

	bumpMaterial.bumpTexture.level   = 10;
	bumpMaterial.bumpTexture.uScale  = 3;
	bumpMaterial.bumpTexture.vScale  = 3;
	bumpMaterial.bumpTexture.uAng    = 3; 
	bumpMaterial.bumpTexture.vAng    = 3; 
	bumpMaterial.bumpTexture.wAng    = 1; 
	bumpMaterial.bumpTexture.uOffset = 3;
	bumpMaterial.bumpTexture.vOffset = 3;

	bumpMaterial.bumpTexture.wrapU = 10; 
	bumpMaterial.bumpTexture.wrapV = 10; 

	asteroid.material = bumpMaterial;

	var axis = new BABYLON.Vector3(camera.position.x - asteroid.position.x, camera.position.y - asteroid.position.y, camera.position.z - asteroid.position.z);

	var pair = [asteroid, axis.normalize()];

	asteroids.push(pair);
}

function createHealthStatus () {
	divHealth.innerHTML = "";
	for (var i = 0; i < 10; i++){
		divHealth.innerHTML += "<svg width='20' height='20'><rect width='15' height='15' style='fill:rgb(0,255,0);stroke-width:3;stroke:rgb(0,0,0)' /></svg>"
	}
}

function updateHealthStatus() {
	divHealth.innerHTML = "";
	if (health >= 0.7){
		for (var i = 0; i < Math.floor(health * 10); i++)
			divHealth.innerHTML += "<svg width='20' height='20'><rect width='15' height='15' style='fill:rgb(0,255,0);stroke-width:3;stroke:rgb(0,0,0)' /></svg>"
		for (var i = Math.floor(health * 10); i < 10; i++)
			divHealth.innerHTML += "<svg width='20' height='20'><rect width='15' height='15' style='fill:rgb(0,255,0);opacity:0.4;stroke-width:3;stroke:rgb(0,0,0)' /></svg>"
	}
	else if (health >= 0.5 && health < 0.7) {
		for (var i = 0; i < Math.floor(health * 10); i++)
			divHealth.innerHTML += "<svg width='20' height='20'><rect width='15' height='15' style='fill:rgb(255,255,0);stroke-width:3;stroke:rgb(0,0,0)' /></svg>"
		for (var i = Math.floor(health * 10); i < 10; i++)
			divHealth.innerHTML += "<svg width='20' height='20'><rect width='15' height='15' style='fill:rgb(255,255,0);opacity:0.4;stroke-width:3;stroke:rgb(0,0,0)' /></svg>"
	}
	else {
		for (var i = 0; i < Math.floor(health * 10); i++)
			divHealth.innerHTML += "<svg width='20' height='20'><rect width='15' height='15' style='fill:rgb(255,0,0);stroke-width:3;stroke:rgb(0,0,0)' /></svg>"
		for (var i = Math.floor(health * 10); i < 10; i++)
			divHealth.innerHTML += "<svg width='20' height='20'><rect width='15' height='15' style='fill:rgb(255,0,0);opacity:0.4;stroke-width:3;stroke:rgb(0,0,0)' /></svg>"
	}

	if (health < 0.1) { endGame(); }
}

function endGame () {
	location.replace("gameOver.html");
}

// function createWarning (scene) {
// 	// It's a trap! You're out of the safety zone. 
// 	// Go back or you'll be redirected
// 	var background      = BABYLON.Mesh.CreateGround("background", 100, 100, 100, scene, false);
// 	var material        = new BABYLON.StandardMaterial("background", scene);
// 	background.material = material;
	
// 	var backgroundTexture      = new BABYLON.DynamicTexture("dynamic texture", 512, scene, true);
// 	material.diffuseTexture    = backgroundTexture;
// 	material.specularColor     = new BABYLON.Color3(0, 0, 0);
// 	material.reflectionTexture = new BABYLON.CubeTexture("assets/space", scene);
// 	material.backFaceCulling   = false;

// 	backgroundTexture.drawText("It's a trap! You're out of the safety zone.", null, 10, "bold 70px Segoe UI", "yellow", "#555555");
// 	backgroundTexture.drawText("Go back or you'll be redirected", null, 100, "bold 70px Segoe UI", "yellow", "#555555");
// }

function initMovement() {
	// When a key is pressed, set the movement
    var onKeyDown = function(evt) {
    	switch (evt.keyCode) {
    		case 65:
    			// key 'a' presseds
	    		// moveSpaceship(-spaceshipSpeed, 0);
				break;  
			case 68:
    			// key 'd' pressed
	    		// moveSpaceship(spaceshipSpeed, 0);
				break;
			case 83:
    			// key 's' presseds
	    		// moveSpaceship(0, -spaceshipSpeed);
				break;  
			case 87:
				// var forward = new BABYLON.Vector3(parseFloat(Math.sin(spaceship.rotation.y)) / 5, 0, parseFloat(Math.cos(spaceship.rotation.y)) / 5);
				// var forward = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(spaceship.rotation.y))) / 5, 0.5, parseFloat(Math.cos(parseFloat(spaceship.rotation.y))) / 5);
				// forward = forward.negate();
				// spaceship.moveWithCollisions(forward);

    			// key 'w' pressed
	    		// moveSpaceship(0, spaceshipSpeed);
				break; 	
    	}
    };

    var onKeyUp = function(evt) {
    }

	// Register events with the right Babylon function
    BABYLON.Tools.RegisterTopRootEvents([{
        name: "keydown",
        handler: onKeyDown
    }, {
        name: "keyup",
        handler: onKeyUp
    }]);
}

function initPointerLock () {
	// On click event, request pointer lock
    canvas.addEventListener("click", function(evt) {
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) { canvas.requestPointerLock(); }
    }, false);

    // Attach events to the document
    document.addEventListener("pointerlockchange",       pointerLockChange, false);
    document.addEventListener("mspointerlockchange",     pointerLockChange, false);
    document.addEventListener("mozpointerlockchange",    pointerLockChange, false);
    document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
}

// Remove cursor 
function pointerLockChange (event) {
	controlEnabled = (     document.mozPointerLockElement === canvas
                        || document.webkitPointerLockElement === canvas
                        || document.msPointerLockElement === canvas
                        || document.pointerLockElement === canvas);


	 if (!controlEnabled) { camera.detachControl(canvas); } 
     else                 { camera.attachControl(canvas); }
}

function getRandomNumber (min, max) {
	return Math.random() * (max - min + 1) + min;
}

// function moveSpaceship(speedX, speedY) {
// 	spaceship.position.x -= speedX;
// 	spaceship.position.z -= speedY;
// }