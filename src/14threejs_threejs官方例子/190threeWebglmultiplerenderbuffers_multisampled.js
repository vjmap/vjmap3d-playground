
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/190threeWebglmultiplerenderbuffers
        // --multisampled_renderbuffers--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_multisampled_renderbuffers
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false
            },
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 10,
                far: 2000,
                position: [0, 0, 500 ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let group, container;
        
        let composer1, composer2;
        
        const params = {
        
            animate: true,
        
        };
        
        init();
        
        function init() {
        
            scene.background = new THREE.Color( 0xffffff );
            scene.fog = new THREE.Fog( 0xcccccc, 100, 1500 );
        
            //
        
            const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x222222, 5 );
            hemiLight.position.set( 1, 1, 1 );
            scene.add( hemiLight );
        
            //
        
            group = new THREE.Group();
        
            const geometry = new THREE.SphereGeometry( 10, 64, 40 );
            const material = new THREE.MeshLambertMaterial( {
                color: 0xee0808,
                polygonOffset: true,
                polygonOffsetFactor: 1, // positive value pushes polygon further away
                polygonOffsetUnits: 1
        
            } );
            const material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } );
        
            for ( let i = 0; i < 50; i ++ ) {
        
                const mesh = new THREE.Mesh( geometry, material );
                mesh.position.x = Math.random() * 600 - 300;
                mesh.position.y = Math.random() * 600 - 300;
                mesh.position.z = Math.random() * 600 - 300;
                mesh.rotation.x = Math.random();
                mesh.rotation.z = Math.random();
                mesh.scale.setScalar( Math.random() * 5 + 5 );
                group.add( mesh );
        
                const mesh2 = new THREE.Mesh( geometry, material2 );
                mesh2.position.copy( mesh.position );
                mesh2.rotation.copy( mesh.rotation );
                mesh2.scale.copy( mesh.scale );
                group.add( mesh2 );
        
            }
        
            scene.add( group );
        
          
            renderer.autoClear = false;
            //
        
            const size = renderer.getDrawingBufferSize( new THREE.Vector2() );
            const renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, { samples: 4, type: THREE.HalfFloatType } );
        
            const renderPass = new RenderPass( scene, camera );
            const outputPass = new OutputPass();
        
            //
        
            composer1 = new EffectComposer( renderer );
            composer1.addPass( renderPass );
            composer1.addPass( outputPass );
        
            //
        
            composer2 = new EffectComposer( renderer, renderTarget );
            composer2.addPass( renderPass );
            composer2.addPass( outputPass );
        
            //
        
            const gui = new GUI();
            gui.add( params, 'animate' );
        
            //
        
            app.signal.onContainerSizeChange.add(onWindowResize)
        
        
            app.signal.onAppRender.add(animate)
        
            app.logInfo("Left: WebGLRenderTarget, Right: WebGLRenderTarget (multisampled)", 10000)
        }
        
        function onWindowResize() {
        
            composer1.setSize( app.containerSize.width, app.containerSize.height );
            composer2.setSize( app.containerSize.width, app.containerSize.height  );
        
        }
        
        function animate() {
        
        
            if ( params.animate ) {
        
                group.rotation.y += 0.002;
        
            }
        
            renderer.setScissorTest( true );
        
            renderer.setScissor( 0, 0, app.containerSize.width / 2 - 1, app.containerSize.height );
            composer1.render();
        
            renderer.setScissor( app.containerSize.width / 2, 0, app.containerSize.width / 2, app.containerSize.height );
            composer2.render();
        
            renderer.setScissorTest( false );
        
        }
        
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};