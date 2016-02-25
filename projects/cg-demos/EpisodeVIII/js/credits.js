var container, stats;
var scene, camera, renderer, raycaster;
var planeBack;
var raycaster;
var mouse = new THREE.Vector2(), INTERSECTED;
var group, text;
var groups = [];
var sound;

var clock;

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

	// initialize audio
	// sound = new Audio("sounds/intro.mp3");
	// sound.play();

	// initialize clock
	clock = new THREE.Clock();

	createStats();
	createButtons();
	createParagraph();

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousedown' , onMouseLeftButtonDown, false );
}

function createButtons(){
	
	// Back
	var texture  = THREE.ImageUtils.loadTexture("images/back.png");
	var material = new THREE.MeshBasicMaterial({ map : texture, transparent: true});
	planeBack    =  new THREE.Mesh(new THREE.PlaneGeometry(50, 70), material);
	planeBack.position.x = 230;
	planeBack.position.y = 270;
	planeBack.position.z = -100;
	planeBack.name = "BackButton";
	scene.add(planeBack);
}

function createParagraph() {
	var paragraph = [];

	paragraph.push("This project was developed by");
	paragraph.push("Eric Reis Figueiredo and Pamela Tabak,");
	// paragraph.push("as a Computer Graphics project");
	paragraph.push("at Universidade Federal do Rio De Janeiro,")
	paragraph.push("class of 2015.2");

	for (var i = 0; i < paragraph.length; i++) {
		var text3d = new THREE.TextGeometry( paragraph[i], {
			size: 20,
			height: 1,
			curveSegments: 5,
			font: "helvetiker"
		});

		text3d.computeBoundingBox();
		var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );
		// overdraw is the width of the 3d letters
		var textMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(244, 190, 25)', overdraw: 0.1} );
		text = new THREE.Mesh( text3d, textMaterial );

		text.position.x = centerOffset;
		text.position.y = -30*i;
		text.position.z = -200;

		text.rotation.x = 200;

		group = new THREE.Object3D();
		group.add( text );
		groups.push(group);
		scene.add( group );
	}
}

function moveParagraph() {
	for (var i = 0; i < 6; i++) {
		var speed = [10,12,14,16,18,20,22];
		var delta = [1800, 1500, 1200, 900, 900];
		for (var j = 0; j < groups.length; j++) {
			groups[j].children[0].position.y += i / delta[j];
			groups[j].children[0].position.z -= i / speed[j];
			groups[j].children[0].rotation.x -= 0.00001;
		}
	}
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

	if (clock.getElapsedTime() >= 30) {
		// go to menu page
		location.replace("menu.html");
	}

}

function render() {
	renderer.autoClear = false;
	renderer.clear();

	moveParagraph();

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
			// go to menu page
			location.replace("menu.html");	
		}
	}
}