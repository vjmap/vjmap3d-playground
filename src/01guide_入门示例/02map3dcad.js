
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/guide/02map3dcad
        // --创建CAD为底图的3D应用--创建一个加载CAD图的基本功能的vjmap3D应用
        // 创建一个服务类，与服务连接
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            camera: {  // 相机设置
                viewHelper: { enable: true } // 是否显示视角指示器
            }
        })
        let res = await app.svc.openMap({
                mapid: env.exampleMapId, // 地图ID,(请确保此ID已存在，可上传新图形新建ID)
                mapopenway: vjmap3d.MapOpenWay.GeomRender, // 以几何数据渲染方式打开
                style: vjmap3d.openMapDarkStyle()
        });
        if (res.error) {
            showError(res.error);
            return;
        }
        // 获取当前地图的可视范围
        let clipPolygon = vjmap3d.GeoBounds.fromString(res.drawBounds).toPointArray();
        let provider = new vjmap3d.MapProvider(
            [
                {
                    url: app.svc.rasterTileUrl()
                }
            ],
            {
                transparent: true
            }
        );
        let mapBounds = vjmap3d.GeoBounds.fromString(res.bounds)
        let scale = 100;
        let mapviewEnt = new vjmap3d.MapViewEntity({
            provider,
            baseScale: scale,
            mapBounds: mapBounds.toArray(),
            clipPolygon //  如果透明的话，不能使用裁剪区载
        });
        mapviewEnt.addTo(app);
        //
        // 在CAD图中心上方创建一个Mesh
        let cadLen = mapBounds.width() / 50; // 取cad图长度的1/50
        let len = vjmap3d.toDist(cadLen); // cad长度转世界坐标长度
        let box = new THREE.BoxGeometry(len, len, len)
        const material = new THREE.MeshStandardMaterial({
            color: "#f00",
            side: THREE.DoubleSide
        });
        let mesh = new THREE.Mesh(box, material);
        let cadPos = [mapBounds.center().x, mapBounds.center().y, cadLen]; // mesh在cad中坐标
        //
        let worldPos = vjmap3d.toWorld(cadPos);// cad坐标转世界坐标
        mesh.position.copy(worldPos);
        //app.scene.add(mesh) // 可以直接把 mesh 加进场景中不与实体相关联
        // 创建一个实体与mesh相关联
        let entity = vjmap3d.Entity.fromObject3d(mesh);
        entity.addTo(app);
        // 增加一个事件模块，用来高亮提示
        entity.add(vjmap3d.EventModule, {
            hoverSelect: true,
            hoverHtmlText: '我是用vjmap3d创建的Box',
            popupOptions: {
                anchor: "bottom"
            }
        });
    }
    catch (e) {
        console.error(e);
    }
};