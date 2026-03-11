
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
        // -- Fill extrusion entity -- Create, modify, delete extrusions
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    stat: {
        show: true,
        left: "0"
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
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
    color: "#FFFE91", // Bottom color
    color2: "#0ff", // Top color
    showBorder: true, // Show border line
    borderColor: "#39107B",// Border bottom color
    borderColor2: "#EA3FF7",// Border top color
    baseHeight: 1, // Base height
    extrude: {
        depth: Math.random() * 3  + 1,
        steps: 1,
        bevelEnabled: false
    }
})
//
let fillExtrusions = new vjmap3d.FillExtrusionsEntity({ //FillExtrusionsEntity
    data: data,
    // showBorder: true, globally control whether to show border line
    highlightStyle: {
        color: "#777" // Highlight color
    }
})
fillExtrusions.addTo(app)
//
fillExtrusions.pointerEvents = true; // Enable event interaction
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
const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px", overflow: "hidden"}});
let cfg = [
    {
        type: 'checkbox',
        label: 'Show vertices',
        getValue: () => fillExtrusions.isShowVertex(),
        setValue: v => {
            fillExtrusions.setShowVertex(v)
        }
    },
    {
        type: 'checkbox',
        label: 'Show border line',
        value: false,
        onChange: ({ value } )=> {
            // Get module instance
            let mod = fillExtrusions.getModule(vjmap3d.FillExtrusionsModule);
            mod.showBorder = value; // Set property
            mod.setData(mod.getData()); // Refresh
        }
    },
    {
        type: 'button',
        label: 'Add extrusion',
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
    label: 'Change first extrusion color',
    value: ()=> {
        if (data.length > 0) {
            data[0].color = vjmap3d.randColor()
        }
        fillExtrusions.setData(data)
    }
},
{
    type: 'button',
    label: 'Delete first extrusion',
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