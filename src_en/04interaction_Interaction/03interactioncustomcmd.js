
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/interaction/03interactioncustomcmd
        // -- Custom command --
// Add object command
class MyAddObject3DCommand extends vjmap3d.BaseCommand {
	constructor (object) {
		super();
        this.object = object;
	}
	execute () {
        if (!this.object && this.json) {
            // If from redo
            let loader = new THREE.ObjectLoader();
            this.object = loader.parse(this.json);
        }
        if (this.object) {
            this.app.scene.add(this.object);
        }
	}
	undo () {
		if (this.object) {
            this.json = this.object.toJSON(); // Save object JSON
            this.object.parent.remove(this.object)
            this.object = null;
        }
	}
	redo () {
		this.execute();
	}
}
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    },
    control: { leftButtonPan: true } // Left rotate, right pan
})
const ui = await app.getConfigPane({ title: "Input", style: { width: "250px"}});
let gui = new vjmap3d.UiPanelJsonConfig();
gui.addButton("Add entity", () => {
    let box = new THREE.BoxGeometry(Math.random() * 3 + 0.5, Math.random() * 3 + 0.5, Math.random() * 3 + 0.5)
    const material = new THREE.MeshStandardMaterial({
        color: vjmap3d.randColor()
    });
    let mesh = new THREE.Mesh(box, material);
    mesh.position.copy(vjmap3d.toVector3(vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5})))
    app.executeCommand(new MyAddObject3DCommand(mesh));
    // Same as: add mesh to scene then addCommand
    //app.scene.add(mesh);
    //app.addCommand(new MyAddObject3DCommand(mesh));
})
gui.addButton("Undo", () => {
    app.undo()
})
gui.addButton("Redo", () => {
    app.redo()
})
gui.addButton("Clear commands", () => {
    app.clearCommands()
})
gui.toJson().forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};