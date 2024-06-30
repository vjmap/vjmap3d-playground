
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/105threeWebglmorphtargets
        // --morphtargets--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_morphtargets
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x8FBCD4,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1,
                far: 20,
                position: [0, 0, 10]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh;
        
        init();
        
        function init() {
        
            scene.add( camera );
        
            scene.add( new THREE.AmbientLight( 0x8FBCD4, 1.5 ) );
        
            const pointLight = new THREE.PointLight( 0xffffff, 200 );
            camera.add( pointLight );
        
            const geometry = createGeometry();
        
            const material = new THREE.MeshPhongMaterial( {
                color: 0xff0000,
                flatShading: true
            } );
        
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            initGUI();
        
        }
        
        function createGeometry() {
        
            const geometry = new THREE.BoxGeometry( 2, 2, 2, 32, 32, 32 );
        
            // create an empty array to  hold targets for the attribute we want to morph
            // morphing positions and normals is supported
            geometry.morphAttributes.position = [];
        
            // the original positions of the cube's vertices
            const positionAttribute = geometry.attributes.position;
        
            // for the first morph target we'll move the cube's vertices onto the surface of a sphere
            const spherePositions = [];
        
            // for the second morph target, we'll twist the cubes vertices
            const twistPositions = [];
            const direction = new THREE.Vector3( 1, 0, 0 );
            const vertex = new THREE.Vector3();
        
            for ( let i = 0; i < positionAttribute.count; i ++ ) {
        
                const x = positionAttribute.getX( i );
                const y = positionAttribute.getY( i );
                const z = positionAttribute.getZ( i );
        
                spherePositions.push(
        
                    x * Math.sqrt( 1 - ( y * y / 2 ) - ( z * z / 2 ) + ( y * y * z * z / 3 ) ),
                    y * Math.sqrt( 1 - ( z * z / 2 ) - ( x * x / 2 ) + ( z * z * x * x / 3 ) ),
                    z * Math.sqrt( 1 - ( x * x / 2 ) - ( y * y / 2 ) + ( x * x * y * y / 3 ) )
        
                );
        
                // stretch along the x-axis so we can see the twist better
                vertex.set( x * 2, y, z );
        
                vertex.applyAxisAngle( direction, Math.PI * x / 2 ).toArray( twistPositions, twistPositions.length );
        
            }
        
            // add the spherical positions as the first morph target
            geometry.morphAttributes.position[ 0 ] = new THREE.Float32BufferAttribute( spherePositions, 3 );
        
            // add the twisted positions as the second morph target
            geometry.morphAttributes.position[ 1 ] = new THREE.Float32BufferAttribute( twistPositions, 3 );
        
            return geometry;
        
        }
        
        function initGUI() {
        
            // Set up dat.GUI to control targets
            const params = {
                Spherify: 0,
                Twist: 0,
            };
            const gui = new GUI( { title: 'Morph Targets' } );
        
            gui.add( params, 'Spherify', 0, 1 ).step( 0.01 ).onChange( function ( value ) {
        
                mesh.morphTargetInfluences[ 0 ] = value;
        
            } );
            gui.add( params, 'Twist', 0, 1 ).step( 0.01 ).onChange( function ( value ) {
        
                mesh.morphTargetInfluences[ 1 ] = value;
        
            } );
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};