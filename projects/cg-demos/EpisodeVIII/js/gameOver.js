var container, stats;
var scene, camera, renderer, raycaster;
var planeStart, planeMenu;

var mouse = new THREE.Vector2(), INTERSECTED;

document.addEventListener("DOMContentLoaded", function () { init(), animate(); }, false);

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
	createGameOver();
	createButtons();

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousedown' , onMouseLeftButtonDown, false );
}

function render() {
	renderer.autoClear = false;
	renderer.clear();

	renderer.render( scene, camera );
}

function animate() {
	requestAnimationFrame( animate );

	render();

	stats.update();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function createStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top      = '0px';
	container.appendChild( stats.domElement );
}

function createButtons () {
	// Start
	var texture           = THREE.ImageUtils.loadTexture("images/start.png");
	var material          = new THREE.MeshBasicMaterial({ map : texture, transparent: true});
	planeStart            =  new THREE.Mesh(new THREE.PlaneGeometry(150, 70), material);
	planeStart.position.x = 0;
	planeStart.position.y = 170;
	planeStart.position.z = -100;
	planeStart.name       = "StartButton";
	scene.add(planeStart);

	// Menu
	var texture          = THREE.ImageUtils.loadTexture("images/back.png");
	var material         = new THREE.MeshBasicMaterial({ map : texture, transparent: true});
	planeMenu            =  new THREE.Mesh(new THREE.PlaneGeometry(150, 70), material);
	planeMenu.position.x = 0;
	planeMenu.position.y = 100;
	planeMenu.position.z = -100;
	planeMenu.name       = "MenuButton";
	scene.add(planeMenu);
}

function createGameOver() {
	var texture              = THREE.ImageUtils.loadTexture("images/gameOver.png");
	var material             = new THREE.MeshBasicMaterial({ map : texture, transparent: true});
	var planeGameOver        =  new THREE.Mesh(new THREE.PlaneGeometry(200, 70), material);
	planeGameOver.position.x = 0;
	planeGameOver.position.y = 250;
	planeGameOver.position.z = -100;
	planeGameOver.name       = "GameOver";
	scene.add(planeGameOver);
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
		console.log(intersects);
		var clickedObject = intersects[0].object;
		if (clickedObject.name === "MenuButton")  { location.replace("menu.html"); }
		if (clickedObject.name === "StartButton") { 
			localStorage.setItem("difficulty", "Easy");
			location.replace("game.html"); }
	}
}