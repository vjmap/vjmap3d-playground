
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/005threeWebglLogarithmicdepthbuffer
        // --camera_logarithmicdepthbuffer--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_camera_logarithmicdepthbuffer
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
                fov:  50,
                near: 1,
                far: 10000,
                position: [0, 0, 2500]
            },
            control: {
                enable: false
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene;
        
        // 1 micrometer to 100 billion light years in one scene, with 1 unit = 1 meter?  preposterous!  and yet...
        const NEAR = 1e-6, FAR = 1e27;
        let SCREEN_WIDTH = window.innerWidth;
        let SCREEN_HEIGHT = window.innerHeight;
        let screensplit = .5, screensplit_right = 0;
        const mouse = [ .5, .5 ];
        let zoompos = - 100, minzoomspeed = .015;
        let zoomspeed = minzoomspeed;
        
        let container, border;
        const objects = {};
        
        // Generate a number of text labels, from 1µm in size up to 100,000,000 light years
        // Try to use some descriptive real-world examples of objects at each scale
        
        const labeldata = [
            { size: .01, scale: 0.0001, label: 'microscopic (1µm)' }, // FIXME - triangulating text fails at this size, so we scale instead
            { size: .01, scale: 0.1, label: 'minuscule (1mm)' },
            { size: .01, scale: 1.0, label: 'tiny (1cm)' },
            { size: 1, scale: 1.0, label: 'child-sized (1m)' },
            { size: 10, scale: 1.0, label: 'tree-sized (10m)' },
            { size: 100, scale: 1.0, label: 'building-sized (100m)' },
            { size: 1000, scale: 1.0, label: 'medium (1km)' },
            { size: 10000, scale: 1.0, label: 'city-sized (10km)' },
            { size: 3400000, scale: 1.0, label: 'moon-sized (3,400 Km)' },
            { size: 12000000, scale: 1.0, label: 'planet-sized (12,000 km)' },
            { size: 1400000000, scale: 1.0, label: 'sun-sized (1,400,000 km)' },
            { size: 7.47e12, scale: 1.0, label: 'solar system-sized (50Au)' },
            { size: 9.4605284e15, scale: 1.0, label: 'gargantuan (1 light year)' },
            { size: 3.08567758e16, scale: 1.0, label: 'ludicrous (1 parsec)' },
            { size: 1e19, scale: 1.0, label: 'mind boggling (1000 light years)' }
        ];
        
        
        
        const loader = new FontLoader();
        loader.load( env.assetsPath + 'fonts/helvetiker_regular.typeface.json', function ( font ) {
        
            init();
            initScene( font );
        
            // Initialize two copies of the same scene, one with normal z-buffer and one with logarithmic z-buffer
            objects.normal = initView( scene, 'normal', false );
            objects.logzbuf = initView( scene, 'logzbuf', true );
        
            app.signal.onAppRender.add(() => render())
        } );
        
        function init() {
        
            container = app.container;
            container.style.display = "flex"
            let div = vjmap3d.DOM.createStyledDiv(`<div id="container_normal"><h2 class="renderer_label">normal z-buffer</h2></div>
            <div id="container_logzbuf"><h2 class="renderer_label">logarithmic z-buffer</h2></div>
            <div id="renderer_border"></div>`, `#container_normal {
                width: 50%;
                display: inline-block;
                position: relative;
            }
        
            #container_logzbuf {
                width: 50%;
                display: inline-block;
                position: relative;
            }
        
            #renderer_border {
                position: absolute;
                top: 0;
                left: 50%;
                bottom: 0;
                width: 2px;
                z-index: 10;
                opacity: .8;
                background: #ccc;
                border: 1px inset #ccc;
                cursor: col-resize;
            }
        
            .renderer_label {
                position: absolute;
                bottom: 1em;
                width: 100%;
                color: white;
                z-index: 10;
                display: block;
                text-align: center;
            }
            `)
            container?.appendChild(div);
            // 获取该div的父元素
            let parent = div.parentNode;
            // 将div的所有子节点插入到父元素中，位于div之前
            while (div.firstChild) {
                parent.insertBefore(div.firstChild, div);
            }
            // 删除div元素
            parent.removeChild(div);
        
            // Resize border allows the user to easily compare effects of logarithmic depth buffer over the whole scene
            border = document.getElementById( 'renderer_border' );
            border.addEventListener( 'pointerdown', onBorderPointerDown );
        
            window.addEventListener( 'mousemove', onMouseMove );
            window.addEventListener( 'resize', onWindowResize );
            window.addEventListener( 'wheel', onMouseWheel );
        
        }
        
        function initView( scene, name, logDepthBuf ) {
        
            const framecontainer = document.getElementById( 'container_' + name );
        
            const camera = new THREE.PerspectiveCamera( 50, screensplit * SCREEN_WIDTH / SCREEN_HEIGHT, NEAR, FAR );
            scene.add( camera );
        
            const renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: logDepthBuf } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( SCREEN_WIDTH / 2, SCREEN_HEIGHT );
            renderer.domElement.style.position = 'relative';
            renderer.domElement.id = 'renderer_' + name;
            framecontainer.appendChild( renderer.domElement );
        
            return { container: framecontainer, renderer: renderer, scene: scene, camera: camera };
        
        }
        
        function initScene( font ) {
        
        
            scene.add( new THREE.AmbientLight( 0x777777 ) );
        
            const light = new THREE.DirectionalLight( 0xffffff, 3 );
            light.position.set( 100, 100, 100 );
            scene.add( light );
        
            const materialargs = {
                color: 0xffffff,
                specular: 0x050505,
                shininess: 50,
                emissive: 0x000000
            };
        
            const geometry = new THREE.SphereGeometry( 0.5, 24, 12 );
        
            for ( let i = 0; i < labeldata.length; i ++ ) {
        
                const scale = labeldata[ i ].scale || 1;
        
                const labelgeo = new TextGeometry( labeldata[ i ].label, {
                    font: font,
                    size: labeldata[ i ].size,
                    height: labeldata[ i ].size / 2
                } );
        
                labelgeo.computeBoundingSphere();
        
                // center text
                labelgeo.translate( - labelgeo.boundingSphere.radius, 0, 0 );
        
                materialargs.color = new THREE.Color().setHSL( Math.random(), 0.5, 0.5 );
        
                const material = new THREE.MeshPhongMaterial( materialargs );
        
                const group = new THREE.Group();
                group.position.z = - labeldata[ i ].size * scale;
                scene.add( group );
        
                const textmesh = new THREE.Mesh( labelgeo, material );
                textmesh.scale.set( scale, scale, scale );
                textmesh.position.z = - labeldata[ i ].size * scale;
                textmesh.position.y = labeldata[ i ].size / 4 * scale;
                group.add( textmesh );
        
                const dotmesh = new THREE.Mesh( geometry, material );
                dotmesh.position.y = - labeldata[ i ].size / 4 * scale;
                dotmesh.scale.multiplyScalar( labeldata[ i ].size * scale );
                group.add( dotmesh );
        
            }
        }
        
        function updateRendererSizes() {
        
            // Recalculate size for both renderers when screen size or split location changes
        
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
        
            screensplit_right = 1 - screensplit;
        
            objects.normal.renderer.setSize( screensplit * SCREEN_WIDTH, SCREEN_HEIGHT );
            objects.normal.camera.aspect = screensplit * SCREEN_WIDTH / SCREEN_HEIGHT;
            objects.normal.camera.updateProjectionMatrix();
            objects.normal.camera.setViewOffset( SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0, SCREEN_WIDTH * screensplit, SCREEN_HEIGHT );
            objects.normal.container.style.width = ( screensplit * 100 ) + '%';
        
            objects.logzbuf.renderer.setSize( screensplit_right * SCREEN_WIDTH, SCREEN_HEIGHT );
            objects.logzbuf.camera.aspect = screensplit_right * SCREEN_WIDTH / SCREEN_HEIGHT;
            objects.logzbuf.camera.updateProjectionMatrix();
            objects.logzbuf.camera.setViewOffset( SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_WIDTH * screensplit, 0, SCREEN_WIDTH * screensplit_right, SCREEN_HEIGHT );
            objects.logzbuf.container.style.width = ( screensplit_right * 100 ) + '%';
        
            border.style.left = ( screensplit * 100 ) + '%';
        
        }
        
        
        
        function render() {
        
            // Put some limits on zooming
            const minzoom = labeldata[ 0 ].size * labeldata[ 0 ].scale * 1;
            const maxzoom = labeldata[ labeldata.length - 1 ].size * labeldata[ labeldata.length - 1 ].scale * 100;
            let damping = ( Math.abs( zoomspeed ) > minzoomspeed ? .95 : 1.0 );
        
            // Zoom out faster the further out you go
            const zoom = THREE.MathUtils.clamp( Math.pow( Math.E, zoompos ), minzoom, maxzoom );
            zoompos = Math.log( zoom );
        
            // Slow down quickly at the zoom limits
            if ( ( zoom == minzoom && zoomspeed < 0 ) || ( zoom == maxzoom && zoomspeed > 0 ) ) {
        
                damping = .85;
        
            }
        
            zoompos += zoomspeed;
            zoomspeed *= damping;
        
            objects.normal.camera.position.x = Math.sin( .5 * Math.PI * ( mouse[ 0 ] - .5 ) ) * zoom;
            objects.normal.camera.position.y = Math.sin( .25 * Math.PI * ( mouse[ 1 ] - .5 ) ) * zoom;
            objects.normal.camera.position.z = Math.cos( .5 * Math.PI * ( mouse[ 0 ] - .5 ) ) * zoom;
            objects.normal.camera.lookAt( objects.normal.scene.position );
        
            // Clone camera settings across both scenes
            objects.logzbuf.camera.position.copy( objects.normal.camera.position );
            objects.logzbuf.camera.quaternion.copy( objects.normal.camera.quaternion );
        
            // Update renderer sizes if the split has changed
            if ( screensplit_right != 1 - screensplit ) {
        
                updateRendererSizes();
        
            }
        
            objects.normal.renderer.render( objects.normal.scene, objects.normal.camera );
            objects.logzbuf.renderer.render( objects.logzbuf.scene, objects.logzbuf.camera );
        
        }
        
        function onWindowResize() {
        
            updateRendererSizes();
        
        }
        
        function onBorderPointerDown() {
        
            // activate draggable window resizing bar
            window.addEventListener( 'pointermove', onBorderPointerMove );
            window.addEventListener( 'pointerup', onBorderPointerUp );
        
        }
        
        function onBorderPointerMove( ev ) {
        
            screensplit = Math.max( 0, Math.min( 1, ev.clientX / window.innerWidth ) );
        
        }
        
        function onBorderPointerUp() {
        
            window.removeEventListener( 'pointermove', onBorderPointerMove );
            window.removeEventListener( 'pointerup', onBorderPointerUp );
        
        }
        
        function onMouseMove( ev ) {
        
            mouse[ 0 ] = ev.clientX / window.innerWidth;
            mouse[ 1 ] = ev.clientY / window.innerHeight;
        
        }
        
        function onMouseWheel( ev ) {
        
            const amount = ev.deltaY;
            if ( amount === 0 ) return;
            const dir = amount / Math.abs( amount );
            zoomspeed = dir / 10;
        
            // Slow down default zoom speed after user starts zooming, to give them more control
            minzoomspeed = 0.001;
        
        }
    }
    catch (e) {
        console.error(e);
    }
};