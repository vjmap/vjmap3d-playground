
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/material/02builtinmattextflow2d
        // --文本滚动材质(2D地图模式)--
        let svc = new vjmap.Service(env.serviceUrl, env.accessToken)
        // 打开地图
        let res = await svc.openMap({
            mapid: env.exampleMapId, // 地图ID
            // @ts-ignore
            mapopenway: vjmap.MapOpenWay.GeomRender, // 以几何数据渲染方式打开
            style: vjmap.openMapLightStyle() // div为深色背景颜色时，这里也传深色背景样式
        })
        if (res.error) {
            // 如果打开出错
            showError(res.error)
            return;
        }
        // 获取地图范围
        let mapBounds = vjmap.GeoBounds.fromString(res.bounds);
        // 根据地图范围建立几何投影坐标系
        let prj = new vjmap.GeoProjection(mapBounds);
        //
        // 地图对象
        let map = new vjmap.Map({
            container: 'map', // DIV容器ID
            style: svc.rasterStyle(), // 样式，这里是栅格样式
            center: prj.toLngLat(mapBounds.center()), // 设置地图中心点
            zoom: 2, // 设置地图缩放级别
            pitch: 45,
            renderWorldCopies: false // 不显示多屏地图
        });
        //
        // 关联服务对象和投影对象
        map.attach(svc, prj);
        await map.onLoad();
        //
        // 创建3d图层
        let mapLayer = new vjmap3d.MapThreeLayer(map, {
            stat: {
                show: true,
                left: "0"
            }
        });
        map.addLayer(new vjmap.ThreeLayer({ context: mapLayer }))
        let app = mapLayer.app;
        let mapW = vjmap3d.toDist(mapBounds.width())
        // 垂直文本滚动
        let geoW = mapW / 10, geoH = mapW / 20;
        let geom = new THREE.PlaneGeometry(geoW, geoH);
        let mat = vjmap3d.createTextFlowMaterial(app, {
            geometryWidth: geoW,
            geometryHeight: geoH,
            flowDirection: "vertical",
            flowSpeed: 0.03,
            text: `春天是一年四季中最美丽的季节之一，也是最富有生机的季节。在这个季节里，大自然给我们带来了很多惊喜和愉悦。在这个季节里，我喜欢去公园里散步，欣赏那里的美景。
        走进公园，你会看到一条小路蜿蜒伸向远方。小路两旁种满了各种各样的树木，有高大的梧桐树，还有低矮的桃树和梨树。它们长出了嫩绿的新叶，这些新叶在阳光下闪闪发光，仿佛在向人们报告春天的到来。
        沿着小路往前走，你会看到一片盛开的花海。有各种各样的花朵，比如红色的玫瑰，紫色的薰衣草，黄色的向日葵等等。它们争奇斗艳，各自展示着自己的美丽。在这片花海里，你可以闻到各种各样的香味，让人心旷神怡，烦恼忧虑全都忘了。
        在公园里还有一些人工建筑和设施。比如有一个小湖泊，湖里有几只鸭子在戏水，还有一些小鱼在游来游去。湖边有一座小亭子，供游客休息和观赏湖景。还有一些儿童游乐设施，比如秋千、滑梯、沙池等等，让孩子们尽情玩耍和欢笑。
        春天是一个充满生机和希望的季节。在这个季节里，我们可以感受到大自然的神奇力量和无限魅力。春天是万物复苏的季节，在这个季节里我们可以看到大自然为我们描绘出一幅美丽画卷。让我们一起欣赏春天的美景吧！`,
            fill: "#FF1285",
            font: "30px sans-serif",
            padding: [5, 5, 5, 5],
            backgroundColor: "#FFFE91",
            lineHeight: 50,
            width: 300,
            overflow: "break"
        });
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(vjmap3d.toWorld(mapBounds.center().toArray()));
        mesh.rotateX( Math.PI / 2)
        mesh.rotateY( Math.PI)
        app.scene.add(mesh);
        // 水平滚动文本
        let geoW2 = mapW / 10, geoH2 = mapW / 50;
        let geom2 = new THREE.PlaneGeometry(geoW2, geoH2);
        let mat2 = vjmap3d.createTextFlowMaterial(app, {
            geometryWidth: geoW2,
            geometryHeight: geoH2,
            flowDirection: "horizon",
            flowSpeed: 0.03,
            text: `春天是一年四季中最美丽的季节之一，也是最富有生机的季节。在这个季节里，大自然给我们带来了很多惊喜和愉悦。在这个季节里，我喜欢去公园里散步，欣赏那里的美景。`,
            fill: "#16417C",
            font: "30px sans-serif",
            padding: [5, 5, 5, 5],
            backgroundColor: "#00ff00",
            lineHeight: 50
        });
        let mesh2 = new THREE.Mesh(geom2, mat2);
        mesh2.position.copy(vjmap3d.toWorld(mapBounds.randomPoint().toArray()));
        mesh2.rotateX( Math.PI / 2)
        mesh2.rotateY( Math.PI)
        app.scene.add(mesh2);
    }
    catch (e) {
        console.error(e);
    }
};