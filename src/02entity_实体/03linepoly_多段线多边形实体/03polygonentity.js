
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/linepoly/03polygonentity
        // --多边形实体--创建、修改、删除多边形实体
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            stat: {
                show: true,
                left: "0"
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let data = [];
        data.push({
            coordinates: [[7, 0, 3],[-4, 0, -2],[-5, 0, 3]],
            color: "#f00"
        })
        data.push({
            // 当为多个多边形时，第一个多边形后面的多边形将掏空挖洞处理
            coordinates: [[[7, 0, -8],[-1, 2, -1],[-8, 1, -9],[17, 0, -18]],  [ [-2, 0, -9],[2, 0, -10],[2, 0, -7],[-1, 0, -6]]],
            // 当颜色为数组时用顶点渐变色
            color: ["#0f0","#ff0","#0ff","#f00","#00f","#f0f","#777","#7ff"]
        })
        //
        let polygons = new vjmap3d.PolygonsEntity({ //PolygonsEntity
            data: data,
            highlightStyle: {
                color: "#777" // 高亮时颜色
            }
        })
        polygons.addTo(app)
        //
        polygons.pointerEvents = true; // 允许事件交互
        polygons.on("mouseover", e => {
            if (e?.intersection?.faceIndex !== undefined) {
                let itemData = polygons.getItemDataByFaceIndex(e?.intersection?.faceIndex);
                if (itemData && itemData.id) polygons.setItemHighlight(itemData.id, true)
            }
        })
        polygons.on("mouseout", e => {
            polygons.clearHighlight()
        })
        //
        const ui = await app.getConfigPane({ title: "设置", style: { width: "250px", overflow: "hidden"}});
        let cfg = [
            {
                type: 'checkbox',
                label: '显示顶点',
                getValue: () => polygons.isShowVertex(),
                setValue: v => {
                    polygons.setShowVertex(v)
                }
            },
            {
                type: 'button',
                label: '增加一个多边形',
                value: ()=> {
                    data.push({
                        coordinates: [vjmap3d.randPoint3D(),vjmap3d.randPoint3D(),vjmap3d.randPoint3D()],
                        color: vjmap3d.randColor()
                    })
                    polygons.setData(data)
                }
            },
            {
                type: 'button',
                label: '修改第一个多边形颜色',
                value: ()=> {
                    if (data.length > 0) {
                        data[0].color = vjmap3d.randColor()
                    }
                    polygons.setData(data)
                }
            },
            {
                type: 'button',
                label: '删除第一个多边形',
                value: ()=> {
                    if (data.length == 0) {
                        return
                    }
                    data.splice(0, 1)
                    polygons.setData(data)
                }
            }
        ]
        cfg.forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};