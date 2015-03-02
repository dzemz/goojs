/* global requestAnimationFrame */
define([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/entities/EntitySelection',
	'lib/purl',
	'lib/RNG',
	'goo/shapes/Quad',
	'goo/renderer/Shader',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/scripts/Scripts',
	'goo/util/ObjectUtil',
	'goo/math/MathUtils'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	Sphere,
	Box,
	CameraComponent,
	OrbitCamControlScript,
	ScriptComponent,
	Vector3,
	PointLight,
	EntitySelection,
	purl,
	RNG,
	Quad,
	Shader,
	MeshDataComponent,
	MeshRendererComponent,
	Scripts,
	_,
	MathUtils
	) {
	'use strict';

	/**
	 * @class
	 * A collection of useful methods for visual tests
	 */
	var V = {};

	// determine if we're running the visual test for people or for machines
	V.deterministic = !!purl().param().deterministic;

	/**
	 * Converts either 3 parameters, an array, a {x, y, z} object or a Vector3 a Vector3
	 * @param obj
	 * @param def
	 * @returns {*}
	 */
	V.toVector3 = function (obj, def) {
		if (Array.isArray(obj)) {
			return new Vector3(obj);
		} else if (obj instanceof Vector3) {
			return obj;
		} else if (obj && (typeof obj.x === 'number') && (typeof obj.y === 'number') && (typeof obj.z === 'number')) {
			return new Vector3(obj.x, obj.y, obj.z);
		} else {
			return def;
		}
	};

	/**
	 * Adds an orbit camera in demo mode
	 * @param spherical
	 * @param lookAt
	 * @param dragButton
	 * @returns {Entity}
	 */
	V.addOrbitCamera = function (spherical, lookAt, dragButton) {
		spherical = V.toVector3(spherical, new Vector3(20, 0, 0));
		lookAt = V.toVector3(lookAt, new Vector3(0, 0, 0));

		// Convert to degrees since the script uses degrees
		spherical.y = MathUtils.degFromRad(spherical.y);
		spherical.z = MathUtils.degFromRad(spherical.z);

		var camera = new Camera();

		var orbitCamOptions = {
			domElement        : V.goo.renderer.domElement,
			lookAtDistance    : null,
			spherical         : spherical,
			lookAtPoint       : lookAt,
			releaseVelocity   : true,
			interpolationSpeed: 7,
			dragButton        : dragButton || 'Any'
		};

		if (!V.deterministic) {
			orbitCamOptions.demoMode = true;
			orbitCamOptions.moveInterval = 4000;
			orbitCamOptions.moveInitialDelay = 200;
		}

		var orbitScript = Scripts.create(OrbitCamControlScript, orbitCamOptions);
		var entity = V.goo.world.createEntity(camera, [20, 0, 0], orbitScript, 'CameraEntity').addToWorld();
		entity.setRotation(0, Math.PI/2, 0);
		return entity;
	};

	/**
	 * Creates a random bright color
	 * @returns {Array}
	 */
	V.getRandomColor = function () {
		var angle = V.rng.nextFloat() * Math.PI * 2;
		var color = [
			angle,
			angle + Math.PI * 2 / 3,
			angle + Math.PI * 4 / 3
		].map(function (v) {
			return Math.sin(v) / 2 + 0.5;
		});
		color.push(1);

		return color;
	}

	/**
	 * Returns a material from the supplied colors or a random brightly colored material
	 * @param r Red value
	 * @param g Green value
	 * @param b Blue value
	 * @param a Alpha value
	 * @returns {goo.renderer.Material}
	 */
	V.getColoredMaterial = function (r, g, b, a) {
		var material = new Material(ShaderLib.simpleLit);
		if (arguments.length === 0) {
			//material.materialState.diffuse = getRandomColor();
			material.uniforms.materialDiffuse = V.getRandomColor();
		} else {
			//material.materialState.diffuse = [r, g, b, a || 1];
			material.uniforms.materialDiffuse = [r, g, b, a || 1];
		}
		return material;
	};

	/**
	 * Adds a grid of shapes
	 * @param nShapes
	 * @param meshData
	 * @param rotation
	 */
		//! AT: more clear with code duplication
	V.addShapes = function (nShapes, meshData, rotation) {
		nShapes = nShapes || 15;
		meshData = meshData || new Sphere(32, 32);
		rotation = rotation || [0, 0, 0];

		var entities = [];

		var material = V.getColoredMaterial(1, 1, 1, 1);

		for (var i = 0; i < nShapes; i++) {
			for (var j = 0; j < nShapes; j++) {
				entities.push(
					V.goo.world.createEntity(
						meshData,
						material,
						[i - nShapes / 2, j - nShapes / 2, 0]
					).setRotation(rotation).addToWorld()
				);
			}
		}

		return new EntitySelection(entities);
	};

	/**
	 * Adds a grid of spheres
	 * @param [nSpheres=15]
	 */
	V.addSpheres = function (nSpheres) {
		return V.addShapes(nSpheres, new Sphere(32, 32));
	};

	/**
	 * Adds a grid of boxes to the scene
	 * @param [nBoxes=15]
	 */
	V.addBoxes = function (nBoxes) {
		return V.addShapes(nBoxes, new Box(0.9, 0.9, 0.9), [Math.PI / 2, Math.PI / 4, Math.PI / 8]);
	};

	/**
	 * Adds a grid of colored shapes
	 * @param [nShapes=15]
	 * @param [meshData=new Sphere]
	 * @param [rotation=(0, 0, 0)]
	 */
	V.addColoredShapes = function (nShapes, meshData, rotation) {
		nShapes = nShapes || 15;
		meshData = meshData || new Sphere(32, 32);
		rotation = rotation || [0, 0, 0];

		var entities = [];

		for (var i = 0; i < nShapes; i++) {
			for (var j = 0; j < nShapes; j++) {
				var material = new Material(ShaderLib.simpleColored, 'ShapeMaterial' + i + '_' + j);
				material.uniforms.color = [i / nShapes, j / nShapes, 0.3];

				entities.push(
					V.goo.world.createEntity(
						meshData,
						material,
						[i - nShapes / 2, j - nShapes / 2, 0]
					).setRotation(rotation).addToWorld()
				);
			}
		}

		return new EntitySelection(entities);
	};

	/**
	 * Adds a grid of colored spheres
	 * @param [nSpheres=15]
	 */
	V.addColoredSpheres = function (nSpheres) {
		return V.addColoredShapes(nSpheres, new Sphere(32, 32));
	};

	/**
	 * Adds a grid of colored boxes to the scene
	 * @param [nBoxes=15]
	 */
	V.addColoredBoxes = function (nBoxes) {
		return V.addColoredShapes(nBoxes, new Box(0.9, 0.9, 0.9), [Math.PI / 2, Math.PI / 4, Math.PI / 8]);
	};

	/**
	 * Adds standard lighting to the scene
	 */
	V.addLights = function () {
		var world = V.goo.world;
		world.createEntity(new PointLight(), [ 100, 100, 100]).addToWorld();
		world.createEntity(new PointLight(), [-100, -100, -100]).addToWorld();
		world.createEntity(new PointLight(), [-100, 100, -100]).addToWorld();
	};

	/**
	 * Displays the normals of an object
	 * @param entity
	 * @returns {Entity}
	 */
	V.showNormals = function (entity) {
		var normalsMeshData = entity.meshDataComponent.meshData.getNormalsMeshData();
		var normalsMaterial = new Material(ShaderLib.simpleColored, '');
		normalsMaterial.uniforms.color = [0.2, 1.0, 0.6];
		var normalsEntity = V.goo.world.createEntity(normalsMeshData, normalsMaterial);
		normalsEntity.transformComponent.transform = entity.transformComponent.transform;
		normalsEntity.addToWorld();
		return normalsEntity;
	};

	/**
	 * Initializes Goo
	 * @param _options
	 * @returns {GooRunner}
	 */
	V.initGoo = function (_options) {
		var options = {
			showStats: true && false,
			logo: {
				position: 'bottomright',
				color: '#FFF'
			}
		};

		if (V.deterministic) {
			options.showStats = false;
			options.logo = false;
			options.manuallyStartGameLoop = true;
			options.preserveDrawingBuffer = true;
		}
		_.extend(options, _options);

		V.goo = new GooRunner(options);
		V.goo.renderer.domElement.id = 'goo';
		if (V.deterministic) {
			V.goo.renderer.domElement.style.width = '100px';
			V.goo.renderer.domElement.style.height = '100px';
		}
		document.body.appendChild(V.goo.renderer.domElement);

		// V.goo.renderer.setClearColor(154 / 255, 172 / 255, 192 / 255, 1.0); // bright blue-grey
		V.goo.renderer.setClearColor(103 / 255, 115 / 255, 129 / 255, 1.0); // dark blue-grey

		// let's get a RNG
		V.rng = new RNG(12348);

		return V.goo;
	};

	function delay(nFrames, updateCallback, endCallback) {
		var framesRemaining = nFrames;

		function loop() {
			framesRemaining--;
			if (framesRemaining > 0) {
				updateCallback();
				requestAnimationFrame(loop);
			} else {
				if (endCallback) {
					endCallback();
				}
			}
		}

		loop();
	}

	/**
	 * Required in 'deterministic' mode
	 */
	V.process = function (renderLoops) {
		if (!V.deterministic) { return; }

		// waste some frames
		delay(8, function () {}, function () {
			var time = 0;
			// render some frames
			delay(renderLoops || 3, function () {
				time += 100;
				V.goo._updateFrame(time);
				V.goo.stopGameLoop();
			});
		});
	};

    /**
     * Adds a debug quad for the picking buffer
     * @returns {Entity}
     */
	V.addDebugQuad = function () {
		var world = V.goo.world;
		var entity = world.createEntity('Quad');
		entity.transformComponent.transform.translation.set(0, 0, 0);

		var quad = new Quad(2, 2);
		var meshDataComponent = new MeshDataComponent(quad);
		entity.setComponent(meshDataComponent);

		var fsShader = {
			attributes: {
				vertexPosition: 'POSITION'
			},
			uniforms: {
				diffuseMap: 'DIFFUSE_MAP'
			},
			vshader: [ //
				'attribute vec3 vertexPosition;', //

				'const vec2 madd = vec2(0.5,0.5);',
				'varying vec2 textureCoord;',

				'void main(void) {', //
				'	textureCoord = vertexPosition.xy * madd + madd;', // scale vertex attribute to [0-1] range
				'	gl_Position = vec4(vertexPosition.xy * vec2(0.3, 0.3) - vec2(0.5, 0.5), 0.0, 1.0);',
				'}' //
			].join('\n'),
			fshader: [ //
				'precision mediump float;', //

				'uniform sampler2D diffuseMap;', //

				'varying vec2 textureCoord;',

				'void main(void)', //
				'{', //
				'	gl_FragColor = texture2D(diffuseMap,textureCoord);', //
				'}' //
			].join('\n')
		};

		var meshRendererComponent = new MeshRendererComponent();
		meshRendererComponent.cullMode = 'Never';
		var material = new Material(fsShader, 'fsshader');
		meshRendererComponent.materials.push(material);
		entity.setComponent(meshRendererComponent);

		V.goo.callbacks.push(function (/*tpf*/) {
			if (V.goo.renderer.hardwarePicking && V.goo.renderer.hardwarePicking.pickingTarget) {
				material.setTexture(Shader.DIFFUSE_MAP, V.goo.renderer.hardwarePicking.pickingTarget);
			}
		});
		return entity.addToWorld();
	};

    /**
     * Creates the panel that holds a project's description
     * @param text
     */
	function createPanel(text) {
		text = text.replace(/\n/g, '<br>');

        //! AT: ugly combination of js and inline style setting
		var div = document.createElement('div');
        div.id = 'vt-panel';
		div.innerHTML =
			'<div style="font-size: x-small;font-family: sans-serif; margin: 4px;">This visual test:</div>' +
			'<div style="font-size: small; font-family: sans-serif; margin: 4px; padding: 4px; border: 1px solid #AAA; background-color: white; max-width: 400px;">' + text + '</span>';
		div.style.position = 'absolute';
		div.style.zIndex = '2001';
		div.style.backgroundColor = '#DDDDDD';
		div.style.left = '10px';
		div.style.bottom = '10px';

		div.style.webkitTouchCallout = 'none';
		div.style.webkitUserSelect = 'none';
		div.style.khtmlUserSelect = 'none';
		div.style.mozUserSelect = 'none';
		div.style.msUserSelect = 'none';
		div.style.userSelect = 'none';

		div.style.padding = '3px';
		div.style.borderRadius = '6px';

		document.body.appendChild(div);
	}

    /**
     * Adds a description panel to the visual test. Also outputs the description to the web console.
     * @param text
     */
	V.describe = function (text) {
		if (!V.deterministic) {
			createPanel(text);
		}

		console.log(text);
	};

    /**
     * Adds a button to the description panel
     * @param text
     * @param onClick
     */
    V.button = function (text, onClick) {
        if (V.deterministic) { return; }

        var panel = document.getElementById('vt-panel');
        if (!panel) {
            console.error('First create a panel with V.describe()');
            return;
        }

        var button = document.createElement('button');
        button.innerText = text;
        button.addEventListener('click', onClick);

        panel.appendChild(button);
    };

	return V;
});