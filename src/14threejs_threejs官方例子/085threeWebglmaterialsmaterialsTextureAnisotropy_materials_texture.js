
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/085threeWebglmaterialsmaterialsTextureAnisotropy
        // --materials_texture_anisotropy--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_texture_anisotropy
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false,
            },
            scene: {
                background: 0xf2f7ff,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 35,
                near: 1,
                far: 25000,
                position: [ 0, 0, 1500]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        const SCREEN_WIDTH = app.containerSize.width;
        const SCREEN_HEIGHT = app.containerSize.height;
        
        
        let scene1, scene2;
        
        let mouseX = 0, mouseY = 0;
        
        const windowHalfX = SCREEN_WIDTH / 2;
        const windowHalfY = SCREEN_HEIGHT / 2;
        
        let div = vjmap3d.DOM.createStyledDiv(`
        <div id="lbl_left" class="lbl">
        		anisotropy: <span class="c" id="val_left"></span><br/>
        		</div>
        
        		<div id="lbl_right" class="lbl">
        		anisotropy: <span class="c" id="val_right"></span><br/>
        		</div>
        `, `a {
            color: #08f;
        }
        
        .lbl {
            color: #fff;
            font-size: 16px;
            font-weight: bold;
            position: absolute;
            bottom: 0px;
            z-index: 100;
            text-shadow: #000 1px 1px 1px;
            background-color: rgba(0,0,0,0.85);
            padding: 1em;
        }
        
        #lbl_left {
            text-align:left;
            left:0px;
        }
        
        #lbl_right {
            text-align:left;
            right:0px
        }
        
        .g { color:#aaa }
        .c { color:#fa0 }
        `)
        document.body.appendChild(div)
        init();
        
        function init() {
        
        
            scene1 = scene;
            scene1.fog = new THREE.Fog( 0xf2f7ff, 1, 25000 );
        
            scene2 = new THREE.Scene();
            scene2.background = new THREE.Color( 0xf2f7ff );
            scene2.fog = new THREE.Fog( 0xf2f7ff, 1, 25000 );
        
            scene1.add( new THREE.AmbientLight( 0xeef0ff, 3 ) );
            scene2.add( new THREE.AmbientLight( 0xeef0ff, 3 ) );
        
            const light1 = new THREE.DirectionalLight( 0xffffff, 6 );
            light1.position.set( 1, 1, 1 );
            scene1.add( light1 );
        
            const light2 = new THREE.DirectionalLight( 0xffffff, 6 );
            light2.position.set( 1, 1, 1 );
            scene2.add( light2 );
        
            // GROUND
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const textureLoader = new THREE.TextureLoader();
        
            const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
        
            const texture1 = textureLoader.load(assetsPath + 'textures/crate.gif' );
            const material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture1 } );
        
            texture1.colorSpace = THREE.SRGBColorSpace;
            texture1.anisotropy = maxAnisotropy;
            texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
            texture1.repeat.set( 512, 512 );
        
            const texture2 = textureLoader.load(assetsPath +  'textures/crate.gif' );
            const material2 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture2 } );
        
            texture2.colorSpace = THREE.SRGBColorSpace;
            texture2.anisotropy = 1;
            texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
            texture2.repeat.set( 512, 512 );
        
            if ( maxAnisotropy > 0 ) {
        
                document.getElementById( 'val_left' ).innerHTML = texture1.anisotropy;
                document.getElementById( 'val_right' ).innerHTML = texture2.anisotropy;
        
            } else {
        
                document.getElementById( 'val_left' ).innerHTML = 'not supported';
                document.getElementById( 'val_right' ).innerHTML = 'not supported';
        
            }
        
            //
        
            const geometry = new THREE.PlaneGeometry( 100, 100 );
        
            const mesh1 = new THREE.Mesh( geometry, material1 );
            mesh1.rotation.x = - Math.PI / 2;
            mesh1.scale.set( 1000, 1000, 1000 );
        
            const mesh2 = new THREE.Mesh( geometry, material2 );
            mesh2.rotation.x = - Math.PI / 2;
            mesh2.scale.set( 1000, 1000, 1000 );
        
            scene1.add( mesh1 );
            scene2.add( mesh2 );
        
            // RENDERER
        
           
            renderer.autoClear = false;
        
            renderer.domElement.style.position = 'relative';
           
            document.addEventListener( 'mousemove', onDocumentMouseMove );
        
            app.signal.onAppUpdate.add(render)
        }
        
        
        function onDocumentMouseMove( event ) {
        
            mouseX = ( event.clientX - windowHalfX );
            mouseY = ( event.clientY - windowHalfY );
        
        }
        
        
        
        function render() {
        
            camera.position.x += ( mouseX - camera.position.x ) * .05;
            camera.position.y = THREE.MathUtils.clamp( camera.position.y + ( - ( mouseY - 200 ) - camera.position.y ) * .05, 50, 1000 );
        
            camera.lookAt( scene1.position );
        
            renderer.clear();
            renderer.setScissorTest( true );
        
            renderer.setScissor( 0, 0, SCREEN_WIDTH / 2 - 2, SCREEN_HEIGHT );
            renderer.render( scene1, camera );
        
            renderer.setScissor( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2 - 2, SCREEN_HEIGHT );
            renderer.render( scene2, camera );
        
            renderer.setScissorTest( false );
        
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};