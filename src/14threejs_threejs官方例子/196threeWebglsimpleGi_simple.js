
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/196threeWebglsimpleGi
        // --simple_gi--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_simple_gi
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 0.1,
                far: 100,
                position: [0, 0, 4 ]
            },
            control: {
                minDistance: 1,
                maxDistance: 10
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let torusKnot
        class GIMesh extends THREE.Mesh {
        
            copy( source ) {
        
                super.copy( source );
        
                this.geometry = source.geometry.clone();
        
                return this;
        
            }
        
        }
        
        //
        
        const SimpleGI = function ( renderer, scene ) {
        
            const SIZE = 32, SIZE2 = SIZE * SIZE;
        
            const camera = new THREE.PerspectiveCamera( 90, 1, 0.01, 100 );
        
            scene.updateMatrixWorld( true );
        
            let clone = scene.clone();
            clone.matrixWorldAutoUpdate = false;
        
            const rt = new THREE.WebGLRenderTarget( SIZE, SIZE );
        
            const normalMatrix = new THREE.Matrix3();
        
            const position = new THREE.Vector3();
            const normal = new THREE.Vector3();
        
            let bounces = 0;
            let currentVertex = 0;
        
            const color = new Float32Array( 3 );
            const buffer = new Uint8Array( SIZE2 * 4 );
        
            function compute() {
        
                if ( bounces === 3 ) return;
        
                const object = torusKnot; // torusKnot
                const geometry = object.geometry;
        
                const attributes = geometry.attributes;
                const positions = attributes.position.array;
                const normals = attributes.normal.array;
        
                if ( attributes.color === undefined ) {
        
                    const colors = new Float32Array( positions.length );
                    geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );
        
                }
        
                const colors = attributes.color.array;
        
                const startVertex = currentVertex;
                const totalVertex = positions.length / 3;
        
                for ( let i = 0; i < 32; i ++ ) {
        
                    if ( currentVertex >= totalVertex ) break;
        
                    position.fromArray( positions, currentVertex * 3 );
                    position.applyMatrix4( object.matrixWorld );
        
                    normal.fromArray( normals, currentVertex * 3 );
                    normal.applyMatrix3( normalMatrix.getNormalMatrix( object.matrixWorld ) ).normalize();
        
                    camera.position.copy( position );
                    camera.lookAt( position.add( normal ) );
        
                    renderer.setRenderTarget( rt );
                    renderer.render( clone, camera );
        
                    renderer.readRenderTargetPixels( rt, 0, 0, SIZE, SIZE, buffer );
        
                    color[ 0 ] = 0;
                    color[ 1 ] = 0;
                    color[ 2 ] = 0;
        
                    for ( let k = 0, kl = buffer.length; k < kl; k += 4 ) {
        
                        color[ 0 ] += buffer[ k + 0 ];
                        color[ 1 ] += buffer[ k + 1 ];
                        color[ 2 ] += buffer[ k + 2 ];
        
                    }
        
                    colors[ currentVertex * 3 + 0 ] = color[ 0 ] / ( SIZE2 * 255 );
                    colors[ currentVertex * 3 + 1 ] = color[ 1 ] / ( SIZE2 * 255 );
                    colors[ currentVertex * 3 + 2 ] = color[ 2 ] / ( SIZE2 * 255 );
        
                    currentVertex ++;
        
                }
        
                attributes.color.addUpdateRange( startVertex * 3, ( currentVertex - startVertex ) * 3 );
                attributes.color.needsUpdate = true;
        
                if ( currentVertex >= totalVertex ) {
        
                    clone = scene.clone();
                    clone.matrixWorldAutoUpdate = false;
        
                    bounces ++;
                    currentVertex = 0;
        
                }
        
                requestAnimationFrame( compute );
        
            }
        
            requestAnimationFrame( compute );
        
        };
        
        //
        
        
        init();
        
        function init() {
        
            // torus knot
        
            const torusGeometry = new THREE.TorusKnotGeometry( 0.75, 0.3, 128, 32, 1 );
            const material = new THREE.MeshBasicMaterial( { vertexColors: true } );
        
            torusKnot = new GIMesh( torusGeometry, material );
            scene.add( torusKnot );
        
            // room
        
            const materials = [];
        
            for ( let i = 0; i < 8; i ++ ) {
        
                materials.push( new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, side: THREE.BackSide } ) );
        
            }
        
            const boxGeometry = new THREE.BoxGeometry( 3, 3, 3 );
        
            const box = new THREE.Mesh( boxGeometry, materials );
            scene.add( box );
        
            //
        
           
        
            new SimpleGI( renderer, scene );
        
            app.signal.onAppBeforeRender.add(() => {
                renderer.setRenderTarget( null );
            })
        
        }
    }
    catch (e) {
        console.error(e);
    }
};