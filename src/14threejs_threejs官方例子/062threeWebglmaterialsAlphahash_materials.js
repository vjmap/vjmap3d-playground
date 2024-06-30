
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/062threeWebglmaterialsAlphahash
        // --materials_alphahash--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_alphahash
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
                fov: 60,
                near: 0.1, 
                far: 100,
                position: [  0, 0, 0],
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh, material;
        
        let composer, renderPass, taaRenderPass, outputPass;
        
        let needsUpdate = false;
        
        const amount = parseInt( window.location.search.slice( 1 ) ) || 3;
        const count = Math.pow( amount, 3 );
        
        const color = new THREE.Color();
        
        const params = {
            alpha: 0.5,
            alphaHash: true,
            taa: true,
            sampleLevel: 2,
        };
        
        init();
        
        function init() {
            app.cameraControl.setLookAt(amount, amount, amount, 0, 0, 0)
           
            const geometry = new THREE.IcosahedronGeometry( 0.5, 3 );
        
            material = new THREE.MeshStandardMaterial( {
                color: 0xffffff,
                alphaHash: params.alphaHash,
                opacity: params.alpha
            } );
        
            mesh = new THREE.InstancedMesh( geometry, material, count );
        
            let i = 0;
            const offset = ( amount - 1 ) / 2;
        
            const matrix = new THREE.Matrix4();
        
            for ( let x = 0; x < amount; x ++ ) {
        
                for ( let y = 0; y < amount; y ++ ) {
        
                    for ( let z = 0; z < amount; z ++ ) {
        
                        matrix.setPosition( offset - x, offset - y, offset - z );
        
                        mesh.setMatrixAt( i, matrix );
                        mesh.setColorAt( i, color.setHex( Math.random() * 0xffffff ) );
        
                        i ++;
        
                    }
        
                }
        
            }
        
            scene.add( mesh );
        
            //
        
            const environment = new RoomEnvironment( renderer );
            const pmremGenerator = new THREE.PMREMGenerator( renderer );
        
            scene.environment = pmremGenerator.fromScene( environment ).texture;
            environment.dispose();
        
            //
        
            composer = new EffectComposer( renderer );
        
            renderPass = new RenderPass( scene, camera );
            renderPass.enabled = false;
        
            taaRenderPass = new TAARenderPass( scene, camera );
        
            outputPass = new OutputPass();
        
            composer.addPass( renderPass );
            composer.addPass( taaRenderPass );
            composer.addPass( outputPass );
        
            //
        
            const gui = new GUI();
        
            gui.add( params, 'alpha', 0, 1 ).onChange( onMaterialUpdate );
            gui.add( params, 'alphaHash' ).onChange( onMaterialUpdate );
        
            const taaFolder = gui.addFolder( 'Temporal Anti-Aliasing' );
        
            taaFolder.add( params, 'taa' ).name( 'enabled' ).onChange( () => {
        
                renderPass.enabled = ! params.taa;
                taaRenderPass.enabled = params.taa;
        
                sampleLevelCtrl.enable( params.taa );
        
                needsUpdate = true;
        
            } );
        
            const sampleLevelCtrl = taaFolder.add( params, 'sampleLevel', 0, 6, 1 ).onChange( () => ( needsUpdate = true ) );
        
           app.signal.onContainerSizeChange.add(() => {
            composer.setSize( app.containerSize.width, app.containerSize.height );
            needsUpdate = true;
           })
        
           app.signal.onAppRender.add(render)
           app.signal.onCameraUpdate.add(() => {
            needsUpdate = true;
           })
        }
        
        
        function onMaterialUpdate() {
        
            material.opacity = params.alpha;
            material.alphaHash = params.alphaHash;
            material.transparent = ! params.alphaHash;
            material.depthWrite = params.alphaHash;
        
            material.needsUpdate = true;
            needsUpdate = true;
        
        }
        
        function render() {
        
            if ( needsUpdate ) {
        
                taaRenderPass.accumulate = false;
                taaRenderPass.sampleLevel = 0;
        
                needsUpdate = false;
        
            } else {
        
                taaRenderPass.accumulate = true;
                taaRenderPass.sampleLevel = params.sampleLevel;
        
            }
        
            composer.render();
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};