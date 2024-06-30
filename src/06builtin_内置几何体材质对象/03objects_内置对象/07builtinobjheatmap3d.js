
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/07builtinobjheatmap3d
        // --3D热力图--
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
        let data = [];
        for(let k = 0; k < 100; k++) {
            data.push({
                point: vjmap3d.randPoint2D({minX: -10, maxX: 10, minY: -10, maxY: 10}),
                value: Math.random() * 50
            })
        }
        //
        let heatmap = new vjmap3d.Heatmap({
            mode3D: true, //  3d模式
            heightRatio: 1.0,
            bounds: [[-10, -10], [10, 10]],
            data: data,
            min: 0,
            max: 50
        })
        let mesh = await heatmap.create();
        let heatmapEnt = new vjmap3d.MeshEntity(mesh);
        heatmapEnt.addTo(app);
        heatmapEnt.pointerEvents = true
        //
        const popup = new vjmap3d.Popup2D({
            backgroundColor: "#A0FFA0",
            buttonColor: "#f00",
            closeOnClick: false,
            closeButton: false,
            showArrow: true,
            isHide: true
        }).setText("").addTo(app);
        //
        heatmapEnt.on("mousemove", e => {
            console.log(e)
            if (e?.intersection?.uv) {
                let value = heatmap.getValueByUV(e?.intersection?.uv.toArray());
                popup.setText(`值: ${value}`)
                if (value) {
                    popup.position.copy(e?.intersection?.point)
                    popup.show();
                } else {
                    popup.hide();
                }
            }
        })
        heatmapEnt.on("mouseout", e => {
            popup.hide();
        })
        // 模拟值变化
        setInterval(() => {
            let data = [];
            for(let k = 0; k < 100; k++) {
                data.push({
                    point: vjmap3d.randPoint2D({minX: -10, maxX: 10, minY: -10, maxY: 10}),
                    value: Math.random() * 50
                })
            }
            heatmap.setData({
                //  bounds: [[0, 0], [100, 100]],
                data,
                min: 0,
                max: 50
            })
        }, 3000)
        
    }
    catch (e) {
        console.error(e);
    }
};