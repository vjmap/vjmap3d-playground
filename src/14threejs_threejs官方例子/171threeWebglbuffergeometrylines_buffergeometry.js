
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/171threeWebglbuffergeometrylines
        // --buffergeometry_lines--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_lines
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 27,
                near: 1,
                far: 4000,
                position: [0, 0, 2750]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        
        let line;
        
        const segments = 10000;
        const r = 800;
        let t = 0;
        
        init();
        
        function init() {
            //
            const geometry = new THREE.BufferGeometry();
            const material = new THREE.LineBasicMaterial( { vertexColors: true } );
        
            const positions = [];
            const colors = [];
        
            for ( let i = 0; i < segments; i ++ ) {
        
                const x = Math.random() * r - r / 2;
                const y = Math.random() * r - r / 2;
                const z = Math.random() * r - r / 2;
        
                // positions
        
                positions.push( x, y, z );
        
                // colors
        
                colors.push( ( x / r ) + 0.5 );
                colors.push( ( y / r ) + 0.5 );
                colors.push( ( z / r ) + 0.5 );
        
            }
        
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
            generateMorphTargets( geometry );
        
            geometry.computeBoundingSphere();
        
            line = new THREE.Line( geometry, material );
            scene.add( line );
        
           
            app.signal.onAppUpdate.add(animate)
        
        }
        
        //
        
        function animate(e) {
        
            const delta =  e.deltaTime;
            const time =  e.elapsedTime;
        
            line.rotation.x = time * 0.25;
            line.rotation.y = time * 0.5;
        
            t += delta * 0.5;
            line.morphTargetInfluences[ 0 ] = Math.abs( Math.sin( t ) );
         
        }
        
        function generateMorphTargets( geometry ) {
        
            const data = [];
        
            for ( let i = 0; i < segments; i ++ ) {
        
                const x = Math.random() * r - r / 2;
                const y = Math.random() * r - r / 2;
                const z = Math.random() * r - r / 2;
        
                data.push( x, y, z );
        
            }
        
            const morphTarget = new THREE.Float32BufferAttribute( data, 3 );
            morphTarget.name = 'target1';
        
            geometry.morphAttributes.position = [ morphTarget ];
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};