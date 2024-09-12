
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/function/03functionuvatlas
        
        // --几何体自动生成UV纹理集--
        // 分割模型表面为多张图表，并将它们优化地打包到一张或多张纹理中
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x949494,
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {
                fov: 70,
                near: 1,
                far: 1000,
                position: [0, 100, 200]
            },
            control: {
                minDistance: 100,
                maxDistance: 500,
                target: [0, 100, 0]
            }
        });
        
        const objects = [];
        
        const unwrapper = new vjmap3d.UVUnwrapper({ BufferAttribute: THREE.BufferAttribute });
        // 默认参数
        /*
        unwrapper.chartOptions = {
            fixWinding: false,
            maxBoundaryLength: 0,
            maxChartArea: 0,
            maxCost: 2,
            maxIterations: 1,
            normalDeviationWeight: 2,
            normalSeamWeight: 4,
            roundnessWeight: 0.009999999776482582,
            straightnessWeight: 6,
            textureSeamWeight: 0.5,
            useInputMeshUvs: true
        };
        unwrapper.packOptions = {
            bilinear: true,
            blockAlign: false,
            bruteForce: false,
            createImage: false,
            maxChartSize: 0,
            padding: 0,
            resolution: 0,
            rotateCharts: true,
            rotateChartsToAxis: true,
            texelsPerUnit: 0
        };
        unwrapper.useNormals = true;
        unwrapper.timeUnwrap = false; // Logs time of unwrapping
        unwrapper.logProgress = false; // Logs unwrapping progress bar
        */ 
        const testMap = vjmap3d.ResManager.loadTexture(env.assetsPath + "textures/uv_grid_opengl.jpg");
        
        // 加载库
        await unwrapper.loadLibrary();
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.name = "Dir. Light";
        dirLight.position.set(200, 200, 200);
        dirLight.shadow.camera.near = 100;
        dirLight.shadow.camera.far = 5000;
        dirLight.shadow.camera.right = 150;
        dirLight.shadow.camera.left = -150;
        dirLight.shadow.camera.top = 150;
        dirLight.shadow.camera.bottom = -150;
        objects.push(dirLight);
        app.scene.add(dirLight);
        
        // ground
        const groundMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(600, 600),
            new THREE.MeshPhongMaterial({ color: 0xffffff, depthWrite: true, map: testMap })
        );
        groundMesh.position.y = -0.1;
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.name = "Ground Mesh";
        objects.push(groundMesh);
        app.scene.add(groundMesh);
        
        let obj = await vjmap3d.ResManager.loadRes(
            "https://vjmap.com/map3d/resources/models/ShadowmappableMesh.glb",
            false
        );
        
        let object = obj.scene.children[0];
        
        object.traverse(function(child) {
            if (child.isMesh && child.geometry && child.visible) {
                child.name = "Loaded Mesh";
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    map: testMap
                });
        
                objects.push(child);
            } else {
                child.layers.disableAll(); // Disable Rendering for this
            }
        });
        app.scene.add(object);
        object.scale.set(2, 2, 2);
        object.position.set(0, -16, 0);
        
        const geoms = [];
        objects.forEach(function(child) {
            if (child.isMesh && child.geometry && child.visible) {
                if (!child.geometry.index) {
                    // 如果没有顶点索引，则用mergeVertices生成索引
                    child.geometry = mergeVertices(child.geometry); // convert to indexed geometry
                }
                const geom = child.geometry;
                geom.userData.worldScale = child.getWorldScale(new THREE.Vector3()).toArray();
                geoms.push(geom);
            }
        });
        
        // 如果几何体没有uv数据，则展开几何体生成uv数据
        for (const geom of geoms) {
            if (!geom.attributes.uv) await unwrapper.unwrapGeometry(geom);
        }
        
        // 把所有的几何体展开到一张uv图集上，并把uv属性赋值给对应的几何体
        await unwrapper.packAtlas(geoms, "uv");
        
        for (const geom of geoms) {
            delete geom.userData.worldScale;
        }
        
    }
    catch (e) {
        console.error(e);
    }
};