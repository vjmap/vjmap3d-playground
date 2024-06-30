
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/10spriteAnimatorEntity
        // --创建精灵动画实体--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true,  } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let ent = new vjmap3d.SpriteAnimatorEntity({
            startFrame: 0,
            autoPlay: true,
            loop: true,
            numberOfFrames: 16,
            textureImageURL: env.assetsPath + "sprites/alien.png",
            asSprite: true
          })
        ent.position.set(-2, 0, 2);
        ent.addTo(app);
        ent.add(vjmap3d.EventModule, {
            hoverSelect: true,
            clickCallback: (ent, isClick) => {
                if (!isClick) return
                app.logInfo("您点击我了")
            }
        });
        // fire
        let entFire = new vjmap3d.SpriteAnimatorEntity({
            startFrame: 0,
            fps: 40,
            autoPlay: true,
            loop: true,
            textureImageURL:  env.assetsPath + "sprites/flame.png",
            textureDataURL:  env.assetsPath + "sprites/flame.json",
            asSprite:  true
         })
        entFire.position.set(0, 0, -5);
        entFire.addTo(app);
        //
        const animNames = ['idle', 'celebration']
        let entBoy = new vjmap3d.SpriteAnimatorEntity({
            frameName: 'idle',
            fps: 24,
            animationNames: animNames,
            autoPlay: true,
            loop: true,
            textureImageURL: env.assetsPath + "sprites/boy_hash.png",
            textureDataURL: env.assetsPath + "sprites/boy_hash.json",
            asSprite: true,
        })
        entBoy.position.set(2, 0, 2);
        entBoy.scale.set(3, 3, 3)
        entBoy.addTo(app)
        //
        let aniIndex = 0;
        const ui = await app.getConfigPane({ title: "设置", style: { width: "250px", overflow: "hidden"}});
        let cfg = [
            {
                type: 'button',
                label: '切换动画',
                value: ()=> {
                    let name = animNames[++aniIndex % 2];
                    entBoy.setFrameName(name)
                }
            },
            {
                type: 'button',
                label: '停止动画',
                value: ()=> {
                    entBoy.pauseAnimation()
                }
            },
            {
                type: 'button',
                label: '开始动画',
                value: ()=> {
                    entBoy.playAnimation()
                }
            },
        ]
        cfg.forEach(c => ui.appendChild(c));
        
    }
    catch (e) {
        console.error(e);
    }
};