
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/019threeWebglGeometryMinecraft
        // --geometry_minecraft--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_minecraft
        
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
                near: 1, 
                far: 20000,
                position: [0, 50, 500]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let controls;
        const worldWidth = 128, worldDepth = 128;
        const worldHalfWidth = worldWidth / 2;
        const worldHalfDepth = worldDepth / 2;
        const data = generateHeight( worldWidth, worldDepth );
        
        const clock = new THREE.Clock();
        
        init();
        
        function init() {
            camera.position.y = getY( worldHalfWidth, worldHalfDepth ) * 100 + 100;
           
            // sides
        
            const matrix = new THREE.Matrix4();
        
            const pxGeometry = new THREE.PlaneGeometry( 100, 100 );
            pxGeometry.attributes.uv.array[ 1 ] = 0.5;
            pxGeometry.attributes.uv.array[ 3 ] = 0.5;
            pxGeometry.rotateY( Math.PI / 2 );
            pxGeometry.translate( 50, 0, 0 );
        
            const nxGeometry = new THREE.PlaneGeometry( 100, 100 );
            nxGeometry.attributes.uv.array[ 1 ] = 0.5;
            nxGeometry.attributes.uv.array[ 3 ] = 0.5;
            nxGeometry.rotateY( - Math.PI / 2 );
            nxGeometry.translate( - 50, 0, 0 );
        
            const pyGeometry = new THREE.PlaneGeometry( 100, 100 );
            pyGeometry.attributes.uv.array[ 5 ] = 0.5;
            pyGeometry.attributes.uv.array[ 7 ] = 0.5;
            pyGeometry.rotateX( - Math.PI / 2 );
            pyGeometry.translate( 0, 50, 0 );
        
            const pzGeometry = new THREE.PlaneGeometry( 100, 100 );
            pzGeometry.attributes.uv.array[ 1 ] = 0.5;
            pzGeometry.attributes.uv.array[ 3 ] = 0.5;
            pzGeometry.translate( 0, 0, 50 );
        
            const nzGeometry = new THREE.PlaneGeometry( 100, 100 );
            nzGeometry.attributes.uv.array[ 1 ] = 0.5;
            nzGeometry.attributes.uv.array[ 3 ] = 0.5;
            nzGeometry.rotateY( Math.PI );
            nzGeometry.translate( 0, 0, - 50 );
        
            //
        
            const geometries = [];
        
            for ( let z = 0; z < worldDepth; z ++ ) {
        
                for ( let x = 0; x < worldWidth; x ++ ) {
        
                    const h = getY( x, z );
        
                    matrix.makeTranslation(
                        x * 100 - worldHalfWidth * 100,
                        h * 100,
                        z * 100 - worldHalfDepth * 100
                    );
        
                    const px = getY( x + 1, z );
                    const nx = getY( x - 1, z );
                    const pz = getY( x, z + 1 );
                    const nz = getY( x, z - 1 );
        
                    geometries.push( pyGeometry.clone().applyMatrix4( matrix ) );
        
                    if ( ( px !== h && px !== h + 1 ) || x === 0 ) {
        
                        geometries.push( pxGeometry.clone().applyMatrix4( matrix ) );
        
                    }
        
                    if ( ( nx !== h && nx !== h + 1 ) || x === worldWidth - 1 ) {
        
                        geometries.push( nxGeometry.clone().applyMatrix4( matrix ) );
        
                    }
        
                    if ( ( pz !== h && pz !== h + 1 ) || z === worldDepth - 1 ) {
        
                        geometries.push( pzGeometry.clone().applyMatrix4( matrix ) );
        
                    }
        
                    if ( ( nz !== h && nz !== h + 1 ) || z === 0 ) {
        
                        geometries.push( nzGeometry.clone().applyMatrix4( matrix ) );
        
                    }
        
                }
        
            }
        
            const geometry = BufferGeometryUtils.mergeGeometries( geometries );
            geometry.computeBoundingSphere();
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const texture = new THREE.TextureLoader().load( assetsPath + 'textures/minecraft/atlas.png' );
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.magFilter = THREE.NearestFilter;
        
            const mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { map: texture, side: THREE.DoubleSide } ) );
            scene.add( mesh );
        
            const ambientLight = new THREE.AmbientLight( 0xeeeeee, 3 );
            scene.add( ambientLight );
        
            const directionalLight = new THREE.DirectionalLight( 0xffffff, 12 );
            directionalLight.position.set( 1, 1, 0.5 ).normalize();
            scene.add( directionalLight );
        
        
            controls = new FirstPersonControls( camera, renderer.domElement );
        
            controls.movementSpeed = 1000;
            controls.lookSpeed = 0.125;
            controls.lookVertical = true;
        
          
            app.signal.onContainerSizeChange.add(() =>  controls.handleResize())
            app.signal.onAppUpdate.add(() => controls.update( clock.getDelta() ))
        }
        
        
        function generateHeight( width, height ) {
        
            const data = [], perlin = new ImprovedNoise(),
                size = width * height, z = Math.random() * 100;
        
            let quality = 2;
        
            for ( let j = 0; j < 4; j ++ ) {
        
                if ( j === 0 ) for ( let i = 0; i < size; i ++ ) data[ i ] = 0;
        
                for ( let i = 0; i < size; i ++ ) {
        
                    const x = i % width, y = ( i / width ) | 0;
                    data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;
        
        
                }
        
                quality *= 4;
        
            }
        
            return data;
        
        }
        
        function getY( x, z ) {
        
            return ( data[ x + z * worldWidth ] * 0.15 ) | 0;
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};