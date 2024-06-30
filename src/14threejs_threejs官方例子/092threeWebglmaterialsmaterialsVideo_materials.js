
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/092threeWebglmaterialsmaterialsVideo
        // --materials_video--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_video
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false
            },
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 40,
                near: 1,
                far: 10000,
                position: [ 0, 0, 500]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        
        let video, texture, material, mesh;
        
        let composer;
        
        let mouseX = 0;
        let mouseY = 0;
        
        let windowHalfX = app.containerSize.width / 2;
        let windowHalfY = app.containerSize.height / 2;
        
        let cube_count;
        
        const meshes = [],
            materials = [],
        
            xgrid = 20,
            ygrid = 10;
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            document.body.appendChild(vjmap3d.DOM.createStyledDiv(`
            <div id="overlay">
        			<button id="startButton">Play</button>
        		</div>
                <video id="video" loop crossOrigin="anonymous" playsinline style="display:none">
        			<source src="${assetsPath}textures/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
        			<source src="${assetsPath}textures/sintel.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
        		</video>
            `, `
            #overlay {
                position: absolute;
                font-size: 16px;
                z-index: 2;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                background: rgba(0,0,0,0.7);
            }
            
                #overlay button {
                    background: transparent;
                    border: 0;
                    border: 1px solid rgb(255, 255, 255);
                    border-radius: 4px;
                    color: #ffffff;
                    padding: 12px 18px;
                    text-transform: uppercase;
                    cursor: pointer;
                }`))
        const startButton = document.getElementById( 'startButton' );
        startButton.addEventListener( 'click', function () {
        
            init();
        
        } );
        
        function init() {
        
            const overlay = document.getElementById( 'overlay' );
            overlay.remove();
        
        
            const light = new THREE.DirectionalLight( 0xffffff, 3 );
            light.position.set( 0.5, 1, 1 ).normalize();
            scene.add( light );
        
            video = document.getElementById( 'video' );
            video.play();
            video.addEventListener( 'play', function () {
        
                this.currentTime = 3;
        
            } );
        
            texture = new THREE.VideoTexture( video );
            texture.colorSpace = THREE.SRGBColorSpace;
        
            //
        
            let i, j, ox, oy, geometry;
        
            const ux = 1 / xgrid;
            const uy = 1 / ygrid;
        
            const xsize = 480 / xgrid;
            const ysize = 204 / ygrid;
        
            const parameters = { color: 0xffffff, map: texture };
        
            cube_count = 0;
        
            for ( i = 0; i < xgrid; i ++ ) {
        
                for ( j = 0; j < ygrid; j ++ ) {
        
                    ox = i;
                    oy = j;
        
                    geometry = new THREE.BoxGeometry( xsize, ysize, xsize );
        
                    change_uvs( geometry, ux, uy, ox, oy );
        
                    materials[ cube_count ] = new THREE.MeshLambertMaterial( parameters );
        
                    material = materials[ cube_count ];
        
                    material.hue = i / xgrid;
                    material.saturation = 1 - j / ygrid;
        
                    material.color.setHSL( material.hue, material.saturation, 0.5 );
        
                    mesh = new THREE.Mesh( geometry, material );
        
                    mesh.position.x = ( i - xgrid / 2 ) * xsize;
                    mesh.position.y = ( j - ygrid / 2 ) * ysize;
                    mesh.position.z = 0;
        
                    mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;
        
                    scene.add( mesh );
        
                    mesh.dx = 0.001 * ( 0.5 - Math.random() );
                    mesh.dy = 0.001 * ( 0.5 - Math.random() );
        
                    meshes[ cube_count ] = mesh;
        
                    cube_count += 1;
        
                }
        
            }
        
            renderer.autoClear = false;
        
            document.addEventListener( 'mousemove', onDocumentMouseMove );
        
            // postprocessing
        
            const renderPass = new RenderPass( scene, camera );
            const bloomPass = new BloomPass( 1.3 );
            const outputPass = new OutputPass();
        
            composer = new EffectComposer( renderer );
        
            composer.addPass( renderPass );
            composer.addPass( bloomPass );
            composer.addPass( outputPass );
        
            app.signal.onContainerSizeChange.add(() => {
                composer.setSize( app.containerSize.width, app.containerSize.height );
            })
        
            app.signal.onAppRender.add(animate)
        
        }
        
        function change_uvs( geometry, unitx, unity, offsetx, offsety ) {
        
            const uvs = geometry.attributes.uv.array;
        
            for ( let i = 0; i < uvs.length; i += 2 ) {
        
                uvs[ i ] = ( uvs[ i ] + offsetx ) * unitx;
                uvs[ i + 1 ] = ( uvs[ i + 1 ] + offsety ) * unity;
        
            }
        
        }
        
        
        function onDocumentMouseMove( event ) {
        
            mouseX = ( event.clientX - windowHalfX );
            mouseY = ( event.clientY - windowHalfY ) * 0.3;
        
        }
        
        //
        
        let h, counter = 1;
        
        function animate() {
        
            const time = Date.now() * 0.00005;
        
            camera.position.x += ( mouseX - camera.position.x ) * 0.05;
            camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
        
            camera.lookAt( scene.position );
        
            for ( let i = 0; i < cube_count; i ++ ) {
        
                material = materials[ i ];
        
                h = ( 360 * ( material.hue + time ) % 360 ) / 360;
                material.color.setHSL( h, material.saturation, 0.5 );
        
            }
        
            if ( counter % 1000 > 200 ) {
        
                for ( let i = 0; i < cube_count; i ++ ) {
        
                    mesh = meshes[ i ];
        
                    mesh.rotation.x += 10 * mesh.dx;
                    mesh.rotation.y += 10 * mesh.dy;
        
                    mesh.position.x -= 150 * mesh.dx;
                    mesh.position.y += 150 * mesh.dy;
                    mesh.position.z += 300 * mesh.dx;
        
                }
        
            }
        
            if ( counter % 1000 === 0 ) {
        
                for ( let i = 0; i < cube_count; i ++ ) {
        
                    mesh = meshes[ i ];
        
                    mesh.dx *= - 1;
                    mesh.dy *= - 1;
        
                }
        
            }
        
            counter ++;
        
            renderer.clear();
            composer.render();
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};