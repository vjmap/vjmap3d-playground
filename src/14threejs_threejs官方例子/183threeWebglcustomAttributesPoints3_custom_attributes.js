
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/183threeWebglcustomAttributesPoints3
        // --custom_attributes_points3--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_custom_attributes_points3
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 1000,
                position: [0, 0, 500]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let object;
        
        let vertices1;
        
        init();
        
        function init() {
        
        
            let radius = 100;
            const inner = 0.6 * radius;
            const vertex = new THREE.Vector3();
            const vertices = [];
        
            for ( let i = 0; i < 100000; i ++ ) {
        
                vertex.x = Math.random() * 2 - 1;
                vertex.y = Math.random() * 2 - 1;
                vertex.z = Math.random() * 2 - 1;
                vertex.multiplyScalar( radius );
        
                if ( ( vertex.x > inner || vertex.x < - inner ) ||
                    ( vertex.y > inner || vertex.y < - inner ) ||
                    ( vertex.z > inner || vertex.z < - inner ) )
        
                    vertices.push( vertex.x, vertex.y, vertex.z );
        
            }
        
            vertices1 = vertices.length / 3;
        
            radius = 200;
        
            let boxGeometry1 = new THREE.BoxGeometry( radius, 0.1 * radius, 0.1 * radius, 50, 5, 5 );
        
            // if normal and uv attributes are not removed, mergeVertices() can't consolidate indentical vertices with different normal/uv data
        
            boxGeometry1.deleteAttribute( 'normal' );
            boxGeometry1.deleteAttribute( 'uv' );
        
            boxGeometry1 = BufferGeometryUtils.mergeVertices( boxGeometry1 );
        
            const matrix = new THREE.Matrix4();
            const position = new THREE.Vector3();
            const rotation = new THREE.Euler();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3( 1, 1, 1 );
        
            function addGeo( geo, x, y, z, ry ) {
        
                position.set( x, y, z );
                rotation.set( 0, ry, 0 );
        
                matrix.compose( position, quaternion.setFromEuler( rotation ), scale );
        
                const positionAttribute = geo.getAttribute( 'position' );
        
                for ( let i = 0, l = positionAttribute.count; i < l; i ++ ) {
        
                    vertex.fromBufferAttribute( positionAttribute, i );
                    vertex.applyMatrix4( matrix );
                    vertices.push( vertex.x, vertex.y, vertex.z );
        
                }
        
            }
        
            // side 1
        
            addGeo( boxGeometry1, 0, 110, 110, 0 );
            addGeo( boxGeometry1, 0, 110, - 110, 0 );
            addGeo( boxGeometry1, 0, - 110, 110, 0 );
            addGeo( boxGeometry1, 0, - 110, - 110, 0 );
        
            // side 2
        
            addGeo( boxGeometry1, 110, 110, 0, Math.PI / 2 );
            addGeo( boxGeometry1, 110, - 110, 0, Math.PI / 2 );
            addGeo( boxGeometry1, - 110, 110, 0, Math.PI / 2 );
            addGeo( boxGeometry1, - 110, - 110, 0, Math.PI / 2 );
        
            // corner edges
        
            let boxGeometry2 = new THREE.BoxGeometry( 0.1 * radius, radius * 1.2, 0.1 * radius, 5, 60, 5 );
        
            boxGeometry2.deleteAttribute( 'normal' );
            boxGeometry2.deleteAttribute( 'uv' );
        
            boxGeometry2 = BufferGeometryUtils.mergeVertices( boxGeometry2 );
        
            addGeo( boxGeometry2, 110, 0, 110, 0 );
            addGeo( boxGeometry2, 110, 0, - 110, 0 );
            addGeo( boxGeometry2, - 110, 0, 110, 0 );
            addGeo( boxGeometry2, - 110, 0, - 110, 0 );
        
            const positionAttribute = new THREE.Float32BufferAttribute( vertices, 3 );
        
            const colors = [];
            const sizes = [];
        
            const color = new THREE.Color();
        
            for ( let i = 0; i < positionAttribute.count; i ++ ) {
        
                if ( i < vertices1 ) {
        
                    color.setHSL( 0.5 + 0.2 * ( i / vertices1 ), 1, 0.5 );
        
                } else {
        
                    color.setHSL( 0.1, 1, 0.5 );
        
                }
        
                color.toArray( colors, i * 3 );
        
                sizes[ i ] = i < vertices1 ? 10 : 40;
        
            }
        
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', positionAttribute );
            geometry.setAttribute( 'ca', new THREE.Float32BufferAttribute( colors, 3 ) );
            geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) );
        
            //
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const texture = new THREE.TextureLoader().load( assetsPath + 'textures/sprites/ball.png' );
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        
            const material = new THREE.ShaderMaterial( {
        
                uniforms: {
                    amplitude: { value: 1.0 },
                    color: { value: new THREE.Color( 0xffffff ) },
                    pointTexture: { value: texture }
                },
                vertexShader: /* glsl */`
                    attribute float size;
        			attribute vec4 ca;
        
        			varying vec4 vColor;
        
        			void main() {
        
        				vColor = ca;
        
        				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        
        				gl_PointSize = size * ( 150.0 / -mvPosition.z );
        
        				gl_Position = projectionMatrix * mvPosition;
        
        			}
                `,
                fragmentShader: /* glsl */`
                   uniform vec3 color;
        			uniform sampler2D pointTexture;
        
        			varying vec4 vColor;
        
        			void main() {
        
        				vec4 outColor = texture2D( pointTexture, gl_PointCoord );
        
        				if ( outColor.a < 0.5 ) discard;
        
        				gl_FragColor = outColor * vec4( color * vColor.xyz, 1.0 );
        
        				float depth = gl_FragCoord.z / gl_FragCoord.w;
        				const vec3 fogColor = vec3( 0.0 );
        
        				float fogFactor = smoothstep( 200.0, 600.0, depth );
        				gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
        
        			}
        
                `,
        
            } );
        
            //
        
            object = new THREE.Points( geometry, material );
            scene.add( object );
        
           
            app.signal.onAppUpdate.add(render)
        }
        
        
        function render() {
        
            const time = Date.now() * 0.01;
        
            object.rotation.y = object.rotation.z = 0.02 * time;
        
            const geometry = object.geometry;
            const attributes = geometry.attributes;
        
            for ( let i = 0; i < attributes.size.array.length; i ++ ) {
        
                if ( i < vertices1 ) {
        
                    attributes.size.array[ i ] = Math.max( 0, 26 + 32 * Math.sin( 0.1 * i + 0.6 * time ) );
        
                }
        
            }
        
            attributes.size.needsUpdate = true;
        
           
        }
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};