
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/167threeWebglbuffergeometryindexed
        // --buffergeometry_indexed--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_indexed
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x050505,
                defaultLights: false
            },
            camera: {
                fov: 27,
                near: 5,
                far: 3500,
                position: [0, 0, 64]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        
        
        let mesh;
        
        init();
        
        function init() {
        
            scene.background = new THREE.Color( 0x050505 );
        
            //
        
            const light = new THREE.HemisphereLight();
            light.intensity = 3;
            scene.add( light );
        
            //
        
            const geometry = new THREE.BufferGeometry();
        
            const indices = [];
        
            const vertices = [];
            const normals = [];
            const colors = [];
        
            const size = 20;
            const segments = 10;
        
            const halfSize = size / 2;
            const segmentSize = size / segments;
        
            const _color = new THREE.Color();
        
            // generate vertices, normals and color data for a simple grid geometry
        
            for ( let i = 0; i <= segments; i ++ ) {
        
                const y = ( i * segmentSize ) - halfSize;
        
                for ( let j = 0; j <= segments; j ++ ) {
        
                    const x = ( j * segmentSize ) - halfSize;
        
                    vertices.push( x, - y, 0 );
                    normals.push( 0, 0, 1 );
        
                    const r = ( x / size ) + 0.5;
                    const g = ( y / size ) + 0.5;
        
                    _color.setRGB( r, g, 1, THREE.SRGBColorSpace );
        
                    colors.push( _color.r, _color.g, _color.b );
        
                }
        
            }
        
            // generate indices (data for element array buffer)
        
            for ( let i = 0; i < segments; i ++ ) {
        
                for ( let j = 0; j < segments; j ++ ) {
        
                    const a = i * ( segments + 1 ) + ( j + 1 );
                    const b = i * ( segments + 1 ) + j;
                    const c = ( i + 1 ) * ( segments + 1 ) + j;
                    const d = ( i + 1 ) * ( segments + 1 ) + ( j + 1 );
        
                    // generate two faces (triangles) per iteration
        
                    indices.push( a, b, d ); // face one
                    indices.push( b, c, d ); // face two
        
                }
        
            }
        
            //
        
            geometry.setIndex( indices );
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        
            const material = new THREE.MeshPhongMaterial( {
                side: THREE.DoubleSide,
                vertexColors: true
            } );
        
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
          
        
            const gui = new GUI();
            gui.add( material, 'wireframe' );
        
            app.signal.onAppUpdate.add(animate)
           
        }
        
        //
        
        function animate() {
        
            const time = Date.now() * 0.001;
        
            mesh.rotation.x = time * 0.25;
            mesh.rotation.y = time * 0.5;
        
            
        
        }
    }
    catch (e) {
        console.error(e);
    }
};