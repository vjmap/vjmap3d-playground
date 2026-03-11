
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/config/01uiconfigpane
        // -- Create config pane --
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
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry( 1, 1, 1 ),
    new THREE.MeshStandardMaterial( { color: 0x00ffff } )
)
mesh.position.set(-2, 0, 0);
app.scene.add(mesh);
const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px"}});
const cfg = [
    {
        type: 'input',
        label: 'uuid',
        property: [mesh, 'uuid'],
    },
    {
        type: 'checkbox',
        label: 'Visible',
        property: [mesh, 'visible'],
    },
    {
        type: 'slider',
        label: 'Scale',
        value: 1.0,
        bounds: [0.3, 5],
        step: 0.1,
        onChange: ({ value } )=> {
            mesh.scale.set(value, value, value)
        }
    },
    {
        type: 'vec3',
        label: 'Position',
        property: [mesh, 'position'],
    },
    () => {
        // Use getter for rotation so UI refreshes
        return {
            type: 'vec3',
            label: 'Rotate',
            property: [mesh, 'rotation'],
        }
    },
    {
        type: 'color',
        label: 'Color',
        property: [mesh.material, 'color'],
    },
    {
        type: 'dropdown',
        label: 'side',
        property: [mesh.material, 'side'],
        children: [
            {
                label: "Front",
				value: THREE.FrontSide,
            },{
                label: "Back",
				value: THREE.BackSide,
            },{
                label: "Double",
				value: THREE.DoubleSide,
            }
        ]
    },
    {
        type: 'folder',
        label: 'Rotate model',
        expanded: true,
        children: [
            'X +', 'X -', 'Y +', 'Y -', 'Z +', 'Z -',
        ].map((l)=>{
            return {
                type: 'button',
                label: 'Rotate ' + l + '10',
                value: (e)=>{
                    mesh.rotateOnAxis(new THREE.Vector3(l.includes('X') ? 1 : 0, l.includes('Y') ? 1 : 0, l.includes('Z') ? 1 : 0), Math.PI / 18 * (l.includes('-') ? -1 : 1))
                    // Refresh UI
                    ui.uiRefresh()
                }
            }
        }),
    },
]
ui.appendChild( {
    type: 'folder',
    label: 'Mesh',
    expanded: true,
    children: cfg
})


    }
    catch (e) {
        console.error(e);
    }
};