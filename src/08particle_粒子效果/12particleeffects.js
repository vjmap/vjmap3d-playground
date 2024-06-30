
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/12particleeffects
        // --各种粒子效果示例--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let files = [
            "purple-blast-fireworks",
            "BubbleExplosion",
            "atom",
            "big-green-healing-effect",
            "blood-splash",
            "blue-flamethrower",
            "blue-flare",
            "blue-gas-explosion",
            "bomb-fuse",
            "cartoon-bang",
            "cartoon-energy-explosion",
            "cartoon-magic-zone",
            "character-stun-effect",
            "confetti-blast",
            "dollar-bill-shower",
            "emoji-cry",
            "emoji-evil-laugh",
            "emoji-kiss",
            "emoji-nervous",
            "energy-nuke-muzzle-flash",
            "explosion",
            "falling-leaves",
            "fat-bullet-explosion",
            "fat-bullet-muzzle-flash",
            "fireball-explosion",
            "frost-missile-explosion",
            "frost-missile-muzzle-flash",
            "frost-missile",
            "happy-face-emoji",
            "heal-stream-effect",
            "levelup-nova-effect",
            "lightning-ball-explosion",
            "lightning-ball-with-bloom",
            "lightning-ball",
            "nuke-energy-explosion",
            "player-aura",
            "purple-lightning-strike",
            "soft-candlelight",
            "soft-lightning-strike",
            "star-field"
        ]
        let ps;
        env.assetsPath = "https://vjmap.com/map3d/resources/"
        const create = async name => {
            if (ps) {
                app.removeParticle(ps)
            }
            ps = await app.loadParticle(env.assetsPath + `json/${name}.json`, {
                onAddSystem: (obj, system) => {
                    system.looping = true; // 设置成循环播放
                }
            });
        }
        let obj = {value: files[0]};
        const ui = await app.getConfigPane({ title: "粒子效果", style: { width: "240px"}});
        files.forEach(name => {
            ui.appendChild({
                type: "button",
                label: name,
                value: () => {
                    create(name)
                }
            })
        })
        create(obj.value);
        
        
    }
    catch (e) {
        console.error(e);
    }
};