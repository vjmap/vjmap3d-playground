
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/023threeWebglGeometryTerrainRaycast
        // --geometry_terrain_raycast--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_terrain_raycast
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xbfd1e5,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 60,
                near: 10, 
                far: 20000,
                position: [ 0, 0, 0]
            },
            control: {
                minDistance: 1000,
                maxDistance: 10000,
                maxPolarAngle: Math.PI / 2
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mesh, texture;
        
        const worldWidth = 256, worldDepth = 256,
            worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
        
        let helper;
        
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        
        init();
        
        function init() {
        
            const data = generateHeight( worldWidth, worldDepth );
        
            let targety = data[ worldHalfWidth + worldHalfDepth * worldWidth ] + 500;
            app.cameraControl.setTarget(0, targety, 0);
            camera.position.y = targety + 2000;
            camera.position.x = 2000;
        
            const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
            geometry.rotateX( - Math.PI / 2 );
        
            const vertices = geometry.attributes.position.array;
        
            for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
        
                vertices[ j + 1 ] = data[ i ] * 10;
        
            }
        
            //
        
            texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.colorSpace = THREE.SRGBColorSpace;
        
            mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } ) );
            scene.add( mesh );
        
            const geometryHelper = new THREE.ConeGeometry( 20, 100, 3 );
            geometryHelper.translate( 0, 50, 0 );
            geometryHelper.rotateX( Math.PI / 2 );
            helper = new THREE.Mesh( geometryHelper, new THREE.MeshNormalMaterial() );
            scene.add( helper );
        
            app.signal.onPointerMove.add(e => onPointerMove(e.originalEvent))
        
        }
        
        
        function generateHeight( width, height ) {
        
            const size = width * height, data = new Uint8Array( size ),
                perlin = new ImprovedNoise(), z = Math.random() * 100;
        
            let quality = 1;
        
            for ( let j = 0; j < 4; j ++ ) {
        
                for ( let i = 0; i < size; i ++ ) {
        
                    const x = i % width, y = ~ ~ ( i / width );
                    data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
        
                }
        
                quality *= 5;
        
            }
        
            return data;
        
        }
        
        function generateTexture( data, width, height ) {
        
            // bake lighting into texture
        
            let context, image, imageData, shade;
        
            const vector3 = new THREE.Vector3( 0, 0, 0 );
        
            const sun = new THREE.Vector3( 1, 1, 1 );
            sun.normalize();
        
            const canvas = document.createElement( 'canvas' );
            canvas.width = width;
            canvas.height = height;
        
            context = canvas.getContext( '2d' );
            context.fillStyle = '#000';
            context.fillRect( 0, 0, width, height );
        
            image = context.getImageData( 0, 0, canvas.width, canvas.height );
            imageData = image.data;
        
            for ( let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
        
                vector3.x = data[ j - 2 ] - data[ j + 2 ];
                vector3.y = 2;
                vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
                vector3.normalize();
        
                shade = vector3.dot( sun );
        
                imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
                imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
                imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        
            }
        
            context.putImageData( image, 0, 0 );
        
            // Scaled 4x
        
            const canvasScaled = document.createElement( 'canvas' );
            canvasScaled.width = width * 4;
            canvasScaled.height = height * 4;
        
            context = canvasScaled.getContext( '2d' );
            context.scale( 4, 4 );
            context.drawImage( canvas, 0, 0 );
        
            image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
            imageData = image.data;
        
            for ( let i = 0, l = imageData.length; i < l; i += 4 ) {
        
                const v = ~ ~ ( Math.random() * 5 );
        
                imageData[ i ] += v;
                imageData[ i + 1 ] += v;
                imageData[ i + 2 ] += v;
        
            }
        
            context.putImageData( image, 0, 0 );
        
            return canvasScaled;
        
        }
        
        
        function onPointerMove( event ) {
        
            pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
            pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
            raycaster.setFromCamera( pointer, camera );
        
            // See if the ray from the camera into the world hits one of our meshes
            const intersects = raycaster.intersectObject( mesh );
        
            // Toggle rotation bool for meshes that we clicked
            if ( intersects.length > 0 ) {
        
                helper.position.set( 0, 0, 0 );
                helper.lookAt( intersects[ 0 ].face.normal );
        
                helper.position.copy( intersects[ 0 ].point );
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};