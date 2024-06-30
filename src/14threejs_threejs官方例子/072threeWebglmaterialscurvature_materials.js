
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/072threeWebglmaterialscurvature
        // --materials_curvature--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_curvature
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 75,
                near: 0.1,
                far: 1000,
                position: [-23, 2, 24]
            },
            control: {
                minDistance: 20,
                maxDistance: 100
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let ninjaMeshRaw, curvatureAttribute, bufferGeo;
        
        init();
        
        //returns average of elements in a dictionary
        function average( dict ) {
        
            let sum = 0;
            let length = 0;
        
            Object.keys( dict ).forEach( function ( key ) {
        
                sum += dict[ key ];
                length ++;
        
            } );
        
            return sum / length;
        
        }
        
        //clamp a number between min and max
        function clamp( number, min, max ) {
        
            return Math.max( min, Math.min( number, max ) );
        
        }
        
        //filter the curvature array to only show concave values
        function filterConcave( curvature ) {
        
            for ( let i = 0; i < curvature.length; i ++ ) {
        
                curvature[ i ] = Math.abs( clamp( curvature[ i ], - 1, 0 ) );
        
            }
        
        }
        
        //filter the curvature array to only show convex values
        function filterConvex( curvature ) {
        
            for ( let i = 0; i < curvature.length; i ++ ) {
        
                curvature[ i ] = clamp( curvature[ i ], 0, 1 );
        
            }
        
        }
        
        //filter the curvature array to show both the concave and convex values
        function filterBoth( curvature ) {
        
            for ( let i = 0; i < curvature.length; i ++ ) {
        
                curvature[ i ] = Math.abs( curvature[ i ] );
        
            }
        
        }
        
        //initialize the scene
        function init() {
        
           
            renderer.autoClear = false;
        
          
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = vjmap3d.LoadManager.objLoader;
            //load the obj
            loader.load( assetsPath + 'models/obj/ninja/ninjaHead_Low.obj', function ( object ) {
        
                object.traverse( function ( child ) {
        
                    if ( child.isMesh ) {
        
                        bufferGeo = child.geometry;
                        bufferGeo.center();
                        const dict = {};
        
                        for ( let i = 0; i < bufferGeo.attributes.position.count; i += 3 ) {
        
                            //create a dictionary of every position, and its neighboring positions
                            const array = bufferGeo.attributes.position.array;
                            const normArray = bufferGeo.attributes.normal.array;
        
                            const posA = new THREE.Vector3( array[ 3 * i ], array[ 3 * i + 1 ], array[ 3 * i + 2 ] );
                            const posB = new THREE.Vector3( array[ 3 * ( i + 1 ) ], array[ 3 * ( i + 1 ) + 1 ], array[ 3 * ( i + 1 ) + 2 ] );
                            const posC = new THREE.Vector3( array[ 3 * ( i + 2 ) ], array[ 3 * ( i + 2 ) + 1 ], array[ 3 * ( i + 2 ) + 2 ] );
        
                            const normA = new THREE.Vector3( normArray[ 3 * i ], normArray[ 3 * i + 1 ], normArray[ 3 * i + 2 ] ).normalize();
                            const normB = new THREE.Vector3( normArray[ 3 * ( i + 1 ) ], normArray[ 3 * ( i + 1 ) + 1 ], normArray[ 3 * ( i + 1 ) + 2 ] ).normalize();
                            const normC = new THREE.Vector3( normArray[ 3 * ( i + 2 ) ], normArray[ 3 * ( i + 2 ) + 1 ], normArray[ 3 * ( i + 2 ) + 2 ] ).normalize();
        
                            const strA = posA.toArray().toString();
                            const strB = posB.toArray().toString();
                            const strC = posC.toArray().toString();
        
                            const posB_A = new THREE.Vector3().subVectors( posB, posA );
                            const posB_C = new THREE.Vector3().subVectors( posB, posC );
                            const posC_A = new THREE.Vector3().subVectors( posC, posA );
        
                            const b2a = normB.dot( posB_A.normalize() );
                            const b2c = normB.dot( posB_C.normalize() );
                            const c2a = normC.dot( posC_A.normalize() );
        
                            const a2b = - normA.dot( posB_A.normalize() );
                            const c2b = - normC.dot( posB_C.normalize() );
                            const a2c = - normA.dot( posC_A.normalize() );
        
                            if ( dict[ strA ] === undefined ) {
        
                                dict[ strA ] = {};
        
                            }
        
                            if ( dict[ strB ] === undefined ) {
        
                                dict[ strB ] = {};
        
                            }
        
                            if ( dict[ strC ] === undefined ) {
        
                                dict[ strC ] = {};
        
                            }
        
                            dict[ strA ][ strB ] = a2b;
                            dict[ strA ][ strC ] = a2c;
                            dict[ strB ][ strA ] = b2a;
                            dict[ strB ][ strC ] = b2c;
                            dict[ strC ][ strA ] = c2a;
                            dict[ strC ][ strB ] = c2b;
        
                        }
        
                        let curvatureDict = {};
                        let min = 10, max = 0;
        
                        Object.keys( dict ).forEach( function ( key ) {
        
                            curvatureDict[ key ] = average( dict[ key ] );
        
                        } );
        
                        //smoothing
                        const smoothCurvatureDict = Object.create( curvatureDict );
        
                        Object.keys( dict ).forEach( function ( key ) {
        
                            let count = 0;
                            let sum = 0;
                            Object.keys( dict[ key ] ).forEach( function ( key2 ) {
        
                                sum += smoothCurvatureDict[ key2 ];
                                count ++;
        
                            } );
                            smoothCurvatureDict[ key ] = sum / count;
        
                        } );
        
                        curvatureDict = smoothCurvatureDict;
        
                        // fit values to 0 and 1
                        Object.keys( curvatureDict ).forEach( function ( key ) {
        
                            const val = Math.abs( curvatureDict[ key ] );
                            if ( val < min ) min = val;
                            if ( val > max ) max = val;
        
                        } );
        
                        const range = ( max - min );
        
                        Object.keys( curvatureDict ).forEach( function ( key ) {
        
                            const val = Math.abs( curvatureDict[ key ] );
                            if ( curvatureDict[ key ] < 0 ) {
        
                                curvatureDict[ key ] = ( min - val ) / range;
        
                            } else {
        
                                curvatureDict[ key ] = ( val - min ) / range;
        
                            }
        
                        } );
        
                        curvatureAttribute = new Float32Array( bufferGeo.attributes.position.count );
        
                        for ( let i = 0; i < bufferGeo.attributes.position.count; i ++ ) {
        
                            const array = bufferGeo.attributes.position.array;
                            const pos = new THREE.Vector3( array[ 3 * i ], array[ 3 * i + 1 ], array[ 3 * i + 2 ] );
                            const str = pos.toArray().toString();
                            curvatureAttribute[ i ] = curvatureDict[ str ];
        
                        }
        
                        bufferGeo.setAttribute( 'curvature', new THREE.BufferAttribute( curvatureAttribute, 1 ) );
        
                        //starting filter is to show both concave and convex
                        const curvatureFiltered = new Float32Array( curvatureAttribute );
                        filterBoth( curvatureFiltered );
        
                        const materialRaw = new THREE.ShaderMaterial( {
        
                            vertexShader: /* glsl */`
                            attribute float curvature;
        
        		varying float vCurvature;
        
        		void main() {
        
        			vec3 p = position;
        			vec4 modelViewPosition = modelViewMatrix * vec4( p , 1.0 );
        			gl_Position = projectionMatrix * modelViewPosition;
        			vCurvature = curvature;
        
        		}`,
                            fragmentShader: /* glsl */`
                            varying vec3 vViewPosition;
        		varying float vCurvature;
        
        		void main() {
        				gl_FragColor = vec4( vCurvature * 2.0, 0.0, 0.0, 1.0 );
        		}
        `                    
        
                        } );
        
                        ninjaMeshRaw = new THREE.Mesh( bufferGeo, materialRaw );
        
                    }
        
                } );
        
                scene.add( ninjaMeshRaw );
        
            } );
        
        
            //init GUI
            const params = {
        
                filterConvex: function () {
        
                    const curvatureFiltered = new Float32Array( curvatureAttribute );
                    filterConvex( curvatureFiltered );
                    bufferGeo.attributes.curvature.array = curvatureFiltered;
                    bufferGeo.attributes.curvature.needsUpdate = true;
        
        
                },
                filterConcave: function () {
        
                    const curvatureFiltered = new Float32Array( curvatureAttribute );
                    filterConcave( curvatureFiltered );
                    bufferGeo.attributes.curvature.array = curvatureFiltered;
                    bufferGeo.attributes.curvature.needsUpdate = true;
        
        
                },
                filterBoth: function () {
        
                    const curvatureFiltered = new Float32Array( curvatureAttribute );
                    filterBoth( curvatureFiltered );
                    bufferGeo.attributes.curvature.array = curvatureFiltered;
                    bufferGeo.attributes.curvature.needsUpdate = true;
        
                }
            };
        
            const gui = new GUI( { title: 'Topology' } );
        
            gui.add( params, 'filterConvex' );
            gui.add( params, 'filterConcave' );
            gui.add( params, 'filterBoth' );
        
           
        }
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};