
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/042threeWebgllightsHemisphere
        // --lights_hemisphere--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lights_hemisphere
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 30,
                near: 1, 
                far: 5000,
                position: [ 0, 0, 250 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        const mixers = [];
        
        
        init();
        
        function init() {
        
            scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
            scene.fog = new THREE.Fog( scene.background, 1, 5000 );
        
            // LIGHTS
        
            const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
            hemiLight.color.setHSL( 0.6, 1, 0.6 );
            hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
            hemiLight.position.set( 0, 50, 0 );
            scene.add( hemiLight );
        
            const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
            scene.add( hemiLightHelper );
        
            //
        
            const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
            dirLight.color.setHSL( 0.1, 1, 0.95 );
            dirLight.position.set( - 1, 1.75, 1 );
            dirLight.position.multiplyScalar( 30 );
            scene.add( dirLight );
        
            dirLight.castShadow = true;
        
            dirLight.shadow.mapSize.width = 2048;
            dirLight.shadow.mapSize.height = 2048;
        
            const d = 50;
        
            dirLight.shadow.camera.left = - d;
            dirLight.shadow.camera.right = d;
            dirLight.shadow.camera.top = d;
            dirLight.shadow.camera.bottom = - d;
        
            dirLight.shadow.camera.far = 3500;
            dirLight.shadow.bias = - 0.0001;
        
            const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
            scene.add( dirLightHelper );
        
            // GROUND
        
            const groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
            const groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff } );
            groundMat.color.setHSL( 0.095, 1, 0.75 );
        
            const ground = new THREE.Mesh( groundGeo, groundMat );
            ground.position.y = - 33;
            ground.rotation.x = - Math.PI / 2;
            ground.receiveShadow = true;
            scene.add( ground );
        
            // SKYDOME
        
            const vertexShader = /* glsl*/`
                varying vec3 vWorldPosition;
        
                void main() {
        
                    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                    vWorldPosition = worldPosition.xyz;
        
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
                }
        `;
            const fragmentShader = /* glsl*/`
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
        
                varying vec3 vWorldPosition;
        
                void main() {
        
                    float h = normalize( vWorldPosition + offset ).y;
                    gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
        
                }
            `;
            const uniforms = {
                'topColor': { value: new THREE.Color( 0x0077ff ) },
                'bottomColor': { value: new THREE.Color( 0xffffff ) },
                'offset': { value: 33 },
                'exponent': { value: 0.6 }
            };
            uniforms[ 'topColor' ].value.copy( hemiLight.color );
        
            scene.fog.color.copy( uniforms[ 'bottomColor' ].value );
        
            const skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
            const skyMat = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                side: THREE.BackSide
            } );
        
            const sky = new THREE.Mesh( skyGeo, skyMat );
            scene.add( sky );
        
            // MODEL
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
        
            vjmap3d.ResManager.loadRes( assetsPath + 'models/gltf/Flamingo.glb', false).then( ( gltf )=> {
        
                const mesh = gltf.scene.children[ 0 ];
        
                const s = 0.35;
                mesh.scale.set( s, s, s );
                mesh.position.y = 15;
                mesh.rotation.y = - 1;
        
                mesh.castShadow = true;
                mesh.receiveShadow = true;
        
                scene.add( mesh );
        
                const mixer = new THREE.AnimationMixer( mesh );
                mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
                mixers.push( mixer );
        
            } );
        
            
            renderer.shadowMap.enabled = true;
        
        
            const params = {
                toggleHemisphereLight: function () {
        
                    hemiLight.visible = ! hemiLight.visible;
                    hemiLightHelper.visible = ! hemiLightHelper.visible;
        
                },
                toggleDirectionalLight: function () {
        
                    dirLight.visible = ! dirLight.visible;
                    dirLightHelper.visible = ! dirLightHelper.visible;
        
                }
            };
        
            const gui = new GUI();
        
            gui.add( params, 'toggleHemisphereLight' ).name( 'toggle hemisphere light' );
            gui.add( params, 'toggleDirectionalLight' ).name( 'toggle directional light' );
            gui.open();
        
            app.signal.onAppUpdate.add(e => render(e))
        
        }
        
        
        function render(e) {
        
            const delta = e.deltaTime;
        
            for ( let i = 0; i < mixers.length; i ++ ) {
        
                mixers[ i ].update( delta );
        
            }
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};