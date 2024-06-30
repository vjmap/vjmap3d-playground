
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/fillExtrusion/01fillExtrusionsEntity
        // --拉伸实体--创建、修改、删除拉伸
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
            coordinates: [[7,  3],[-4,  -2],[-5,  3]],
            color: "#f00",
            extrude: {
                depth: Math.random()  + 1,
                steps: 1,
                bevelEnabled: false
            }
        })
        data.push({
            coordinates: [[[7,  -8],[-1,  -1],[-8,  -9],[17,  -18]],  [ [-2,  -9],[2, -10],[2,  -7],[-1,  -6]]],
            color: "#FFFE91", // 底部颜色
            color2: "#0ff", // 顶部颜色
            showBorder: true, // 显示边框线
            borderColor: "#39107B",// 边框线底部颜色
            borderColor2: "#EA3FF7",// 边框线顶部颜色
            baseHeight: 1, // 基准高度
            extrude: {
                depth: Math.random() * 3  + 1,
                steps: 1,
                bevelEnabled: false
            }
        })
        //
        let fillExtrusions = new vjmap3d.FillExtrusionsEntity({ //FillExtrusionsEntity
            data: data,
            // showBorder: true, 可以全局控制是否显示边框线
            highlightStyle: {
                color: "#777" // 高亮时颜色
            }
        })
        fillExtrusions.addTo(app)
        //
        fillExtrusions.pointerEvents = true; // 允许事件交互
        fillExtrusions.on("mouseover", e => {
            if (e?.intersection?.faceIndex !== undefined) {
                let itemData = fillExtrusions.getItemDataByFaceIndex(e?.intersection?.faceIndex);
                if (itemData && itemData.id) fillExtrusions.setItemHighlight(itemData.id, true)
            }
        })
        fillExtrusions.on("mouseout", e => {
            fillExtrusions.clearHighlight()
        })
        //
        const ui = await app.getConfigPane({ title: "设置", style: { width: "250px", overflow: "hidden"}});
        let cfg = [
            {
                type: 'checkbox',
                label: '显示顶点',
                getValue: () => fillExtrusions.isShowVertex(),
                setValue: v => {
                    fillExtrusions.setShowVertex(v)
                }
            },
            {
                type: 'checkbox',
                label: '显示边框线',
                value: false,
                onChange: ({ value } )=> {
                    // 获取模块对象
                    let mod = fillExtrusions.getModule(vjmap3d.FillExtrusionsModule);
                    mod.showBorder = value; // 设置属性
                    mod.setData(mod.getData()); // 刷新下
                }
            },
            {
                type: 'button',
                label: '增加一个拉伸',
                value: ()=> {
                    data.push({
                        coordinates: [vjmap3d.randPoint2D(),vjmap3d.randPoint2D(),vjmap3d.randPoint2D()],
                        color: vjmap3d.randColor(),
                        extrude: {
                            depth: Math.random() * 1 + 1,
                            steps: 1,
                            bevelEnabled: false
                        }
                    })
        
                fillExtrusions.setData(data)
            }
        },
        {
            type: 'button',
            label: '修改第一个拉伸颜色',
            value: ()=> {
                if (data.length > 0) {
                    data[0].color = vjmap3d.randColor()
                }
                fillExtrusions.setData(data)
            }
        },
        {
            type: 'button',
            label: '删除第一个拉伸',
            value: ()=> {
                if (data.length == 0) {
                    return
                }
                data.splice(0, 1)
                fillExtrusions.setData(data)
            }
        }
        
        
        
        ]
        cfg.forEach(c => ui.appendChild(c));
        
    }
    catch (e) {
        console.error(e);
    }
};