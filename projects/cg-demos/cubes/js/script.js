var colors = [
    0xFF62B0,
    0x9A03FE,
    0x62D0FF,
    0x48FB0D,
    0xDFA800,
    0xC27E3A,
    0x990099,
    0x9669FE,
    0x23819C,
    0x01F33E,
    0xB6BA18,
    0xFF800D,
    0xB96F6F,
    0x4A9586
];
var particleLight;

var cubes = {
    
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    controls: null,
    clock: null,
    stats: null,
    plane: null,
    selection: null,
    offset: new THREE.Vector3(),
    objects: [],
    raycaster: new THREE.Raycaster(),
    prevMousePosition: null,

    init: function() { // Initialization

        // create main scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0003);

        var SCREEN_WIDTH = window.innerWidth,
            SCREEN_HEIGHT = window.innerHeight;

        // prepare camera        
        var VIEW_ANGLE = 45, 
            ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, 
            NEAR = 1, 
            FAR = 10000;
        this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.scene.add(this.camera);
        this.camera.position.set(0, 0, 1000);
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        // prepare renderer
        this.renderer = new THREE.WebGLRenderer({antialias:true, alpha: false});
        this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        this.renderer.setClearColor(this.scene.fog.color);

        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;

        // prepare container
        this.container = document.createElement('div');
        document.body.appendChild(this.container);
        this.container.appendChild(this.renderer.domElement);

        // events
        THREEx.WindowResize(this.renderer, this.camera);
        document.addEventListener('mousedown', this.onDocumentMouseDown, false);
        document.addEventListener('mousemove', this.onDocumentMouseMove, false);
        document.addEventListener('mouseup', this.onDocumentMouseUp, false);

        // prepare controls (OrbitControls)
        this.controls = new THREE.OrbitControls(this.camera);
        this.controls.target = new THREE.Vector3(0, 0, 0);

        // prepare clock
        this.clock = new THREE.Clock();

        // prepare stats
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.zIndex = 10;
        this.container.appendChild( this.stats.domElement );
        
        // add AxisHelper
        var axisHelper = new THREE.AxisHelper(800); // 500 is size
        this.scene.add(axisHelper);

        // add lights
        this.scene.add( new THREE.AmbientLight(0x444444));

        var dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(200, 200, 1000).normalize();
        this.camera.add(dirLight);
        this.camera.add(dirLight.target);
        
        // add plane, that helps to determinate an intersection position
        this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(5000, 5000, 8), new THREE.MeshBasicMaterial({ color: this.scene.fog.color, opacity: 0, transparent: true }));
//        this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8), new THREE.MeshBasicMaterial({color: 0xff0000}));
        this.plane.visible = true;
        this.scene.add(this.plane);
        
    },
    
    getRandColor: function() {
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    drawCube: function(x, y, z) {
        var cube = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), new THREE.MeshLambertMaterial({ color: this.getRandColor() }));
        cube.rotation.x = Math.PI * Math.random();
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        cube.castShadow = true;
        return cube;
    },
    
    toRadians: function(degrees) {
        return degrees * (Math.PI/180);
    },
    
    onDocumentMouseDown: function (event) {
        
        // get mouse position
        var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        // get 3D vector from 3D mouse position using 'unproject' function
        var vector = new THREE.Vector3(mouseX, mouseY, 0.5);
        vector.unproject(cubes.camera);

        // direction vector
        var dir = vector.sub(cubes.camera.position).normalize();
        
        // set raycaster position
        cubes.raycaster.set(cubes.camera.position, dir);

        switch (event.button) {
                
            case 0:
                // find intersected objects
                var intersects = cubes.raycaster.intersectObjects(cubes.objects);

                if (intersects.length > 0) {

                    // disable controls
                    cubes.controls.enabled = false;
                    
                    // set selection - first intersected object (closest)
                    cubes.selection = intersects[0].object;

                    // calculate offset
                    var intersects = cubes.raycaster.intersectObject(cubes.plane);
                    cubes.offset.copy(intersects[0].point).sub(cubes.plane.position);

                } else {
                    
                    var intersects = cubes.raycaster.intersectObject(cubes.plane);
                    var pos = intersects[0].point;

                    var cube = cubes.drawCube(pos.x, pos.y, pos.z);
                    cubes.objects.push(cube);
                    cubes.scene.add(cube);
                    
                }
                break;
                
            case 1:
                break;
                
            case 2:
                // find intersected objects
                var intersects = cubes.raycaster.intersectObjects(cubes.objects);

                if (intersects.length > 0) {

                    // disable controls
                    cubes.controls.enabled = false;
                    
                    // set selection - first intersected object (closest)
                    cubes.selection = intersects[0].object;

                    // calculate offset
                    var intersects = cubes.raycaster.intersectObject(cubes.plane);
                    cubes.offset.copy(intersects[0].point).sub(cubes.plane.position);
                    
                    var pos = intersects[0].point;
                    cubes.prevMousePosition = {
                        x: pos.x,
                        y: pos.y,
                        z: pos.z
                    };
                }
                break;
                
        }
        
    },
    
    onDocumentMouseMove: function (event) {
        
        event.preventDefault();

        // get mouse position
        var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        // get 3D vector from 3D mouse position using 'unproject' function
        var vector = new THREE.Vector3(mouseX, mouseY, 1);
        vector.unproject(cubes.camera);

        // set raycaster position
        cubes.raycaster.set( cubes.camera.position, vector.sub( cubes.camera.position ).normalize() );
        
        switch (event.button) {
            case 0:
                if (cubes.selection) {

                    // check the position where the plane is intersected
                    var intersects = cubes.raycaster.intersectObject(cubes.plane);
                    // reposition the object based on the intersection point with the plane
                    cubes.selection.position.copy(intersects[0].point.sub(cubes.offset));

                } else {

                    // update position of the plane if need
                    var intersects = cubes.raycaster.intersectObjects(cubes.objects);

                    if (intersects.length > 0) {

                        cubes.plane.position.copy(intersects[0].object.position);
                        cubes.plane.lookAt(cubes.camera.position);

                    }
                }
                break;
                
            case 1:
                break;
                
            case 2:
                var intersects = cubes.raycaster.intersectObject(cubes.plane);
                var pos = intersects[0].point;
                
                var deltaMove = {
                    x: pos.x - cubes.prevMousePosition.x,
                    y: pos.y - cubes.prevMousePosition.y,
                    z: pos.z - cubes.prevMousePosition.z
                };
                
//                console.log(deltaMove);
                
                var deltaRotationquaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(cubes.toRadians(deltaMove.y * 1), cubes.toRadians(deltaMove.x * 1), 0, 'XYZ'));
                cubes.selection.quaternion.multiplyQuaternions(deltaRotationquaternion, cubes.selection.quaternion);
                
                cubes.prevMousePosition = {
                    x: pos.x,
                    y: pos.y,
                    z: pos.z
                };
                
                break;
        }
    },

    onDocumentMouseUp: function (event) {
        
        cubes.controls.enabled = true;
        cubes.selection = null;
        
    }
    
};

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

// Update controls and stats
function update() {
    cubes.controls.update(cubes.clock.getDelta());
    cubes.stats.update();
}

// Render the scene
function render() {
    if (cubes.renderer) {
        cubes.renderer.render(cubes.scene, cubes.camera);
    }
}

// Initialize lesson on page load
function initializeLesson() {
    cubes.init();
    animate();
}

if (window.addEventListener)
    window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
    window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
