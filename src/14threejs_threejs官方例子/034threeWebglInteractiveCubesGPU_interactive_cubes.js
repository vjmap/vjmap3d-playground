
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/034threeWebglInteractiveCubesGPU
        // --interactive_cubes_gpu--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_interactive_cubes_gpu
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xffffff,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 1, 
                far: 10000,
                position: [0, 0, 1000 ]
            },
            postProcess: {
                enable: false,
            },
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let pickingTexture, pickingScene;
        let highlightBox;
        
        const pickingData = [];
        const offset = new THREE.Vector3( 10, 10, 10 );
        const clearColor = new THREE.Color();
        
        init();
        
        function init() {
            scene.add( new THREE.AmbientLight( 0xcccccc ) );
        
            const light = new THREE.DirectionalLight( 0xffffff, 3 );
            light.position.set( 0, 500, 2000 );
            scene.add( light );
        
            const defaultMaterial = new THREE.MeshPhongMaterial( {
                color: 0xffffff,
                flatShading: true,
                vertexColors: true,
                shininess: 0
            } );
        
            // set up the picking texture to use a 32 bit integer so we can write and read integer ids from it
            pickingScene = new THREE.Scene();
            pickingTexture = new THREE.WebGLRenderTarget( 1, 1, {
        
                type: THREE.IntType,
                format: THREE.RGBAIntegerFormat,
                internalFormat: 'RGBA32I',
        
            } );
            const pickingMaterial = new THREE.ShaderMaterial( {
        
                glslVersion: THREE.GLSL3,
        
                vertexShader: /* glsl */`
                    attribute int id;
                    flat varying int vid;
                    void main() {
        
                        vid = id;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
                    }
                `,
        
                fragmentShader: /* glsl */`
                    layout(location = 0) out int out_id;
                    flat varying int vid;
        
                    void main() {
        
                        out_id = vid;
        
                    }
                `,
        
            } );
        
            function applyId( geometry, id ) {
        
                const position = geometry.attributes.position;
                const array = new Int16Array( position.count );
                array.fill( id );
        
                const bufferAttribute = new THREE.Int16BufferAttribute( array, 1, false );
                bufferAttribute.gpuType = THREE.IntType;
                geometry.setAttribute( 'id', bufferAttribute );
        
            }
        
            function applyVertexColors( geometry, color ) {
        
                const position = geometry.attributes.position;
                const colors = [];
        
                for ( let i = 0; i < position.count; i ++ ) {
        
                    colors.push( color.r, color.g, color.b );
        
                }
        
                geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        
            }
        
            const geometries = [];
            const matrix = new THREE.Matrix4();
            const quaternion = new THREE.Quaternion();
            const color = new THREE.Color();
        
            for ( let i = 0; i < 5000; i ++ ) {
        
                const geometry = new THREE.BoxGeometry();
        
                const position = new THREE.Vector3();
                position.x = Math.random() * 10000 - 5000;
                position.y = Math.random() * 6000 - 3000;
                position.z = Math.random() * 8000 - 4000;
        
                const rotation = new THREE.Euler();
                rotation.x = Math.random() * 2 * Math.PI;
                rotation.y = Math.random() * 2 * Math.PI;
                rotation.z = Math.random() * 2 * Math.PI;
        
                const scale = new THREE.Vector3();
                scale.x = Math.random() * 200 + 100;
                scale.y = Math.random() * 200 + 100;
                scale.z = Math.random() * 200 + 100;
        
                quaternion.setFromEuler( rotation );
                matrix.compose( position, quaternion, scale );
        
                geometry.applyMatrix4( matrix );
        
                // give the geometry's vertices a random color to be displayed and an integer
                // identifier as a vertex attribute so boxes can be identified after being merged.
                applyVertexColors( geometry, color.setHex( Math.random() * 0xffffff ) );
                applyId( geometry, i );
        
                geometries.push( geometry );
        
                pickingData[ i ] = {
        
                    position: position,
                    rotation: rotation,
                    scale: scale
        
                };
        
            }
        
            const mergedGeometry = BufferGeometryUtils.mergeGeometries( geometries );
            scene.add( new THREE.Mesh( mergedGeometry, defaultMaterial ) );
            pickingScene.add( new THREE.Mesh( mergedGeometry, pickingMaterial ) );
        
            highlightBox = new THREE.Mesh(
                new THREE.BoxGeometry(),
                new THREE.MeshLambertMaterial( { color: 0xffff00 } )
            );
            scene.add( highlightBox );
        
            app.signal.onAppBeforeUpdate.add(render);
        }
        
        function pick() {
        
            // render the picking scene off-screen
            // set the view offset to represent just a single pixel under the mouse
            const dpr = window.devicePixelRatio;
            camera.setViewOffset(
                renderer.domElement.width, renderer.domElement.height,
                Math.floor( app.Input.x() * dpr ), Math.floor(app.Input.y() * dpr ),
                1, 1
            );
        
            // render the scene
            renderer.setRenderTarget( pickingTexture );
        
            // clear the background to - 1 meaning no item was hit
            clearColor.setRGB( - 1, - 1, - 1 );
            renderer.setClearColor( clearColor );
            renderer.render( pickingScene, camera );
        
            // clear the view offset so rendering returns to normal
            camera.clearViewOffset();
        
            // create buffer for reading single pixel
            const pixelBuffer = new Int32Array( 4 );
        
            // read the pixel
            renderer
                .readRenderTargetPixelsAsync( pickingTexture, 0, 0, 1, 1, pixelBuffer )
                .then( () => {
        
                    const id = pixelBuffer[ 0 ];
                    if ( id !== - 1 ) {
        
                        // move our highlightBox so that it surrounds the picked object
                        const data = pickingData[ id ];
                        highlightBox.position.copy( data.position );
                        highlightBox.rotation.copy( data.rotation );
                        highlightBox.scale.copy( data.scale ).add( offset );
                        highlightBox.visible = true;
        
                    } else {
        
                        highlightBox.visible = false;
        
                    }
        
                } );
        
        }
        
        function render() {
        
            pick();
        
            renderer.setRenderTarget( null );
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};