
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/interaction/01interactioninput
        // -- Get current input state --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
app.on("click", e => app.logInfo("You clicked!", "success" , 1000))
//
//app.signal.onMouseClick.add(e => app.logInfo("You clicked!", "success" , 1000))
let cfg = [
    {
        type: 'checkbox',
        label: 'Enable input',
        getValue: ()=> app.Input.enabled(),
        setValue: v => app.Input.setEnable(v)
    },
    {
        type: 'number',
        label: 'Mouse X',
        getValue: () => app.Input.x(),
        readOnly: true
    },
    {
        type: 'number',
        label: 'Mouse Y',
        getValue: () => app.Input.y(),
        readOnly: true
    },
    {
        type: 'number',
        label: 'Mouse move X',
        getValue: () => app.Input.movementX(),
        readOnly: true
    },
    {
        type: 'number',
        label: 'Mouse move Y',
        getValue: () => app.Input.movementY(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Mouse moving',
        getValue: () => app.Input.isMoving(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Mouse dragging',
        getValue: () => app.Input.isDragging(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Left down',
        getValue: () => app.Input.isLeftButtonDown(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Left pressed',
        getValue: () => app.Input.isLeftButtonPressed(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Left up',
        getValue: () => app.Input.isLeftButtonUp(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Middle down',
        getValue: () => app.Input.isMidButtonDown(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Middle pressed',
        getValue: () => app.Input.isMidButtonPressed(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Middle up',
        getValue: () => app.Input.isMidButtonUp(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Right down',
        getValue: () => app.Input.isRightButtonDown(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Right pressed',
        getValue: () => app.Input.isRightButtonPressed(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Right up',
        getValue: () => app.Input.isRightButtonUp(),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Shift key',
        getValue: () => !!(app.Input.getKeyPressed("ShiftLeft") || app.Input.getKeyPressed("ShiftRight")),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Ctrl key',
        getValue: () => !!(app.Input.getKeyPressed("ControlLeft") || app.Input.getKeyPressed("ControlRight")),
        readOnly: true
    },
    {
        type: 'checkbox',
        label: 'Alt key',
        getValue: () => !!(app.Input.getKeyPressed("AltLeft") || app.Input.getKeyPressed("AltRight")),
        readOnly: true
    }
]
const ui = await app.getConfigPane({ title: "Input", style: { width: "250px"}});
cfg.forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};