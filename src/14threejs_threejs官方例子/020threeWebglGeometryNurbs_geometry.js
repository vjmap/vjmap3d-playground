
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/020threeWebglGeometryNurbs
        // --geometry_nurbs--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_nurbs
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xf0f0f0,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 1, 
                far: 2000,
                position: [ 0, 150, 750]
            },
            control: {
                target: [ 0, 150, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let group;
        
        
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
        init();
        
        function init() {
        
            scene.add( new THREE.AmbientLight( 0xffffff ) );
        
            const light = new THREE.DirectionalLight( 0xffffff, 3 );
            light.position.set( 1, 1, 1 );
            scene.add( light );
        
            group = new THREE.Group();
            group.position.y = 50;
            scene.add( group );
        
            // NURBS curve
        
            const nurbsControlPoints = [];
            const nurbsKnots = [];
            const nurbsDegree = 3;
        
            for ( let i = 0; i <= nurbsDegree; i ++ ) {
        
                nurbsKnots.push( 0 );
        
            }
        
            for ( let i = 0, j = 20; i < j; i ++ ) {
        
                nurbsControlPoints.push(
                    new THREE.Vector4(
                        Math.random() * 400 - 200,
                        Math.random() * 400,
                        Math.random() * 400 - 200,
                        1 // weight of control point: higher means stronger attraction
                    )
                );
        
                const knot = ( i + 1 ) / ( j - nurbsDegree );
                nurbsKnots.push( THREE.MathUtils.clamp( knot, 0, 1 ) );
        
            }
        
            const nurbsCurve = new NURBSCurve( nurbsDegree, nurbsKnots, nurbsControlPoints );
        
            const nurbsGeometry = new THREE.BufferGeometry();
            nurbsGeometry.setFromPoints( nurbsCurve.getPoints( 200 ) );
        
            const nurbsMaterial = new THREE.LineBasicMaterial( { color: 0x333333 } );
        
            const nurbsLine = new THREE.Line( nurbsGeometry, nurbsMaterial );
            nurbsLine.position.set( 0, - 100, 0 );
            group.add( nurbsLine );
        
            const nurbsControlPointsGeometry = new THREE.BufferGeometry();
            nurbsControlPointsGeometry.setFromPoints( nurbsCurve.controlPoints );
        
            const nurbsControlPointsMaterial = new THREE.LineBasicMaterial( { color: 0x333333, opacity: 0.25, transparent: true } );
        
            const nurbsControlPointsLine = new THREE.Line( nurbsControlPointsGeometry, nurbsControlPointsMaterial );
            nurbsControlPointsLine.position.copy( nurbsLine.position );
            group.add( nurbsControlPointsLine );
        
            // NURBS surface
            {
        
                const nsControlPoints = [
                    [
                        new THREE.Vector4( - 200, - 200, 100, 1 ),
                        new THREE.Vector4( - 200, - 100, - 200, 1 ),
                        new THREE.Vector4( - 200, 100, 250, 1 ),
                        new THREE.Vector4( - 200, 200, - 100, 1 )
                    ],
                    [
                        new THREE.Vector4( 0, - 200, 0, 1 ),
                        new THREE.Vector4( 0, - 100, - 100, 5 ),
                        new THREE.Vector4( 0, 100, 150, 5 ),
                        new THREE.Vector4( 0, 200, 0, 1 )
                    ],
                    [
                        new THREE.Vector4( 200, - 200, - 100, 1 ),
                        new THREE.Vector4( 200, - 100, 200, 1 ),
                        new THREE.Vector4( 200, 100, - 250, 1 ),
                        new THREE.Vector4( 200, 200, 100, 1 )
                    ]
                ];
                const degree1 = 2;
                const degree2 = 3;
                const knots1 = [ 0, 0, 0, 1, 1, 1 ];
                const knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ];
                const nurbsSurface = new NURBSSurface( degree1, degree2, knots1, knots2, nsControlPoints );
        
                const map = new THREE.TextureLoader().load(assetsPath +  'textures/uv_grid_opengl.jpg' );
                map.wrapS = map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 16;
                map.colorSpace = THREE.SRGBColorSpace;
        
                function getSurfacePoint( u, v, target ) {
        
                    return nurbsSurface.getPoint( u, v, target );
        
                }
        
                const geometry = new ParametricGeometry( getSurfacePoint, 20, 20 );
                const material = new THREE.MeshLambertMaterial( { map: map, side: THREE.DoubleSide } );
                const object = new THREE.Mesh( geometry, material );
                object.position.set( - 400, 100, 0 );
                object.scale.multiplyScalar( 1 );
                group.add( object );
        
            }
        
            // NURBS volume
            {
        
                const nsControlPoints = [
                    [
                        [
                            new THREE.Vector4( - 200, - 200, - 200, 1 ),
                            new THREE.Vector4( - 200, - 200, 200, 1 )
                        ],
                        [
                            new THREE.Vector4( - 200, - 100, - 200, 1 ),
                            new THREE.Vector4( - 200, - 100, 200, 1 )
                        ],
                        [
                            new THREE.Vector4( - 200, 100, - 200, 1 ),
                            new THREE.Vector4( - 200, 100, 200, 1 )
                        ],
                        [
                            new THREE.Vector4( - 200, 200, - 200, 1 ),
                            new THREE.Vector4( - 200, 200, 200, 1 )
                        ]
                    ],
                    [
                        [
                            new THREE.Vector4( 0, - 200, - 200, 1 ),
                            new THREE.Vector4( 0, - 200, 200, 1 )
                        ],
                        [
                            new THREE.Vector4( 0, - 100, - 200, 1 ),
                            new THREE.Vector4( 0, - 100, 200, 1 )
                        ],
                        [
                            new THREE.Vector4( 0, 100, - 200, 1 ),
                            new THREE.Vector4( 0, 100, 200, 1 )
                        ],
                        [
                            new THREE.Vector4( 0, 200, - 200, 1 ),
                            new THREE.Vector4( 0, 200, 200, 1 )
                        ]
                    ],
                    [
                        [
                            new THREE.Vector4( 200, - 200, - 200, 1 ),
                            new THREE.Vector4( 200, - 200, 200, 1 )
                        ],
                        [
                            new THREE.Vector4( 200, - 100, 0, 1 ),
                            new THREE.Vector4( 200, - 100, 100, 1 )
                        ],
                        [
                            new THREE.Vector4( 200, 100, 0, 1 ),
                            new THREE.Vector4( 200, 100, 100, 1 )
                        ],
                        [
                            new THREE.Vector4( 200, 200, 0, 1 ),
                            new THREE.Vector4( 200, 200, 100, 1 )
                        ]
                    ]
                ];
                const degree1 = 2;
                const degree2 = 3;
                const degree3 = 1;
                const knots1 = [ 0, 0, 0, 1, 1, 1 ];
                const knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ];
                const knots3 = [ 0, 0, 1, 1 ];
                const nurbsVolume = new NURBSVolume( degree1, degree2, degree3, knots1, knots2, knots3, nsControlPoints );
        
                const map = new THREE.TextureLoader().load(assetsPath + 'textures/uv_grid_opengl.jpg' );
                map.wrapS = map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 16;
                map.colorSpace = THREE.SRGBColorSpace;
        
                // Since ParametricGeometry() only support bi-variate parametric geometries
                // we create evaluation functions for different surfaces with one of the three
                // parameter values (u, v, w) kept constant and create multiple THREE.Mesh
                // objects one for each surface
                function getSurfacePointFront( u, v, target ) {
        
                    return nurbsVolume.getPoint( u, v, 0, target );
        
                }
        
                function getSurfacePointMiddle( u, v, target ) {
        
                    return nurbsVolume.getPoint( u, v, 0.5, target );
        
                }
        
                function getSurfacePointBack( u, v, target ) {
        
                    return nurbsVolume.getPoint( u, v, 1, target );
        
                }
        
                function getSurfacePointTop( u, w, target ) {
        
                    return nurbsVolume.getPoint( u, 1, w, target );
        
                }
        
                function getSurfacePointSide( v, w, target ) {
        
                    return nurbsVolume.getPoint( 0, v, w, target );
        
                }
        
                const geometryFront = new ParametricGeometry( getSurfacePointFront, 20, 20 );
                const materialFront = new THREE.MeshLambertMaterial( { map: map, side: THREE.DoubleSide } );
                const objectFront = new THREE.Mesh( geometryFront, materialFront );
                objectFront.position.set( 400, 100, 0 );
                objectFront.scale.multiplyScalar( 0.5 );
                group.add( objectFront );
        
                const geometryMiddle = new ParametricGeometry( getSurfacePointMiddle, 20, 20 );
                const materialMiddle = new THREE.MeshLambertMaterial( { map: map, side: THREE.DoubleSide } );
                const objectMiddle = new THREE.Mesh( geometryMiddle, materialMiddle );
                objectMiddle.position.set( 400, 100, 0 );
                objectMiddle.scale.multiplyScalar( 0.5 );
                group.add( objectMiddle );
        
                const geometryBack = new ParametricGeometry( getSurfacePointBack, 20, 20 );
                const materialBack = new THREE.MeshLambertMaterial( { map: map, side: THREE.DoubleSide } );
                const objectBack = new THREE.Mesh( geometryBack, materialBack );
                objectBack.position.set( 400, 100, 0 );
                objectBack.scale.multiplyScalar( 0.5 );
                group.add( objectBack );
        
                const geometryTop = new ParametricGeometry( getSurfacePointTop, 20, 20 );
                const materialTop = new THREE.MeshLambertMaterial( { map: map, side: THREE.DoubleSide } );
                const objectTop = new THREE.Mesh( geometryTop, materialTop );
                objectTop.position.set( 400, 100, 0 );
                objectTop.scale.multiplyScalar( 0.5 );
                group.add( objectTop );
        
                const geometrySide = new ParametricGeometry( getSurfacePointSide, 20, 20 );
                const materialSide = new THREE.MeshLambertMaterial( { map: map, side: THREE.DoubleSide } );
                const objectSide = new THREE.Mesh( geometrySide, materialSide );
                objectSide.position.set( 400, 100, 0 );
                objectSide.scale.multiplyScalar( 0.5 );
                group.add( objectSide );
        
            }
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};