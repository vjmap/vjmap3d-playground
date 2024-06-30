
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/101threeWebglmodifierEdgesplit
        // --modifier_edgesplit--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_modifier_edgesplit
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
                position: [0, 0, 4 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let modifier, mesh, baseGeometry;
        let map;
        
        const params = {
            smoothShading: true,
            edgeSplit: true,
            cutOffAngle: 20,
            showMap: false,
            tryKeepNormals: true,
        };
        
        init();
        
        function init()  {
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            scene.add( new THREE.HemisphereLight( 0xffffff, 0x444444, 3 ) );
        
            vjmap3d.LoadManager.objLoader.load(
                assetsPath + './models/obj/cerberus/Cerberus.obj',
                function ( group ) {
        
                    const cerberus = group.children[ 0 ];
                    const modelGeometry = cerberus.geometry;
        
                    modifier = new EdgeSplitModifier();
                    baseGeometry = BufferGeometryUtils.mergeVertices( modelGeometry );
        
                    mesh = new THREE.Mesh( getGeometry(), new THREE.MeshStandardMaterial() );
                    mesh.material.flatShading = ! params.smoothShading;
                    mesh.rotateY( - Math.PI / 2 );
                    mesh.scale.set( 3.5, 3.5, 3.5 );
                    mesh.translateZ( 1.5 );
                    scene.add( mesh );
        
                    if ( map !== undefined && params.showMap ) {
        
                        mesh.material.map = map;
                        mesh.material.needsUpdate = true;
        
                    }
        
                  
                }
            );
        
        
            new THREE.TextureLoader().load(assetsPath + './models/obj/cerberus/Cerberus_A.jpg', function ( texture ) {
        
                map = texture;
                map.colorSpace = THREE.SRGBColorSpace;
        
                if ( mesh !== undefined && params.showMap ) {
        
                    mesh.material.map = map;
                    mesh.material.needsUpdate = true;
        
                }
        
            } );
        
        
            const gui = new GUI( { title: 'Edge split modifier parameters' } );
        
            gui.add( params, 'showMap' ).onFinishChange( updateMesh );
            gui.add( params, 'smoothShading' ).onFinishChange( updateMesh );
            gui.add( params, 'edgeSplit' ).onFinishChange( updateMesh );
            gui.add( params, 'cutOffAngle' ).min( 0 ).max( 180 ).onFinishChange( updateMesh );
            gui.add( params, 'tryKeepNormals' ).onFinishChange( updateMesh );
        
        }
        
        
        function getGeometry() {
        
            let geometry;
        
            if ( params.edgeSplit ) {
        
                geometry = modifier.modify(
                    baseGeometry,
                    params.cutOffAngle * Math.PI / 180,
                    params.tryKeepNormals
                );
        
            } else {
        
                geometry = baseGeometry;
        
            }
        
            return geometry;
        
        }
        
        
        function updateMesh() {
        
            if ( mesh !== undefined ) {
        
                mesh.geometry = getGeometry();
        
                let needsUpdate = mesh.material.flatShading === params.smoothShading;
                mesh.material.flatShading = params.smoothShading === false;
        
                if ( map !== undefined ) {
        
                    needsUpdate = needsUpdate || mesh.material.map !== ( params.showMap ? map : null );
                    mesh.material.map = params.showMap ? map : null;
        
                }
        
                mesh.material.needsUpdate = needsUpdate;
        
             
        
            }
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};