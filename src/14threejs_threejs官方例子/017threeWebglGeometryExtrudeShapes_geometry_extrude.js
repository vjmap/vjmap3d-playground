
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/017threeWebglGeometryExtrudeShapes
        // --geometry_extrude_shapes--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_extrude_shapes
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x222222,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1,
                far: 1000,
                position: [0, 0, 500]
            },
            control: {
                minDistance: 200,
                maxDistance: 500
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        init();
        
        function init() {
        
            scene.add( new THREE.AmbientLight( 0x666666 ) );
        
            const light = new THREE.PointLight( 0xffffff, 3, 0, 0 );
            light.position.copy( camera.position );
            scene.add( light );
        
            //
        
            const closedSpline = new THREE.CatmullRomCurve3( [
                new THREE.Vector3( - 60, - 100, 60 ),
                new THREE.Vector3( - 60, 20, 60 ),
                new THREE.Vector3( - 60, 120, 60 ),
                new THREE.Vector3( 60, 20, - 60 ),
                new THREE.Vector3( 60, - 100, - 60 )
            ] );
        
            closedSpline.curveType = 'catmullrom';
            closedSpline.closed = true;
        
            const extrudeSettings1 = {
                steps: 100,
                bevelEnabled: false,
                extrudePath: closedSpline
            };
        
        
            const pts1 = [], count = 3;
        
            for ( let i = 0; i < count; i ++ ) {
        
                const l = 20;
        
                const a = 2 * i / count * Math.PI;
        
                pts1.push( new THREE.Vector2( Math.cos( a ) * l, Math.sin( a ) * l ) );
        
            }
        
            const shape1 = new THREE.Shape( pts1 );
        
            const geometry1 = new THREE.ExtrudeGeometry( shape1, extrudeSettings1 );
        
            const material1 = new THREE.MeshLambertMaterial( { color: 0xb00000, wireframe: false } );
        
            const mesh1 = new THREE.Mesh( geometry1, material1 );
        
            scene.add( mesh1 );
        
        
            //
        
        
            const randomPoints = [];
        
            for ( let i = 0; i < 10; i ++ ) {
        
                randomPoints.push( new THREE.Vector3( ( i - 4.5 ) * 50, THREE.MathUtils.randFloat( - 50, 50 ), THREE.MathUtils.randFloat( - 50, 50 ) ) );
        
            }
        
            const randomSpline = new THREE.CatmullRomCurve3( randomPoints );
        
            //
        
            const extrudeSettings2 = {
                steps: 200,
                bevelEnabled: false,
                extrudePath: randomSpline
            };
        
        
            const pts2 = [], numPts = 5;
        
            for ( let i = 0; i < numPts * 2; i ++ ) {
        
                const l = i % 2 == 1 ? 10 : 20;
        
                const a = i / numPts * Math.PI;
        
                pts2.push( new THREE.Vector2( Math.cos( a ) * l, Math.sin( a ) * l ) );
        
            }
        
            const shape2 = new THREE.Shape( pts2 );
        
            const geometry2 = new THREE.ExtrudeGeometry( shape2, extrudeSettings2 );
        
            const material2 = new THREE.MeshLambertMaterial( { color: 0xff8000, wireframe: false } );
        
            const mesh2 = new THREE.Mesh( geometry2, material2 );
        
            scene.add( mesh2 );
        
        
            //
        
            const materials = [ material1, material2 ];
        
            const extrudeSettings3 = {
                depth: 20,
                steps: 1,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
        
            const geometry3 = new THREE.ExtrudeGeometry( shape2, extrudeSettings3 );
        
            const mesh3 = new THREE.Mesh( geometry3, materials );
        
            mesh3.position.set( 50, 100, 50 );
        
            scene.add( mesh3 );
        
        }
    }
    catch (e) {
        console.error(e);
    }
};