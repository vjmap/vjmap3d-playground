
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/045threeWebgllightspotlight
        // --lights_spotlight--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lights_spotlight
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 0.1, 
                far: 100,
                position: [7, 4, 1  ]
            },
            control: {
                minDistance: 2,
                maxDistance: 10,
                maxPolarAngle:  Math.PI / 2,
                target: [0, 1, 0 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let spotLight, lightHelper;
        
        init();
        
        function init() {
            
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1;
        
        
            const ambient = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 0.15 );
            scene.add( ambient );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const loader = new THREE.TextureLoader().setPath( assetsPath + 'textures/' );
            const filenames = [ 'disturb.jpg', 'colors.png', 'uv_grid_opengl.jpg' ];
        
            const textures = { none: null };
        
            for ( let i = 0; i < filenames.length; i ++ ) {
        
                const filename = filenames[ i ];
        
                const texture = loader.load( filename );
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.colorSpace = THREE.SRGBColorSpace;
        
                textures[ filename ] = texture;
        
            }
        
            spotLight = new THREE.SpotLight( 0xffffff, 100 );
            spotLight.position.set( 2.5, 5, 2.5 );
            spotLight.angle = Math.PI / 6;
            spotLight.penumbra = 1;
            spotLight.decay = 2;
            spotLight.distance = 0;
            spotLight.map = textures[ 'disturb.jpg' ];
        
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            spotLight.shadow.camera.near = 1;
            spotLight.shadow.camera.far = 10;
            spotLight.shadow.focus = 1;
            scene.add( spotLight );
        
            lightHelper = new THREE.SpotLightHelper( spotLight );
            scene.add( lightHelper );
        
            //
        
            const geometry = new THREE.PlaneGeometry( 200, 200 );
            const material = new THREE.MeshLambertMaterial( { color: 0xbcbcbc } );
        
            const mesh = new THREE.Mesh( geometry, material );
            mesh.position.set( 0, - 1, 0 );
            mesh.rotation.x = - Math.PI / 2;
            mesh.receiveShadow = true;
            scene.add( mesh );
        
            //
            new PLYLoader().load(assetsPath + 'models/ply/binary/Lucy100k.ply', function ( geometry ) {
        
                geometry.scale( 0.0024, 0.0024, 0.0024 );
                geometry.computeVertexNormals();
        
                const material = new THREE.MeshLambertMaterial();
        
                const mesh = new THREE.Mesh( geometry, material );
                mesh.rotation.y = - Math.PI / 2;
                mesh.position.y = 0.8;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                scene.add( mesh );
        
            } );
        
           
            // GUI
        
            const gui = new GUI();
        
            const params = {
                map: textures[ 'disturb.jpg' ],
                color: spotLight.color.getHex(),
                intensity: spotLight.intensity,
                distance: spotLight.distance,
                angle: spotLight.angle,
                penumbra: spotLight.penumbra,
                decay: spotLight.decay,
                focus: spotLight.shadow.focus,
                shadows: true
            };
        
            gui.add( params, 'map', textures ).onChange( function ( val ) {
        
                spotLight.map = val;
        
            } );
        
            gui.addColor( params, 'color' ).onChange( function ( val ) {
        
                spotLight.color.setHex( val );
        
            } );
        
            gui.add( params, 'intensity', 0, 500 ).onChange( function ( val ) {
        
                spotLight.intensity = val;
        
            } );
        
        
            gui.add( params, 'distance', 0, 20 ).onChange( function ( val ) {
        
                spotLight.distance = val;
        
            } );
        
            gui.add( params, 'angle', 0, Math.PI / 3 ).onChange( function ( val ) {
        
                spotLight.angle = val;
        
            } );
        
            gui.add( params, 'penumbra', 0, 1 ).onChange( function ( val ) {
        
                spotLight.penumbra = val;
        
            } );
        
            gui.add( params, 'decay', 1, 2 ).onChange( function ( val ) {
        
                spotLight.decay = val;
        
            } );
        
            gui.add( params, 'focus', 0, 1 ).onChange( function ( val ) {
        
                spotLight.shadow.focus = val;
        
            } );
        
        
            gui.add( params, 'shadows' ).onChange( function ( val ) {
        
                renderer.shadowMap.enabled = val;
        
                scene.traverse( function ( child ) {
        
                    if ( child.material ) {
        
                        child.material.needsUpdate = true;
        
                    }
        
                } );
        
            } );
        
            gui.open();
        
            app.on("onAppUpdate", animate)
        
        }
        
        
        function animate() {
        
            const time = performance.now() / 3000;
        
            spotLight.position.x = Math.cos( time ) * 2.5;
            spotLight.position.z = Math.sin( time ) * 2.5;
        
            lightHelper.update();
        
        
        }
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};