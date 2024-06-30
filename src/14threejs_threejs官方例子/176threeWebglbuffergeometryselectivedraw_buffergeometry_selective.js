
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/176threeWebglbuffergeometryselectivedraw
        // --buffergeometry_selective_draw--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_selective_draw
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 0.01,
                far: 10,
                position: [0, 0, 3.5]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let geometry, mesh;
        const numLat = 100;
        const numLng = 200;
        let numLinesCulled = 0;
        
        init();
        
        async function init() {
            addLines( 1.0 );
           
            const ui = await app.getConfigPane()
            ui.appendChild({
                type: "button",
                label: "hideLines",
                value: () => {
                    hideLines()
                }
            })
            ui.appendChild({
                type: "button",
                label: "showAllLines",
                value: () => {
                    showAllLines()
                }
            })
        
        }
        
        function addLines( radius ) {
        
            geometry = new THREE.BufferGeometry();
            const linePositions = new Float32Array( numLat * numLng * 3 * 2 );
            const lineColors = new Float32Array( numLat * numLng * 3 * 2 );
            const visible = new Float32Array( numLat * numLng * 2 );
        
            for ( let i = 0; i < numLat; ++ i ) {
        
                for ( let j = 0; j < numLng; ++ j ) {
        
                    const lat = ( Math.random() * Math.PI ) / 50.0 + i / numLat * Math.PI;
                    const lng = ( Math.random() * Math.PI ) / 50.0 + j / numLng * 2 * Math.PI;
        
                    const index = i * numLng + j;
        
                    linePositions[ index * 6 + 0 ] = 0;
                    linePositions[ index * 6 + 1 ] = 0;
                    linePositions[ index * 6 + 2 ] = 0;
                    linePositions[ index * 6 + 3 ] = radius * Math.sin( lat ) * Math.cos( lng );
                    linePositions[ index * 6 + 4 ] = radius * Math.cos( lat );
                    linePositions[ index * 6 + 5 ] = radius * Math.sin( lat ) * Math.sin( lng );
        
                    const color = new THREE.Color( 0xffffff );
        
                    color.setHSL( lat / Math.PI, 1.0, 0.2 );
                    lineColors[ index * 6 + 0 ] = color.r;
                    lineColors[ index * 6 + 1 ] = color.g;
                    lineColors[ index * 6 + 2 ] = color.b;
        
                    color.setHSL( lat / Math.PI, 1.0, 0.7 );
                    lineColors[ index * 6 + 3 ] = color.r;
                    lineColors[ index * 6 + 4 ] = color.g;
                    lineColors[ index * 6 + 5 ] = color.b;
        
                    // non-0 is visible
                    visible[ index * 2 + 0 ] = 1.0;
                    visible[ index * 2 + 1 ] = 1.0;
        
                }
        
            }
        
            geometry.setAttribute( 'position', new THREE.BufferAttribute( linePositions, 3 ) );
            geometry.setAttribute( 'vertColor', new THREE.BufferAttribute( lineColors, 3 ) );
            geometry.setAttribute( 'visible', new THREE.BufferAttribute( visible, 1 ) );
        
            geometry.computeBoundingSphere();
        
            const shaderMaterial = new THREE.ShaderMaterial( {
        
                vertexShader: /* glsl */`
                    attribute float visible;
                    varying float vVisible;
                    attribute vec3 vertColor;
                    varying vec3 vColor;
        
                    void main() {
        
                        vColor = vertColor;
                        vVisible = visible;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
                    }
                `,
                fragmentShader: /* glsl */`
                    varying float vVisible;
                    varying vec3 vColor;
        
                    void main() {
        
                        if ( vVisible > 0.0 ) {
        
                            gl_FragColor = vec4( vColor, 1.0 );
        
                        } else {
        
                            discard;
        
                        }
        
                    }
                `,
            } );
        
            mesh = new THREE.LineSegments( geometry, shaderMaterial );
            scene.add( mesh );
        
            updateCount();
        
            app.signal.onAppUpdate.add(animate)
        }
        
        function updateCount() {
        
            const str = '1 draw call, ' + numLat * numLng + ' lines, ' + numLinesCulled + ' culled ';
            app.logInfo(str.replace( /\B(?=(\d{3})+(?!\d))/g, ',' ));
        
        }
        
        function hideLines() {
        
            for ( let i = 0; i < geometry.attributes.visible.array.length; i += 2 ) {
        
                if ( Math.random() > 0.75 ) {
        
                    if ( geometry.attributes.visible.array[ i + 0 ] ) {
        
                        ++ numLinesCulled;
        
                    }
        
                    geometry.attributes.visible.array[ i + 0 ] = 0;
                    geometry.attributes.visible.array[ i + 1 ] = 0;
        
                }
        
            }
        
            geometry.attributes.visible.needsUpdate = true;
        
            updateCount();
        
        }
        
        function showAllLines() {
        
            numLinesCulled = 0;
        
            for ( let i = 0; i < geometry.attributes.visible.array.length; i += 2 ) {
        
                geometry.attributes.visible.array[ i + 0 ] = 1;
                geometry.attributes.visible.array[ i + 1 ] = 1;
        
            }
        
            geometry.attributes.visible.needsUpdate = true;
        
            updateCount();
        
        }
        
        
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