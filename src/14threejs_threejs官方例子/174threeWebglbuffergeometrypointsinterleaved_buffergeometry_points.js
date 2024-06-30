
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/174threeWebglbuffergeometrypointsinterleaved
        // --buffergeometry_points_interleaved--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_points_interleaved
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 27,
                near: 5,
                far: 3500,
                position: [0, 0, 2750]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let points;
        
        init();
        
        function init() {
        
        
            scene.background = new THREE.Color( 0x050505 );
            scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
        
            //
        
            const particles = 500000;
        
            const geometry = new THREE.BufferGeometry();
        
            // create a generic buffer of binary data (a single particle has 16 bytes of data)
        
            const arrayBuffer = new ArrayBuffer( particles * 16 );
        
            // the following typed arrays share the same buffer
        
            const interleavedFloat32Buffer = new Float32Array( arrayBuffer );
            const interleavedUint8Buffer = new Uint8Array( arrayBuffer );
        
            //
        
            const color = new THREE.Color();
        
            const n = 1000, n2 = n / 2; // particles spread in the cube
        
            for ( let i = 0; i < interleavedFloat32Buffer.length; i += 4 ) {
        
                // position (first 12 bytes)
        
                const x = Math.random() * n - n2;
                const y = Math.random() * n - n2;
                const z = Math.random() * n - n2;
        
                interleavedFloat32Buffer[ i + 0 ] = x;
                interleavedFloat32Buffer[ i + 1 ] = y;
                interleavedFloat32Buffer[ i + 2 ] = z;
        
                // color (last 4 bytes)
        
                const vx = ( x / n ) + 0.5;
                const vy = ( y / n ) + 0.5;
                const vz = ( z / n ) + 0.5;
        
                color.setRGB( vx, vy, vz, THREE.SRGBColorSpace );
        
                const j = ( i + 3 ) * 4;
        
                interleavedUint8Buffer[ j + 0 ] = color.r * 255;
                interleavedUint8Buffer[ j + 1 ] = color.g * 255;
                interleavedUint8Buffer[ j + 2 ] = color.b * 255;
                interleavedUint8Buffer[ j + 3 ] = 0; // not needed
        
            }
        
            const interleavedBuffer32 = new THREE.InterleavedBuffer( interleavedFloat32Buffer, 4 );
            const interleavedBuffer8 = new THREE.InterleavedBuffer( interleavedUint8Buffer, 16 );
        
            geometry.setAttribute( 'position', new THREE.InterleavedBufferAttribute( interleavedBuffer32, 3, 0, false ) );
            geometry.setAttribute( 'color', new THREE.InterleavedBufferAttribute( interleavedBuffer8, 3, 12, true ) );
        
            //
        
            const material = new THREE.PointsMaterial( { size: 15, vertexColors: true } );
        
            points = new THREE.Points( geometry, material );
            scene.add( points );
        
          
            app.signal.onAppUpdate.add(animate)
        
        }
        
        
        //
        
        function animate() {
        
            const time = Date.now() * 0.001;
        
            points.rotation.x = time * 0.25;
            points.rotation.y = time * 0.5;
          
        
        }
    }
    catch (e) {
        console.error(e);
    }
};