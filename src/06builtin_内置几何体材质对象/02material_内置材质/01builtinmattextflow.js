
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/material/01builtinmattextflow
        // --文本滚动材质--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        // 垂直文本滚动
        let geoW = 10, geoH = 10 / 2;
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
        mesh.position.set(0, 0, 0);
        mesh.rotateY(Math.PI / 16);
        app.scene.add(mesh);
        // 水平滚动文本
        let geoW2 = 20, geoH2 = 20 / 5;
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
        mesh2.position.set(-5, 0, -10);
        app.scene.add(mesh2);
        
    }
    catch (e) {
        console.error(e);
    }
};