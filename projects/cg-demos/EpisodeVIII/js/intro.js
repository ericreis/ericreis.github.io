var container, stats;
var camera, scene, renderer;
var group, text, text2;
var groups = [];

var clock;

var clearIntro = true;
var startLogo = true;
var startParagraph = true;

var plane, skipPlane;
var raycaster;
var sound;

var mouse = new THREE.Vector2(), INTERSECTED;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// Initializing scene
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.set( 0, 160, 200 );

	// set clear color as transparent, so the background doenst disappear
	renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
	renderer.setSize( window.innerWidth, window.innerHeight );	
	container.appendChild( renderer.domElement );

	// initialize raycaster
	raycaster = new THREE.Raycaster();

	// initialize clock
	clock = new THREE.Clock();

	// initialize audio
	sound = new Audio("sounds/intro.mp3");

	createIntroText();

	createStats();

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousedown' , onMouseLeftButtonDown, false );
}

function createStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );
}

function createIntroText() {
	var paragraph = [];

	paragraph.push("In a classroom at UFRJ, in the");
	paragraph.push("middle of the summer ...");

	for (var i = 0; i <= 1; i++) {
		var text3d = new THREE.TextGeometry( paragraph[i], {
			size: 16,
			height: 1,
			curveSegments: 5,
			font: "helvetiker"
		});

		text3d.computeBoundingBox();
		var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );
		// overdraw is the width of the 3d letters
		var textMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(80, 241, 242)', overdraw: 0.1} );
		text = new THREE.Mesh( text3d, textMaterial );

		text.position.x = centerOffset;
		text.position.y = 150 - 30*i;
		text.position.z = -100;

		group = new THREE.Object3D();
		group.add( text );
		groups.push(group);
		scene.add( group );
	}

	createSkipButton();
}

function createSkipButton(){
	var texture  = THREE.ImageUtils.loadTexture("images/skip.png");
	var material = new THREE.MeshBasicMaterial({ map : texture, transparent: true });
	skipPlane    =  new THREE.Mesh(new THREE.PlaneGeometry(50, 40), material);

	skipPlane.position.x = 230;
	skipPlane.position.y = 270;
	skipPlane.position.z = -100;
	skipPlane.name       = "SkipButton";
	scene.add(skipPlane);
}

function createLogo() {
	var texture  = THREE.ImageUtils.loadTexture("images/space-shooter.png");
	var material = new THREE.MeshBasicMaterial({ map : texture, transparent: true });
	plane        =  new THREE.Mesh(new THREE.PlaneGeometry(622, 200), material);

	plane.position.x = 0;
	plane.position.y = 150;
	plane.position.z = -100;

	scene.add(plane);
}

function createParagraph() {
	var paragraph = [];

	var title = "Episode VIII";
	paragraph.push(title);

	paragraph.push("You are in control of a intergalatic spaceship.");
	paragraph.push("Your mission is to penetrate the enemy forces");
	paragraph.push("and cause the most damage you can. Remember,");
	paragraph.push("the space is a dangerous place.");

	paragraph.push("As you keep moving forward, your mission");
	paragraph.push("may become harder. Move carefully and never");
	paragraph.push("forget to watch your back.")
	// paragraph.push("for bonus itens as they appear in outter space");

	paragraph.push("Use your abilities and weapons to return");
	paragraph.push("home at one piece and with your mission");
	paragraph.push("completed. You are our last hope.");

	paragraph.push("May the force be with you...");

	var size = 20;
	for (var i = 0; i < paragraph.length; i++) {

		if (paragraph[i] == title)	
			size = 40;
		else
			size = 20;

		var text3d = new THREE.TextGeometry( paragraph[i], {
			size: size,
			height: 1,
			curveSegments: 5,
			font: "helvetiker"
		});

		text3d.computeBoundingBox();
		var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );
		// overdraw is the width of the 3d letters
		var textMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(244, 190, 25)', overdraw: 0.1} );
		// var textMaterial = new THREE.MeshLambertMaterial( { color: 0x50F1F2 } );
		text = new THREE.Mesh( text3d, textMaterial );

		text.position.x = centerOffset;
		text.position.y = -10*i;
		text.position.z = 300;

		if (i == 0)
			text.position.y = 60 - 10*i;

		if (i >= 5)
			text.position.y = -30 - 10*i;

		if (i >= 8)
			text.position.y = -60 - 10*i;

		if (i == 11) 
			text.position.y = -90 - 10*i;

		text.rotation.x = 200;

		group = new THREE.Object3D();
		group.add( text );
		groups.push(group);
		scene.add( group );
	}
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

	if (clock.getElapsedTime() >= 5 && clearIntro) {
		clearIntro = false;
		var size = groups.length;
		for (var i = 0; i < size; i++){
			// groups[i].children[0].material.opacity = 0;
			scene.remove(groups[0]);
			groups.splice(0, 1);
		}
		sound.play();
	}

	if (clock.getElapsedTime() >= 7.7 && startLogo) {
		startLogo = false;
		createLogo();
	}

	if (clock.getElapsedTime() >= 15 && startParagraph) {
		startParagraph = false;
		createParagraph();
	}

	if (clock.getElapsedTime() >= 90) { location.replace("menu.html"); }
}

function moveLogo() {
	plane.position.z -= 2;
	plane.scale.x    -= 0.0012;
	plane.scale.y    -= 0.0012;
}

function moveParagraph() {
	for (var i = 0; i < 6; i++) {
		var speed = [10,12,14,16,18,20,22,24,26,28,30,32];
		var delta = [1800, 1500, 1200, 900, 900, 900, 900, 900, 900, 900, 900, 900];
		for (var j = 0; j < groups.length; j++) {
			groups[j].children[0].position.y += i / delta[j];
			groups[j].children[0].position.z -= i / speed[j];
			groups[j].children[0].rotation.x -= 0.00001;
		}
	}
}

function render() {
	renderer.autoClear = false;
	renderer.clear();

	if (!startParagraph) {
		moveParagraph();
	}

	if (!startLogo) {
		moveLogo();
	}

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
		if (clickedObject.name === "SkipButton") {
			// go to menu page
			location.replace("menu.html");	
		}
	}
}