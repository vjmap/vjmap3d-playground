
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/060threeWebglmarchingcubes
        // --marchingcubes--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_marchingcubes
        
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x050505,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1, 
                far: 10000,
                position: [  - 500, 500, 1500 ]
            },
            control: {
                minDistance: 500,
                maxDistance: 5000
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let materials, current_material;
        
        let light, pointLight, ambientLight;
        
        let effect, resolution;
        
        let effectController;
        
        let time = 0;
        
        const clock = new THREE.Clock();
        
        init();
        
        function init() {
        
            // LIGHTS
        
            light = new THREE.DirectionalLight( 0xffffff, 3 );
            light.position.set( 0.5, 0.5, 1 );
            scene.add( light );
        
            pointLight = new THREE.PointLight( 0xff7c00, 3, 0, 0 );
            pointLight.position.set( 0, 0, 100 );
            scene.add( pointLight );
        
            ambientLight = new THREE.AmbientLight( 0x323232, 3 );
            scene.add( ambientLight );
        
            // MATERIALS
        
            materials = generateMaterials();
            current_material = 'shiny';
        
            // MARCHING CUBES
        
            resolution = 28;
        
            effect = new MarchingCubes( resolution, materials[ current_material ], true, true, 100000 );
            effect.position.set( 0, 0, 0 );
            effect.scale.set( 700, 700, 700 );
        
            effect.enableUvs = false;
            effect.enableColors = false;
        
            scene.add( effect );
        
           
            // GUI
        
            setupGui();
        
            app.signal.onAppUpdate.add(e => render(e))
        
        }
        
        function generateMaterials() {
        
            // environment map
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const path = assetsPath + 'textures/cube/SwedishRoyalCastle/';
            const format = '.jpg';
            const urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ];
        
            const cubeTextureLoader = new THREE.CubeTextureLoader();
        
            const reflectionCube = cubeTextureLoader.load( urls );
            const refractionCube = cubeTextureLoader.load( urls );
            refractionCube.mapping = THREE.CubeRefractionMapping;
        
            // toons
        
            const toonMaterial1 = createShaderMaterial( ToonShader1, light, ambientLight );
            const toonMaterial2 = createShaderMaterial( ToonShader2, light, ambientLight );
            const hatchingMaterial = createShaderMaterial( ToonShaderHatching, light, ambientLight );
            const dottedMaterial = createShaderMaterial( ToonShaderDotted, light, ambientLight );
        
            const texture = new THREE.TextureLoader().load(assetsPath + 'textures/uv_grid_opengl.jpg' );
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.colorSpace = THREE.SRGBColorSpace;
        
            const materials = {
                'shiny': new THREE.MeshStandardMaterial( { color: 0x9c0000, envMap: reflectionCube, roughness: 0.1, metalness: 1.0 } ),
                'chrome': new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } ),
                'liquid': new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: refractionCube, refractionRatio: 0.85 } ),
                'matte': new THREE.MeshPhongMaterial( { specular: 0x494949, shininess: 1 } ),
                'flat': new THREE.MeshLambertMaterial( { /*TODO flatShading: true */ } ),
                'textured': new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 1, map: texture } ),
                'colors': new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 2, vertexColors: true } ),
                'multiColors': new THREE.MeshPhongMaterial( { shininess: 2, vertexColors: true } ),
                'plastic': new THREE.MeshPhongMaterial( { specular: 0xc1c1c1, shininess: 250 } ),
                'toon1': toonMaterial1,
                'toon2': toonMaterial2,
                'hatching': hatchingMaterial,
                'dotted': dottedMaterial
            };
        
            return materials;
        
        }
        
        function createShaderMaterial( shader, light, ambientLight ) {
        
            const u = THREE.UniformsUtils.clone( shader.uniforms );
        
            const vs = shader.vertexShader;
            const fs = shader.fragmentShader;
        
            const material = new THREE.ShaderMaterial( { uniforms: u, vertexShader: vs, fragmentShader: fs } );
        
            material.uniforms[ 'uDirLightPos' ].value = light.position;
            material.uniforms[ 'uDirLightColor' ].value = light.color;
        
            material.uniforms[ 'uAmbientLightColor' ].value = ambientLight.color;
        
            return material;
        
        }
        
        //
        
        function setupGui() {
        
            const createHandler = function ( id ) {
        
                return function () {
        
                    current_material = id;
        
                    effect.material = materials[ id ];
                    effect.enableUvs = ( current_material === 'textured' ) ? true : false;
                    effect.enableColors = ( current_material === 'colors' || current_material === 'multiColors' ) ? true : false;
        
                };
        
            };
        
            effectController = {
        
                material: 'shiny',
        
                speed: 1.0,
                numBlobs: 10,
                resolution: 28,
                isolation: 80,
        
                floor: true,
                wallx: false,
                wallz: false,
        
                dummy: function () {}
        
            };
        
            let h;
        
            const gui = new GUI();
        
            // material (type)
        
            h = gui.addFolder( 'Materials' );
        
            for ( const m in materials ) {
        
                effectController[ m ] = createHandler( m );
                h.add( effectController, m ).name( m );
        
            }
        
            // simulation
        
            h = gui.addFolder( 'Simulation' );
        
            h.add( effectController, 'speed', 0.1, 8.0, 0.05 );
            h.add( effectController, 'numBlobs', 1, 50, 1 );
            h.add( effectController, 'resolution', 14, 100, 1 );
            h.add( effectController, 'isolation', 10, 300, 1 );
        
            h.add( effectController, 'floor' );
            h.add( effectController, 'wallx' );
            h.add( effectController, 'wallz' );
        
        }
        
        // this controls content of marching cubes voxel field
        
        function updateCubes( object, time, numblobs, floor, wallx, wallz ) {
        
            object.reset();
        
            // fill the field with some metaballs
        
            const rainbow = [
                new THREE.Color( 0xff0000 ),
                new THREE.Color( 0xffbb00 ),
                new THREE.Color( 0xffff00 ),
                new THREE.Color( 0x00ff00 ),
                new THREE.Color( 0x0000ff ),
                new THREE.Color( 0x9400bd ),
                new THREE.Color( 0xc800eb )
            ];
            const subtract = 12;
            const strength = 1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );
        
            for ( let i = 0; i < numblobs; i ++ ) {
        
                const ballx = Math.sin( i + 1.26 * time * ( 1.03 + 0.5 * Math.cos( 0.21 * i ) ) ) * 0.27 + 0.5;
                const bally = Math.abs( Math.cos( i + 1.12 * time * Math.cos( 1.22 + 0.1424 * i ) ) ) * 0.77; // dip into the floor
                const ballz = Math.cos( i + 1.32 * time * 0.1 * Math.sin( ( 0.92 + 0.53 * i ) ) ) * 0.27 + 0.5;
        
                if ( current_material === 'multiColors' ) {
        
                    object.addBall( ballx, bally, ballz, strength, subtract, rainbow[ i % 7 ] );
        
                } else {
        
                    object.addBall( ballx, bally, ballz, strength, subtract );
        
                }
        
            }
        
            if ( floor ) object.addPlaneY( 2, 12 );
            if ( wallz ) object.addPlaneZ( 2, 12 );
            if ( wallx ) object.addPlaneX( 2, 12 );
        
            object.update();
        
        }
        
        
        function render(e) {
        
            const delta = e.deltaTime;
        
            time += delta * effectController.speed * 0.5;
        
            // marching cubes
        
            if ( effectController.resolution !== resolution ) {
        
                resolution = effectController.resolution;
                effect.init( Math.floor( resolution ) );
        
            }
        
            if ( effectController.isolation !== effect.isolation ) {
        
                effect.isolation = effectController.isolation;
        
            }
        
            updateCubes( effect, time, effectController.numBlobs, effectController.floor, effectController.wallx, effectController.wallz );
        
           
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};