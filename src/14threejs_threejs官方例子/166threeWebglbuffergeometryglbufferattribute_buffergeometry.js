
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/166threeWebglbuffergeometryglbufferattribute
        // --buffergeometry_glbufferattribute--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_glbufferattribute
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x050505,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 27,
                near: 5,
                far: 3500,
                position: [0, 0, 2750]
            },
            control: {
                minDistance: 1000,
                maxDistance: 3000
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        
        
        let points;
        
        const particles = 300000;
        let drawCount = 10000;
        
        init();
        animate();
        
        function init() {
        
            scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
        
            //
        
            const geometry = new THREE.BufferGeometry();
        
            const positions = [];
            const positions2 = [];
            const colors = [];
        
            const color = new THREE.Color();
        
            const n = 1000, n2 = n / 2; // particles spread in the cube
        
            for ( let i = 0; i < particles; i ++ ) {
        
                // positions
        
                const x = Math.random() * n - n2;
                const y = Math.random() * n - n2;
                const z = Math.random() * n - n2;
        
                positions.push( x, y, z );
                positions2.push( z * 0.3, x * 0.3, y * 0.3 );
        
                // colors
        
                const vx = ( x / n ) + 0.5;
                const vy = ( y / n ) + 0.5;
                const vz = ( z / n ) + 0.5;
        
                color.setRGB( vx, vy, vz, THREE.SRGBColorSpace );
        
                colors.push( color.r, color.g, color.b );
        
            }
        
            const gl = renderer.getContext();
        
            const pos = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, pos );
            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( positions ), gl.STATIC_DRAW );
        
            const pos2 = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, pos2 );
            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( positions2 ), gl.STATIC_DRAW );
        
            const rgb = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, rgb );
            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );
        
            const posAttr1 = new THREE.GLBufferAttribute( pos, gl.FLOAT, 3, 4, particles );
            const posAttr2 = new THREE.GLBufferAttribute( pos2, gl.FLOAT, 3, 4, particles );
            geometry.setAttribute( 'position', posAttr1 );
        
            setInterval( function () {
        
                const attr = geometry.getAttribute( 'position' );
        
                geometry.setAttribute( 'position', ( attr === posAttr1 ) ? posAttr2 : posAttr1 );
        
            }, 2000 );
        
            geometry.setAttribute( 'color', new THREE.GLBufferAttribute( rgb, gl.FLOAT, 3, 4, particles ) );
        
            //
        
            const material = new THREE.PointsMaterial( { size: 15, vertexColors: true } );
        
            points = new THREE.Points( geometry, material );
        
            geometry.boundingSphere = new THREE.Sphere().set( new THREE.Vector3(), 500 );
        
            scene.add( points );
        
            app.signal.onAppUpdate.add(animate)
           
        
        }
        
        
        function animate() {
        
            drawCount = ( Math.max( 5000, drawCount ) + Math.floor( 500 * Math.random() ) ) % particles;
            points.geometry.setDrawRange( 0, drawCount );
        
            const time = Date.now() * 0.001;
        
            points.rotation.x = time * 0.1;
            points.rotation.y = time * 0.2;
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};