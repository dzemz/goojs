
		import World from 'src/goo/entities/World';
		import Material from 'src/goo/renderer/Material';
		import Shader from 'src/goo/renderer/Shader';
		import Texture from 'src/goo/renderer/Texture';
		import ShaderLib from 'src/goo/renderer/shaders/ShaderLib';
		import DynamicLoader from 'src/goo/loaders/DynamicLoader';
		import Configs from 'test/unit/loaders/Configs';
	describe('MaterialHandler', function () {

		require('src/goo/loaders/handlers/MaterialHandler');

		var loader;

		beforeEach(function () {
			var world = new World();
			loader = new DynamicLoader({
				world: world,
				rootPath: typeof(window) !== 'undefined' && window.__karma__ ? './' : 'loaders/res'
			});
		});

		it('loads a material with a shader', function (done) {
			var config = Configs.material();
			loader.preload(Configs.get());
			loader.load(config.id).then(function (material) {
				expect(material).toEqual(jasmine.any(Material));
				expect(material.shader).toEqual(jasmine.any(Shader));
				done();
			});
		});

		it('loads a material with a shader and a texture', function (done) {
			var config = Configs.material();
			config.texturesMapping.DIFFUSE_MAP = {
				enabled: true,
				textureRef: Configs.texture().id
			};
			loader.preload(Configs.get());
			loader.load(config.id).then(function (material) {
				var texture = material.getTexture('DIFFUSE_MAP');
				expect(material.shader).toEqual(jasmine.any(Shader));
				expect(texture).toEqual(jasmine.any(Texture));
				expect(texture.image).toEqual(jasmine.any(Image));
				done();
			});
		});

		it('loads a material with an engine shader', function (done) {
			var config = Configs.material();
			config.shaderRef = 'GOO_ENGINE_SHADERS/uber';
			loader.preload(Configs.get());
			loader.load(config.id).then(function (material) {
				expect(material.shader.shaderDefinition).toBe(ShaderLib.uber);
				done();
			});
		});
	});
