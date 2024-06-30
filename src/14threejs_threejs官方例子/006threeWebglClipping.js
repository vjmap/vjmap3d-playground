
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/006threeWebglClipping
        // --clipping--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_clipping
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 36,
                near: 0.25,
                far: 16,
                position: [ 0, 1.3, 3 ]
            },
            control: {
                target: [ 0, 1, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        renderer.shadowMap.enabled = true;
        
        let startTime, object;
        
        init();
        app.signal.onAppUpdate.add(e => animate(e))
        
        function init() {
            // Lights
        
            scene.add( new THREE.AmbientLight( 0xcccccc ) );
        
            const spotLight = new THREE.SpotLight( 0xffffff, 60 );
            spotLight.angle = Math.PI / 5;
            spotLight.penumbra = 0.2;
            spotLight.position.set( 2, 3, 3 );
            spotLight.castShadow = true;
            spotLight.shadow.camera.near = 3;
            spotLight.shadow.camera.far = 10;
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            scene.add( spotLight );
        
            const dirLight = new THREE.DirectionalLight( 0x55505a, 3 );
            dirLight.position.set( 0, 3, 0 );
            dirLight.castShadow = true;
            dirLight.shadow.camera.near = 1;
            dirLight.shadow.camera.far = 10;
        
            dirLight.shadow.camera.right = 1;
            dirLight.shadow.camera.left = - 1;
            dirLight.shadow.camera.top	= 1;
            dirLight.shadow.camera.bottom = - 1;
        
            dirLight.shadow.mapSize.width = 1024;
            dirLight.shadow.mapSize.height = 1024;
            scene.add( dirLight );
        
            // ***** Clipping planes: *****
        
            const localPlane = new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 0.8 );
            const globalPlane = new THREE.Plane( new THREE.Vector3( - 1, 0, 0 ), 0.1 );
        
            // Geometry
        
            const material = new THREE.MeshPhongMaterial( {
                color: 0x80ee10,
                shininess: 100,
                side: THREE.DoubleSide,
        
                // ***** Clipping setup (material): *****
                clippingPlanes: [ localPlane ],
                clipShadows: true,
        
                alphaToCoverage: true,
        
            } );
        
            const geometry = new THREE.TorusKnotGeometry( 0.4, 0.08, 95, 20 );
        
            object = new THREE.Mesh( geometry, material );
            object.castShadow = true;
            scene.add( object );
        
            const ground = new THREE.Mesh(
                new THREE.PlaneGeometry( 9, 9, 1, 1 ),
                new THREE.MeshPhongMaterial( { color: 0xa0adaf, shininess: 150 } )
            );
        
            ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
            ground.receiveShadow = true;
            scene.add( ground );
        
        
            // ***** Clipping setup (renderer): *****
            const globalPlanes = [ globalPlane ],
                Empty = Object.freeze( [] );
            renderer.clippingPlanes = Empty; // GUI sets it to globalPlanes
            renderer.localClippingEnabled = true;
        
         
            // GUI
        
            const gui = new GUI(),
                props = {
                    alphaToCoverage: true,
                },
                folderLocal = gui.addFolder( 'Local Clipping' ),
                propsLocal = {
        
                    get 'Enabled'() {
        
                        return renderer.localClippingEnabled;
        
                    },
                    set 'Enabled'( v ) {
        
                        renderer.localClippingEnabled = v;
        
                    },
        
                    get 'Shadows'() {
        
                        return material.clipShadows;
        
                    },
                    set 'Shadows'( v ) {
        
                        material.clipShadows = v;
        
                    },
        
                    get 'Plane'() {
        
                        return localPlane.constant;
        
                    },
                    set 'Plane'( v ) {
        
                        localPlane.constant = v;
        
                    }
        
                },
                folderGlobal = gui.addFolder( 'Global Clipping' ),
                propsGlobal = {
        
                    get 'Enabled'() {
        
                        return renderer.clippingPlanes !== Empty;
        
                    },
                    set 'Enabled'( v ) {
        
                        renderer.clippingPlanes = v ? globalPlanes : Empty;
        
                    },
        
                    get 'Plane'() {
        
                        return globalPlane.constant;
        
                    },
                    set 'Plane'( v ) {
        
                        globalPlane.constant = v;
        
                    }
        
                };
        
            gui.add( props, 'alphaToCoverage' ).onChange( function ( value ) {
        
                ground.material.alphaToCoverage = value;
                ground.material.needsUpdate = true;
        
                material.alphaToCoverage = value;
                material.needsUpdate = true;
        
            } );
            folderLocal.add( propsLocal, 'Enabled' );
            folderLocal.add( propsLocal, 'Shadows' );
            folderLocal.add( propsLocal, 'Plane', 0.3, 1.25 );
        
            folderGlobal.add( propsGlobal, 'Enabled' );
            folderGlobal.add( propsGlobal, 'Plane', - 0.4, 3 );
        
            // Start
        
            startTime = Date.now();
        
        }
        
        
        
        function animate() {
        
            const currentTime = Date.now();
            const time = ( currentTime - startTime ) / 1000;
        
            object.position.y = 0.8;
            object.rotation.x = time * 0.5;
            object.rotation.y = time * 0.2;
            object.scale.setScalar( Math.cos( time ) * 0.125 + 0.875 );
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};