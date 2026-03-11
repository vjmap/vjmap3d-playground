
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/08spriteTextsEntity
        // -- Create sprite text entity --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true,  } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg.png")
let data = [];
for(let i = 0; i < 20; i++) {
    for(let j = 0; j < 20; j++) {
        let id = j * 20 + i;
        let strId = id + '';
        if (strId.length <= 2) strId = " " + strId;
        data.push({
            position:  [i * 5 - 50, 0, j * 5 - 50],
            text: `Label\n${strId}`,
            style: {
                x: 5,
                y: 5,
                fill: vjmap3d.render2d.color.random(),
                font: '16px sans-serif',
                padding: [10, 20, 20, 20],
                backgroundColor: {
                    image: image
                }
            },
            id: id
        });
    }
}
let ent = new vjmap3d.SpriteTextsEntity({
    data: data,
    sizeAttenuation: false,
    allowOverlap: false,
});
ent.addTo(app);
//
ent.pointerEvents = true
ent.on("mouseover", e => {
    let index = e?.intersection?.object?.userData.objectDataIndex
    if (index !== undefined) {
        ent.setItemHighlight(index, true);
        app.popup2d.show();
        app.popup2d.setOffset([0, -40]);
        app.popup2d.setHTML(`
ID:${data[index].id}
`)
        app.popup2d.setPosition(data[index].position)
    }
})
ent.on("mouseout", e => {
    let index = e?.intersection?.object?.userData.objectDataIndex
    if (index !== undefined) {
        ent.setItemHighlight(index, false)
        app.popup2d.hide()
    }
})
ent.on("click", e => {
    let index = e?.intersection?.object?.userData.objectDataIndex
    if (index !== undefined) {
        app.logInfo(`Clicked ID: ${data[index].id}`)
    }
})
const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px", overflow: "hidden"}});
let cfg = [
    {
        type: 'checkbox',
        label: 'Allow overlap',
        property: [ent.getOptions(), "allowOverlap"],
        onChange: () => {
           ent.update()
        }
    },
    {
        type: 'slider',
        label: 'Fade distance',
        bounds: [0, 5000],
        stepSize: 1,
        getValue: () => ent.getOptions().fadeDistance ?? 0,
        setValue: (v) => {
           ent.getOptions().fadeDistance = v;
           ent.update()
        }
    },
    {
        type: 'button',
        label: 'Add one more',
        value: ()=> {
            data.push({
                position: vjmap3d.randPoint3D(),
                text: `Label\n${data.length + 1}`,
                style: {
                    x: 5,
                    y: 5,
                    fill: vjmap3d.render2d.color.random(),
                    font: '16px sans-serif',
                    padding: [10, 20, 20, 20],
                    backgroundColor: {
                        image: image
                    }
                },
                id: data.length + 1
            })
            ent.setData(data)
        }
    },
    {
        type: 'button',
        label: 'Change first text',
        value: ()=> {
            if (data.length > 0) {
                data[0].text = "Modified";
            }
            ent.setData(data)
        }
    },
    {
        type: 'button',
        label: 'Delete first',
        value: ()=> {
            if (data.length == 0) {
                return
            }
            data.splice(0, 1)
            ent.setData(data)
        }
    }
]
cfg.forEach(c => ui.appendChild(c));

    }
    catch (e) {
        console.error(e);
    }
};