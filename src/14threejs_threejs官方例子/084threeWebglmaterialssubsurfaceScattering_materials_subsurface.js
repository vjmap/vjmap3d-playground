
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/084threeWebglmaterialssubsurfaceScattering
        // --materials_subsurface_scattering--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_subsurface_scattering
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                alpha: true,
                clearColorAlpha: 0,
            },
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 5000,
                position: [ 0.0, 300, 400 * 4]
            },
            control: {
                minDistance: 500,
                maxDistance: 3000
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let model;
        
        init();
        
        function init() {
        
            // Lights
        
            scene.add( new THREE.AmbientLight( 0xc1c1c1 ) );
        
            const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.03 );
            directionalLight.position.set( 0.0, 0.5, 0.5 ).normalize();
            scene.add( directionalLight );
        
            const pointLight1 = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xc1c1c1 } ) );
            pointLight1.add( new THREE.PointLight( 0xc1c1c1, 4.0, 300, 0 ) );
            scene.add( pointLight1 );
            pointLight1.position.x = 0;
            pointLight1.position.y = - 50;
            pointLight1.position.z = 350;
        
            const pointLight2 = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xc1c100 } ) );
            pointLight2.add( new THREE.PointLight( 0xc1c100, 0.75, 500, 0 ) );
            scene.add( pointLight2 );
            pointLight2.position.x = - 100;
            pointLight2.position.y = 20;
            pointLight2.position.z = - 260;
        
            initMaterial();
        
        }
        
        function initMaterial() {
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const loader = new THREE.TextureLoader();
            const imgTexture = loader.load(assetsPath +  'models/fbx/white.jpg' );
            imgTexture.colorSpace = THREE.SRGBColorSpace;
        
            const thicknessTexture = loader.load(assetsPath +  'models/fbx/bunny_thickness.jpg' );
            imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
        
            const shader = SubsurfaceScatteringShader;
            const uniforms = THREE.UniformsUtils.clone( shader.uniforms );
        
            uniforms[ 'map' ].value = imgTexture;
        
            uniforms[ 'diffuse' ].value = new THREE.Vector3( 1.0, 0.2, 0.2 );
            uniforms[ 'shininess' ].value = 500;
        
            uniforms[ 'thicknessMap' ].value = thicknessTexture;
            uniforms[ 'thicknessColor' ].value = new THREE.Vector3( 0.5, 0.3, 0.0 );
            uniforms[ 'thicknessDistortion' ].value = 0.1;
            uniforms[ 'thicknessAmbient' ].value = 0.4;
            uniforms[ 'thicknessAttenuation' ].value = 0.8;
            uniforms[ 'thicknessPower' ].value = 2.0;
            uniforms[ 'thicknessScale' ].value = 16.0;
        
            const material = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader,
                lights: true
            } );
        
            // LOADER
        
            const loaderFBX = vjmap3d.LoadManager.fbxLoader;
            loaderFBX.load(assetsPath +  'models/fbx/stanford-bunny.fbx', function ( object ) {
        
                model = object.children[ 0 ];
                model.position.set( 0, 0, 10 );
                model.scale.setScalar( 1 );
                model.material = material;
                scene.add( model );
        
                vjmap3d.Entity.attchObject(model).addAction(() => {
                    if ( model ) model.rotation.y = performance.now() / 5000;
                })
            } );
        
            initGUI( uniforms );
        
           
        }
        
        function initGUI( uniforms ) {
        
            const gui = new GUI( { title: 'Thickness Control' } );
        
            const ThicknessControls = function () {
        
                this.distortion = uniforms[ 'thicknessDistortion' ].value;
                this.ambient = uniforms[ 'thicknessAmbient' ].value;
                this.attenuation = uniforms[ 'thicknessAttenuation' ].value;
                this.power = uniforms[ 'thicknessPower' ].value;
                this.scale = uniforms[ 'thicknessScale' ].value;
        
            };
        
            const thicknessControls = new ThicknessControls();
        
            gui.add( thicknessControls, 'distortion' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( function () {
        
                uniforms[ 'thicknessDistortion' ].value = thicknessControls.distortion;
                console.log( 'distortion' );
        
            } );
        
            gui.add( thicknessControls, 'ambient' ).min( 0.01 ).max( 5.0 ).step( 0.05 ).onChange( function () {
        
                uniforms[ 'thicknessAmbient' ].value = thicknessControls.ambient;
        
            } );
        
            gui.add( thicknessControls, 'attenuation' ).min( 0.01 ).max( 5.0 ).step( 0.05 ).onChange( function () {
        
                uniforms[ 'thicknessAttenuation' ].value = thicknessControls.attenuation;
        
            } );
        
            gui.add( thicknessControls, 'power' ).min( 0.01 ).max( 16.0 ).step( 0.1 ).onChange( function () {
        
                uniforms[ 'thicknessPower' ].value = thicknessControls.power;
        
            } );
        
            gui.add( thicknessControls, 'scale' ).min( 0.01 ).max( 50.0 ).step( 0.1 ).onChange( function () {
        
                uniforms[ 'thicknessScale' ].value = thicknessControls.scale;
        
            } );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};