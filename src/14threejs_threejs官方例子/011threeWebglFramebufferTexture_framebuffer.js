
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/011threeWebglFramebufferTexture
        // --framebuffer_texture--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_framebuffer_texture
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
                fov: 70,
                near: 1,
                far: 100,
                position: [ 0, 0, 20  ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        renderer.autoClear = false;
        
        let line, sprite, texture;
        
        let cameraOrtho, sceneOrtho;
        
        let offset = 0;
        
        const dpr = window.devicePixelRatio;
        
        const textureSize = 128 * dpr;
        const vector = new THREE.Vector2();
        const color = new THREE.Color();
        
        init();
        
        function init() {
        
            //
        
            const width = app.containerSize.width;
            const height = app.containerSize.height;
        
            cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
            cameraOrtho.position.z = 10;
        
            sceneOrtho = new THREE.Scene();
        
            //
        
            const points = GeometryUtils.gosper( 8 );
        
            const geometry = new THREE.BufferGeometry();
            const positionAttribute = new THREE.Float32BufferAttribute( points, 3 );
            geometry.setAttribute( 'position', positionAttribute );
            geometry.center();
        
            const colorAttribute = new THREE.BufferAttribute( new Float32Array( positionAttribute.array.length ), 3 );
            colorAttribute.setUsage( THREE.DynamicDrawUsage );
            geometry.setAttribute( 'color', colorAttribute );
        
            const material = new THREE.LineBasicMaterial( { vertexColors: true } );
        
            line = new THREE.Line( geometry, material );
            line.scale.setScalar( 0.05 );
            scene.add( line );
        
            //
        
            texture = new THREE.FramebufferTexture( textureSize, textureSize );
        
            //
        
            const spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
            sprite = new THREE.Sprite( spriteMaterial );
            sprite.scale.set( textureSize, textureSize, 1 );
            sceneOrtho.add( sprite );
        
            updateSpritePosition();
        
            //
        
            app.signal.onContainerSizeChange.add(onWindowResize);
            app.signal.onAppRender.add(animate);
        }
        
        function onWindowResize() {
        
            const width = app.containerSize.width;
            const height = app.containerSize.height;
        
            cameraOrtho.left = - width / 2;
            cameraOrtho.right = width / 2;
            cameraOrtho.top = height / 2;
            cameraOrtho.bottom = - height / 2;
            cameraOrtho.updateProjectionMatrix();
        
            updateSpritePosition();
        
        }
        
        function updateSpritePosition() {
        
            const halfWidth = app.containerSize.width / 2;
            const halfHeight = app.containerSize.height / 2;
        
            const halfImageWidth = textureSize / 2;
            const halfImageHeight = textureSize / 2;
        
            sprite.position.set( - halfWidth + halfImageWidth, halfHeight - halfImageHeight, 1 );
        
        }
        
        function animate() {
        
            const colorAttribute = line.geometry.getAttribute( 'color' );
            updateColors( colorAttribute );
        
            // scene rendering
        
            renderer.clear();
            renderer.render( scene, camera );
        
            // calculate start position for copying data
        
            vector.x = ( app.containerSize.width  * dpr / 2 ) - ( textureSize / 2 );
            vector.y = ( app.containerSize.height * dpr / 2 ) - ( textureSize / 2 );
        
            renderer.copyFramebufferToTexture( texture, vector );
        
            renderer.clearDepth();
            renderer.render( sceneOrtho, cameraOrtho );
        
        }
        
        function updateColors( colorAttribute ) {
        
            const l = colorAttribute.count;
        
            for ( let i = 0; i < l; i ++ ) {
        
                const h = ( ( offset + i ) % l ) / l;
        
                color.setHSL( h, 1, 0.5 );
                colorAttribute.setX( i, color.r );
                colorAttribute.setY( i, color.g );
                colorAttribute.setZ( i, color.b );
        
            }
        
            colorAttribute.needsUpdate = true;
        
            offset -= 25;
        
        }
        
        let div = vjmap3d.DOM.createStyledDiv(`<div id="selection">
        <div></div>
        </div>`, `#selection {
            position: fixed;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            width: 100%;
            top: 0;
            z-index: 999;
            pointer-events: none
        }
        
        #selection > div {
            height: 128px;
            width: 128px;
            border: 1px solid white;
        }
        `)
        app.container.parentNode?.appendChild(div)
    }
    catch (e) {
        console.error(e);
    }
};