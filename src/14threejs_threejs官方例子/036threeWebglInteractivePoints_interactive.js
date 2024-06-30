
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/036threeWebglInteractivePoints
        // --interactive_points--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_interactive_points
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1, 
                far: 10000,
                position: [0, 0, 250 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let particles;
        
        const PARTICLE_SIZE = 20;
        
        let  INTERSECTED;
        
        init();
        
        function init() {
        
            //
        
            let boxGeometry = new THREE.BoxGeometry( 200, 200, 200, 16, 16, 16 );
        
            // if normal and uv attributes are not removed, mergeVertices() can't consolidate indentical vertices with different normal/uv data
        
            boxGeometry.deleteAttribute( 'normal' );
            boxGeometry.deleteAttribute( 'uv' );
        
            boxGeometry = BufferGeometryUtils.mergeVertices( boxGeometry );
        
            //
        
            const positionAttribute = boxGeometry.getAttribute( 'position' );
        
            const colors = [];
            const sizes = [];
        
            const color = new THREE.Color();
        
            for ( let i = 0, l = positionAttribute.count; i < l; i ++ ) {
        
                color.setHSL( 0.01 + 0.1 * ( i / l ), 1.0, 0.5 );
                color.toArray( colors, i * 3 );
        
                sizes[ i ] = PARTICLE_SIZE * 0.5;
        
            }
        
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', positionAttribute );
            geometry.setAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
            geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) );
        
            //
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const material = new THREE.ShaderMaterial( {
        
                uniforms: {
                    color: { value: new THREE.Color( 0xffffff ) },
                    pointTexture: { value: new THREE.TextureLoader().load( assetsPath + 'textures/sprites/disc.png' ) },
                    alphaTest: { value: 0.9 }
                },
                vertexShader: /* glsl */ `
                attribute float size;
        			attribute vec3 customColor;
        
        			varying vec3 vColor;
        
        			void main() {
        
        				vColor = customColor;
        
        				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        
        				gl_PointSize = size * ( 300.0 / -mvPosition.z );
        
        				gl_Position = projectionMatrix * mvPosition;
        
        			}
                `,
                fragmentShader: /* glsl */ `
                uniform vec3 color;
        			uniform sampler2D pointTexture;
        			uniform float alphaTest;
        
        			varying vec3 vColor;
        
        			void main() {
        
        				gl_FragColor = vec4( color * vColor, 1.0 );
        
        				gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
        
        				if ( gl_FragColor.a < alphaTest ) discard;
        
        			}
                `
        
            } );
        
            //
        
            particles = new THREE.Points( geometry, material );
            scene.add( particles );
            let entity = vjmap3d.Entity.attchObject(particles); // 只有变成entity才能queryEntitiesByScreenPos查询
        
            entity.addAction(() => {
                entity.rotation.x += 0.0005;
                entity.rotation.y += 0.001;
            })
        
            app.signal.onAppRender.add(e => {
                const geometry = particles.geometry;
                const attributes = geometry.attributes;
                let io = app.queryEntitiesByScreenPos(app.Input.x(), app.Input.y());
                if (io?.intersection) {
                    if ( INTERSECTED != io.intersection.index ) {
        
                        attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
            
                        INTERSECTED = io.intersection.index;
            
                        attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE * 1.25;
                        attributes.size.needsUpdate = true;
            
                    }
                } else {
                    attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
                    attributes.size.needsUpdate = true;
                    INTERSECTED = null;
                }
             })
        
        }
    }
    catch (e) {
        console.error(e);
    }
};