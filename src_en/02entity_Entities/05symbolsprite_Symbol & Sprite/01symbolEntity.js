
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/01symbolEntity
        // -- Create symbol entity -- Create, modify, delete symbol entities
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
let data = [];
data.push({
    position: [-2, 3, 4],
    color: "#0ff",
    borderColor: "#ff0",
    size: 20
})
data.push({
    position: [2, 4, 3],
    color: "#0f0",
    borderColor: "#ff0",
    size: 25
})
let symbol = new vjmap3d.SymbolEntity({ //SymbolEntity
    data: data,
    pixelRaycasting: true, // Pixel pick
    style: {
        shape: "circle",
        transparent: true,
        //fadeDistance: 500,
        borderWidth: 2,
        sizeAttenuation: false
    }
})
symbol.addTo(app);
symbol.symbolObject.userData.RaycasterThreshold = 15; // Pixel pick distance, default is 6
// Enable events
symbol.pointerEvents = true;
symbol.on("mouseover", e => {
    if (e.intersection.index >= 0) {
        let pointsData = symbol.getData();
        app.setCursor("pointer");
        pointsData[e.intersection.index].highlightColor = "#f00";
        pointsData[e.intersection.index].highlightSize =
            (pointsData[e.intersection.index].size ?? 3) + 5;
        symbol.setData(pointsData)
        app.popup2d.setText(`id: ${pointsData[e.intersection.index].id}`)
        app.popup2d.setPosition(pointsData[e.intersection.index].position)
        // app.popup2d.setPosition(e?.intersection?.point, true)
        app.popup2d.show();
    }
});
symbol.on("mouseout", e => {
    if (e.intersection.index >= 0) {
        app.setCursor("");
        // Clear highlight
        let pointsData = symbol.getData();
        delete pointsData[e.intersection.index].highlightColor;
        delete pointsData[e.intersection.index].highlightSize;
        symbol.setData(pointsData)
        app.popup2d.hide();
    }
});
//
let mod = symbol.getModule(vjmap3d.SymbolModule);
const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px", overflow: "hidden"}});
let cfg = [
    {
        type: 'button',
        label: 'Add point symbol',
        value: ()=> {
            data.push({
                position: vjmap3d.randPoint3D(),
                color: vjmap3d.randColor(),
                borderColor: vjmap3d.randColor(),
                size: vjmap3d.randInt(10, 20)
            })
            symbol.setData(data)
        }
    },
    {
        type: 'button',
        label: 'Change first symbol color',
        value: ()=> {
            if (data.length > 0) {
                data[0].color = vjmap3d.randColor()
            }
            symbol.setData(data)
        }
    },
    {
        type: 'button',
        label: 'Delete first symbol',
        value: ()=> {
            if (data.length == 0) {
                return
            }
            data.splice(0, 1)
            symbol.setData(data)
        }
    },
    {
        type: 'dropdown',
        label: 'Shape',
        property: [mod.style, 'shape'],
        children: [
            {
                label: "Square",
                value: "square",
            },
            {
                label: "Circle",
                value: "circle",
            },
            {
                label: "Triangle",
                value: "triangle",
            }
        ],
        onChange: () => {
            symbol.updateStyle(mod.style)
        }
    }
]
cfg.forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};