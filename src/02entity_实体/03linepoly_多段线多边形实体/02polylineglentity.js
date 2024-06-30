
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/linepoly/02polylineglentity
        // --Gl多段线实体--创建、修改、删除GL多段线实体(不能设置线宽，但性能更好)
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
            color: "#00ff00"
        })
        data.push({
            coordinates: [[7, 0, -8],[-1, 2, -1],[-8, 1, -9],[7, 0, -8]],
            color: "#ffff00"
        })
        //
        let polylines = new vjmap3d.GlLinesEntity({ //PolygonsEntity
            data: data,
        })
        polylines.addTo(app)
        //
        polylines.pointerEvents = true; // 允许事件交互
        polylines.on("mouseover", e => {
            if (e?.intersection?.index !== undefined) {
                let itemData = polylines.getItemDataByIndex(e?.intersection?.index);
                if (itemData && itemData.id) polylines.setItemHighlight(itemData.id, true)
            }
        })
        polylines.on("mouseout", e => {
            polylines.clearHighlight()
        })
        //
        const ui = await app.getConfigPane({ title: "设置", style: { width: "250px", overflow: "hidden"}});
        let cfg = [
            {
                type: 'checkbox',
                label: '显示顶点',
                getValue: () => polylines.isShowVertex(),
                setValue: v => {
                    polylines.setShowVertex(v)
                }
            },
            {
                type: 'button',
                label: '增加一条线',
                value: ()=> {
                    data.push({
                        coordinates: [vjmap3d.randPoint3D(),vjmap3d.randPoint3D()],
                        color: vjmap3d.randColor()
                    })
                    polylines.setData(data)
                }
            },
            {
                type: 'button',
                label: '修改第一条线颜色',
                value: ()=> {
                    if (data.length > 0) {
                        data[0].color = vjmap3d.randColor()
                    }
                    polylines.setData(data)
                }
            },
            {
                type: 'button',
                label: '删除第一条线',
                value: ()=> {
                    if (data.length == 0) {
                        return
                    }
                    data.splice(0, 1)
                    polylines.setData(data)
                }
            },{
                type: 'button',
                label: '增加一条渐变色',
                value: ()=> {
                    data.push({
                        coordinates: [vjmap3d.randPoint3D(),vjmap3d.randPoint3D(),vjmap3d.randPoint3D()],
                        // 当颜色为数组为，将绘制成渐变色
                        color: [vjmap3d.randColor(), vjmap3d.randColor(), vjmap3d.randColor()],
                        lineWidth: 3
                    })
                    polylines.setData(data)
                }
            }
        ]
        cfg.forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};