var container, stats;
var scene, camera, renderer, raycaster;
var planeStart, planeDifficulty, planeInstructions, planeCredits;
var raycaster;
var mouse = new THREE.Vector2(), INTERSECTED;

init();
animate();

function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// Initializing scene
	scene = new THREE.Scene();

	// initialize camera
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.set( 0, 160, 200 );

	// set clear color as transparent, so the background doenst disappear
	renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
	renderer.setSize( window.innerWidth, window.innerHeight );	
	container.appendChild( renderer.domElement );

	// initialize raycaster
	raycaster = new THREE.Raycaster();

	createStats();
	createButtons();

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousedown' , onMouseLeftButtonDown, false );
}

function createButtons(){
	
	// Start
	var texture  = THREE.ImageUtils.loadTexture("images/start.png");
	var material = new THREE.MeshBasicMaterial({ map : texture, transparent: true});
	planeStart   =  new THREE.Mesh(new THREE.PlaneGeometry(150, 70), material);
	planeStart.position.x = 0;
	planeStart.position.y = 250;
	planeStart.position.z = -100;
	planeStart.name = "Start";
	scene.add(planeStart);

	// Difficulty
	texture         = THREE.ImageUtils.loadTexture("images/difficulty.png");
	material        = new THREE.MeshBasicMaterial({ map : texture, transparent: true});
	planeDifficulty =  new THREE.Mesh(new THREE.PlaneGeometry(200, 70), material);
	planeDifficulty.position.x = 0;
	planeDifficulty.position.y = 190;
	planeDifficulty.position.z = -100;
	planeDifficulty.name = "Difficulty";
	scene.add(planeDifficulty);

	// Instructions
	texture           = THREE.ImageUtils.loadTexture("images/instructions.png");
	material          = new THREE.MeshBasicMaterial({ map : texture, transparent: true});
	planeInstructions = new THREE.Mesh(new THREE.PlaneGeometry(220, 70), material);
	planeInstructions.position.x = 0;
	planeInstructions.position.y = 130;
	planeInstructions.position.z = -100;
	planeInstructions.name = "Instructions";
	scene.add(planeInstructions);

	// Credits
	texture      = THREE.ImageUtils.loadTexture("images/credits.png");
	material     = new THREE.MeshBasicMaterial({ map : texture, transparent: true});
	planeCredits = new THREE.Mesh(new THREE.PlaneGeometry(150, 70), material);
	planeCredits.position.x = 0;
	planeCredits.position.y = 70;
	planeCredits.position.z = -100;
	planeCredits.name = "Credits";
	scene.add(planeCredits);
}

function createStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );

	render();
	stats.update();
}

function render() {
	renderer.autoClear = false;
	renderer.clear();

	renderer.render( scene, camera );
}

function onMouseLeftButtonDown(event) {
	event.preventDefault();

	mouse.x = (event.clientX / window.innerWidth) * 2 -1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	// Get 3D vector from 3D mouse position using 'unproject' function
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
	vector.unproject(camera);

	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects(scene.children);
	if (intersects.length > 0) {
		var clickedObject = intersects[0].object;
		if (clickedObject.name === "Start") {
			localStorage.setItem("difficulty", "");
			location.replace("game.html");	
		}
		if (clickedObject.name === "Difficulty")   { location.replace("difficulty.html");	}
		if (clickedObject.name === "Instructions") { location.replace("instructions.html");	}
		if (clickedObject.name === "Credits")      { location.replace("credits.html"); }
	}
}
