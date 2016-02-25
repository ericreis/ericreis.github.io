var container, stats;
var scene, camera, renderer, raycaster;
var planeEasy, planeMedium, planeHard, planeBack;
var planeStart = null;
var raycaster;
var mouse = new THREE.Vector2(), INTERSECTED;
var selected = null;

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
	createButtons();

	document.addEventListener( 'mousedown' , onMouseLeftButtonDown, false );
}

function createButtons() {
	// Back
	var texture          = THREE.ImageUtils.loadTexture("images/back.png");
	var material         = new THREE.MeshBasicMaterial({ map : texture, transparent: true});
	planeBack            =  new THREE.Mesh(new THREE.PlaneGeometry(40, 40), material);
	planeBack.position.x = 250;
	planeBack.position.y = 50;
	planeBack.position.z = -100;
	planeBack.name       = "BackButton";
	scene.add(planeBack);
}

function createStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );
}

function animate() {
	requestAnimationFrame( animate );

	render();
	stats.update();
}

function render() {
	renderer.autoClear = false;
	renderer.clear();

	if (selected != null && planeStart == null)
		createStart();

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
		if (clickedObject.name === "BackButton") {
			location.replace("menu.html");
		}
	}
}