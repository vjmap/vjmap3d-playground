
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/163threeWebglbuffergeometryCompression
        // --buffergeometry_compression--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_compression
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 50,
                near: 1,
                far: 1000,
                position: [  0, 0, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let gui;
        
        
        const lights = [];
        
        // options
        const data = {
            'model': 'Icosahedron',
            'wireframe': false,
            'texture': false,
            'detail': 4,
        
            'QuantizePosEncoding': false,
            'NormEncodingMethods': 'None', // for normal encodings
            'DefaultUVEncoding': false,
        
            'totalGPUMemory': '0 bytes'
        };
        let memoryDisplay;
        
        // geometry params
        const radius = 100;
        
        // materials
        const lineMaterial = new THREE.LineBasicMaterial( { color: 0xaaaaaa, transparent: true, opacity: 0.8 } );
        const meshMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        // texture
        const texture = new THREE.TextureLoader().load(assetsPath + 'textures/uv_grid_opengl.jpg' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        
        //
        init();
        
        function init() {
        
        
            camera.position.setScalar( 2 * radius );
            app.cameraControl.setLookAt(-200, 200, 200, 0, 0, 0)
            //
        
            scene.add( new THREE.AmbientLight( 0xffffff, 0.3 ) );
        
            lights[ 0 ] = new THREE.DirectionalLight( 0xffffff, 2.5 );
            lights[ 1 ] = new THREE.DirectionalLight( 0xffffff, 2.5 );
            lights[ 2 ] = new THREE.DirectionalLight( 0xffffff, 2.5 );
        
            lights[ 0 ].position.set( 0, 2 * radius, 0 );
            lights[ 1 ].position.set( 2 * radius, - 2 * radius, 2 * radius );
            lights[ 2 ].position.set( - 2 * radius, - 2 * radius, - 2 * radius );
        
            scene.add( lights[ 0 ] );
            scene.add( lights[ 1 ] );
            scene.add( lights[ 2 ] );
        
            //
        
            scene.add( new THREE.AxesHelper( radius * 5 ) );
        
            //
        
            let geom = newGeometry( data );
        
            const mesh = new THREE.Mesh( geom, meshMaterial );
            scene.add( mesh );
        
            const lineSegments = new THREE.LineSegments( new THREE.WireframeGeometry( geom ), lineMaterial );
            lineSegments.visible = data.wireframe;
        
            scene.add( lineSegments );
        
            //
        
            gui = new GUI();
            gui.width = 350;
        
            function newGeometry( data ) {
        
                switch ( data.model ) {
        
                    case 'Icosahedron':
                        return new THREE.IcosahedronGeometry( radius, data.detail );
                    case 'Cylinder':
                        return new THREE.CylinderGeometry( radius / 1.5, radius / 1.5, radius, data.detail * 6 );
                    case 'Teapot':
                        return new TeapotGeometry( radius / 1.5, data.detail * 3, true, true, true, true, true );
                    case 'TorusKnot':
                        return new THREE.TorusKnotGeometry( radius / 2, 10, data.detail * 30, data.detail * 6, 3, 4 );
        
                }
        
            }
        
            function generateGeometry() {
        
                geom = newGeometry( data );
        
                updateGroupGeometry( mesh, lineSegments, geom, data );
        
            }
        
            function updateLineSegments() {
        
                lineSegments.visible = data.wireframe;
        
            }
        
            let folder = gui.addFolder( 'Scene' );
            folder.add( data, 'model', [ 'Icosahedron', 'Cylinder', 'TorusKnot', 'Teapot' ] ).onChange( generateGeometry );
            folder.add( data, 'wireframe', false ).onChange( updateLineSegments );
            folder.add( data, 'texture', false ).onChange( generateGeometry );
            folder.add( data, 'detail', 1, 8, 1 ).onChange( generateGeometry );
            folder.open();
        
            folder = gui.addFolder( 'Position Compression' );
            folder.add( data, 'QuantizePosEncoding', false ).onChange( generateGeometry );
            folder.open();
        
            folder = gui.addFolder( 'Normal Compression' );
            folder.add( data, 'NormEncodingMethods', [ 'None', 'DEFAULT', 'OCT1Byte', 'OCT2Byte', 'ANGLES' ] ).onChange( generateGeometry );
            folder.open();
        
            folder = gui.addFolder( 'UV Compression' );
            folder.add( data, 'DefaultUVEncoding', false ).onChange( generateGeometry );
            folder.open();
        
            folder = gui.addFolder( 'Memory Info' );
            folder.open();
            memoryDisplay = folder.add( data, 'totalGPUMemory', '0 bytes' );
            computeGPUMemory( mesh );
        
        
        }
        
        //
        
        function updateGroupGeometry( mesh, lineSegments, geometry, data ) {
        
            // dispose first
        
            lineSegments.geometry.dispose();
            mesh.geometry.dispose();
            mesh.material.dispose();
            if ( mesh.material.map ) mesh.material.map.dispose();
        
            lineSegments.geometry = new THREE.WireframeGeometry( geometry );
            mesh.geometry = geometry;
            mesh.material = new THREE.MeshPhongMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
            mesh.material.map = data.texture ? texture : null;
        
            if ( data[ 'QuantizePosEncoding' ] ) {
        
                GeometryCompressionUtils.compressPositions( mesh );
        
            }
        
            if ( data[ 'NormEncodingMethods' ] !== 'None' ) {
        
                GeometryCompressionUtils.compressNormals( mesh, data[ 'NormEncodingMethods' ] );
        
            }
        
            if ( data[ 'DefaultUVEncoding' ] ) {
        
                GeometryCompressionUtils.compressUvs( mesh );
        
            }
        
            computeGPUMemory( mesh );
        
        }
        
        
        function computeGPUMemory( mesh ) {
        
            // Use BufferGeometryUtils to do memory calculation
        
            memoryDisplay.setValue( BufferGeometryUtils.estimateBytesUsed( mesh.geometry ) + ' bytes' );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};