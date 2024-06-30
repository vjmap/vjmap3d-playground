
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/02particleloadfromjson
        // --从Json中加载粒子效果--
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
        let json = 
        {
            "metadata": {
                "version": 4.6,
                "type": "Object",
                "generator": "Object3D.toJSON"
            },
            "geometries": [
                {
                    "uuid": "433a755f-4115-4a64-bd06-1f05331a1078",
                    "type": "PlaneGeometry",
                    "width": 1,
                    "height": 1,
                    "widthSegments": 1,
                    "heightSegments": 1
                }
            ],
            "materials": [
                {
                    "uuid": "fef3441a-5fde-4740-907e-743256f9b8d9",
                    "type": "MeshBasicMaterial",
                    "color": 16777215,
                    "map": "cf8eff63-6ee2-481e-b223-a3c4a882108e",
                    "envMapRotation": [
                        0,
                        0,
                        0,
                        "XYZ"
                    ],
                    "reflectivity": 1,
                    "refractionRatio": 0.98,
                    "blending": 2,
                    "side": 2,
                    "transparent": true,
                    "blendColor": 0,
                    "depthWrite": false
                },
                {
                    "uuid": "05bf8dc6-8196-4759-ac58-58c9dcf78a7e",
                    "type": "MeshBasicMaterial",
                    "color": 16777215,
                    "map": "1e0c0e22-0cdb-4798-b682-6581b4fe8c43",
                    "envMapRotation": [
                        0,
                        0,
                        0,
                        "XYZ"
                    ],
                    "reflectivity": 1,
                    "refractionRatio": 0.98,
                    "blending": 2,
                    "side": 2,
                    "transparent": true,
                    "blendColor": 0,
                    "depthWrite": false
                },
                {
                    "uuid": "ffea9bce-9403-4681-b45b-17f5c326af15",
                    "type": "MeshBasicMaterial",
                    "color": 16777215,
                    "map": "02753847-6428-430e-b99a-bb15ddb05c75",
                    "envMapRotation": [
                        0,
                        0,
                        0,
                        "XYZ"
                    ],
                    "reflectivity": 1,
                    "refractionRatio": 0.98,
                    "side": 2,
                    "transparent": true,
                    "blendColor": 0,
                    "depthWrite": false
                },
                {
                    "uuid": "13febd4e-0fcb-4a93-9e1e-ecd26f51fdf9",
                    "type": "MeshBasicMaterial",
                    "color": 16777215,
                    "map": "cf8eff63-6ee2-481e-b223-a3c4a882108e",
                    "envMapRotation": [
                        0,
                        0,
                        0,
                        "XYZ"
                    ],
                    "reflectivity": 1,
                    "refractionRatio": 0.98,
                    "blending": 2,
                    "side": 2,
                    "transparent": true,
                    "blendColor": 0,
                    "depthWrite": false
                }
            ],
            "textures": [
                {
                    "uuid": "cf8eff63-6ee2-481e-b223-a3c4a882108e",
                    "name": "",
                    "image": "463b5bf0-5add-4176-b295-281fba5fadb4",
                    "mapping": 300,
                    "channel": 0,
                    "repeat": [
                        1,
                        1
                    ],
                    "offset": [
                        0,
                        0
                    ],
                    "center": [
                        0,
                        0
                    ],
                    "rotation": 0,
                    "wrap": [
                        1001,
                        1001
                    ],
                    "format": 1023,
                    "internalFormat": null,
                    "type": 1009,
                    "colorSpace": "",
                    "minFilter": 1008,
                    "magFilter": 1006,
                    "anisotropy": 1,
                    "flipY": true,
                    "generateMipmaps": true,
                    "premultiplyAlpha": false,
                    "unpackAlignment": 4
                },
                {
                    "uuid": "1e0c0e22-0cdb-4798-b682-6581b4fe8c43",
                    "name": "",
                    "image": "4b7ea38d-3c44-4b27-861c-43e994377004",
                    "mapping": 300,
                    "channel": 0,
                    "repeat": [
                        1,
                        1
                    ],
                    "offset": [
                        0,
                        0
                    ],
                    "center": [
                        0,
                        0
                    ],
                    "rotation": 0,
                    "wrap": [
                        1001,
                        1001
                    ],
                    "format": 1023,
                    "internalFormat": null,
                    "type": 1009,
                    "colorSpace": "",
                    "minFilter": 1008,
                    "magFilter": 1006,
                    "anisotropy": 1,
                    "flipY": true,
                    "generateMipmaps": true,
                    "premultiplyAlpha": false,
                    "unpackAlignment": 4
                },
                {
                    "uuid": "02753847-6428-430e-b99a-bb15ddb05c75",
                    "name": "",
                    "image": "2642fafe-46a5-4659-a82e-80b3f5d28990",
                    "mapping": 300,
                    "channel": 0,
                    "repeat": [
                        1,
                        1
                    ],
                    "offset": [
                        0,
                        0
                    ],
                    "center": [
                        0,
                        0
                    ],
                    "rotation": 0,
                    "wrap": [
                        1001,
                        1001
                    ],
                    "format": 1023,
                    "internalFormat": null,
                    "type": 1009,
                    "colorSpace": "",
                    "minFilter": 1008,
                    "magFilter": 1006,
                    "anisotropy": 1,
                    "flipY": true,
                    "generateMipmaps": true,
                    "premultiplyAlpha": false,
                    "unpackAlignment": 4
                }
            ],
            "images": [
                {
                    "uuid": "463b5bf0-5add-4176-b295-281fba5fadb4",
                    "url": env.assetsPath + "textures/bubble1.png"
                },
                {
                    "uuid": "4b7ea38d-3c44-4b27-861c-43e994377004",
                    "url": env.assetsPath + "textures/bubble2.png"
                },
                {
                    "uuid": "2642fafe-46a5-4659-a82e-80b3f5d28990",
                    "url": env.assetsPath + "textures/bubble3.png"
                }
            ],
            "object": {
                "uuid": "0e179f6c-c075-4f19-b786-2f6e1ba98138",
                "type": "Group",
                "name": "BubbleExplosion",
                "layers": 1,
                "matrix": [
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1
                ],
                "up": [
                    0,
                    1,
                    0
                ],
                "children": [
                    {
                        "uuid": "9f036fec-18ac-46d8-b54a-fe4eb819fe4a",
                        "type": "Group",
                        "name": "BubbleSubEmitter",
                        "layers": 1,
                        "matrix": [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        "up": [
                            0,
                            1,
                            0
                        ],
                        "children": [
                            {
                                "uuid": "023fcdcf-f625-4089-8652-944559bfa261",
                                "type": "ParticleEmitter",
                                "name": "BubbleSubEmitterEmitter",
                                "layers": 1,
                                "matrix": [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1
                                ],
                                "up": [
                                    0,
                                    1,
                                    0
                                ],
                                "ps": {
                                    "version": "3.0",
                                    "autoDestroy": false,
                                    "looping": false,
                                    "prewarm": false,
                                    "duration": 1,
                                    "shape": {
                                        "type": "sphere",
                                        "radius": 0.01,
                                        "arc": 6.283185307179586,
                                        "thickness": 1,
                                        "mode": 0,
                                        "spread": 0,
                                        "speed": {
                                            "type": "ConstantValue",
                                            "value": 1
                                        }
                                    },
                                    "startLife": {
                                        "type": "IntervalValue",
                                        "a": 0.2,
                                        "b": 0.6
                                    },
                                    "startSpeed": {
                                        "type": "IntervalValue",
                                        "a": 0.5,
                                        "b": 1
                                    },
                                    "startRotation": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "startSize": {
                                        "type": "IntervalValue",
                                        "a": 0.1,
                                        "b": 0.2
                                    },
                                    "startColor": {
                                        "type": "ConstantColor",
                                        "color": {
                                            "r": 1,
                                            "g": 1,
                                            "b": 1,
                                            "a": 1
                                        }
                                    },
                                    "emissionOverTime": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "emissionOverDistance": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "emissionBursts": [
                                        {
                                            "time": 0,
                                            "count": {
                                                "type": "IntervalValue",
                                                "a": 0,
                                                "b": 3
                                            },
                                            "probability": 1,
                                            "interval": 0.01,
                                            "cycle": 1
                                        }
                                    ],
                                    "onlyUsedByOther": true,
                                    "instancingGeometry": "433a755f-4115-4a64-bd06-1f05331a1078",
                                    "renderOrder": 0,
                                    "renderMode": 0,
                                    "rendererEmitterSettings": {},
                                    "material": "fef3441a-5fde-4740-907e-743256f9b8d9",
                                    "layers": 1,
                                    "startTileIndex": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "uTileCount": 1,
                                    "vTileCount": 1,
                                    "blendTiles": false,
                                    "softParticles": false,
                                    "softFarFade": 0,
                                    "softNearFade": 0,
                                    "simulations": [
                                        {
                                            "type": "SizeOverLife",
                                            "size": {
                                                "type": "PiecewiseBezier",
                                                "functions": [
                                                    {
                                                        "function": {
                                                            "p0": 1,
                                                            "p1": 1,
                                                            "p2": 0.802102569257033,
                                                            "p3": 0.77038664
                                                        },
                                                        "start": 0
                                                    },
                                                    {
                                                        "function": {
                                                            "p0": 0.77038664,
                                                            "p1": 0.7681511437753881,
                                                            "p2": 1,
                                                            "p3": 1
                                                        },
                                                        "start": 0.9280901
                                                    },
                                                    {
                                                        "function": {
                                                            "p0": 1,
                                                            "p1": 1,
                                                            "p2": 1,
                                                            "p3": 1
                                                        },
                                                        "start": 0.9935065
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "type": "ColorOverLife",
                                            "color": {
                                                "type": "Gradient",
                                                "color": {
                                                    "type": "CLinearFunction",
                                                    "subType": "Color",
                                                    "keys": [
                                                        {
                                                            "value": {
                                                                "r": 1,
                                                                "g": 1,
                                                                "b": 1
                                                            },
                                                            "pos": 0
                                                        },
                                                        {
                                                            "value": {
                                                                "r": 1,
                                                                "g": 1,
                                                                "b": 1
                                                            },
                                                            "pos": 1
                                                        }
                                                    ]
                                                },
                                                "alpha": {
                                                    "type": "CLinearFunction",
                                                    "subType": "Number",
                                                    "keys": [
                                                        {
                                                            "value": 1,
                                                            "pos": 0
                                                        },
                                                        {
                                                            "value": 1,
                                                            "pos": 0.6096589608606089
                                                        },
                                                        {
                                                            "value": 0,
                                                            "pos": 1
                                                        }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            "type": "LimitSpeedOverLife",
                                            "speed": {
                                                "type": "ConstantValue",
                                                "value": 0
                                            },
                                            "dampen": 0.15
                                        }
                                    ],
                                    "worldSpace": true
                                }
                            }
                        ]
                    },
                    {
                        "uuid": "013ad424-7431-47ff-94a5-6711a4e90d3c",
                        "type": "Group",
                        "name": "Glow",
                        "layers": 1,
                        "matrix": [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        "up": [
                            0,
                            1,
                            0
                        ],
                        "children": [
                            {
                                "uuid": "5d550821-fbff-47eb-baf0-e6f7d58a0676",
                                "type": "ParticleEmitter",
                                "name": "GlowEmitter",
                                "layers": 1,
                                "matrix": [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1
                                ],
                                "up": [
                                    0,
                                    1,
                                    0
                                ],
                                "ps": {
                                    "version": "3.0",
                                    "autoDestroy": false,
                                    "looping": false,
                                    "prewarm": false,
                                    "duration": 1,
                                    "shape": {
                                        "type": "point"
                                    },
                                    "startLife": {
                                        "type": "ConstantValue",
                                        "value": 0.15
                                    },
                                    "startSpeed": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "startRotation": {
                                        "type": "IntervalValue",
                                        "a": 0,
                                        "b": 6.283185
                                    },
                                    "startSize": {
                                        "type": "IntervalValue",
                                        "a": 5.5,
                                        "b": 6
                                    },
                                    "startColor": {
                                        "type": "ConstantColor",
                                        "color": {
                                            "r": 0.6985294,
                                            "g": 0.91267747,
                                            "b": 1,
                                            "a": 0.8627451
                                        }
                                    },
                                    "emissionOverTime": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "emissionOverDistance": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "emissionBursts": [
                                        {
                                            "time": 0,
                                            "count": {
                                                "type": "ConstantValue",
                                                "value": 2
                                            },
                                            "probability": 1,
                                            "interval": 0.01,
                                            "cycle": 1
                                        }
                                    ],
                                    "onlyUsedByOther": false,
                                    "instancingGeometry": "433a755f-4115-4a64-bd06-1f05331a1078",
                                    "renderOrder": 0,
                                    "renderMode": 0,
                                    "rendererEmitterSettings": {},
                                    "material": "05bf8dc6-8196-4759-ac58-58c9dcf78a7e",
                                    "layers": 1,
                                    "startTileIndex": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "uTileCount": 1,
                                    "vTileCount": 1,
                                    "blendTiles": false,
                                    "softParticles": false,
                                    "softFarFade": 0,
                                    "softNearFade": 0,
                                    "simulations": [
                                        {
                                            "type": "ForceOverLife",
                                            "x": {
                                                "type": "ConstantValue",
                                                "value": 0
                                            },
                                            "y": {
                                                "type": "ConstantValue",
                                                "value": 0
                                            },
                                            "z": {
                                                "type": "ConstantValue",
                                                "value": 0
                                            }
                                        },
                                        {
                                            "type": "SizeOverLife",
                                            "size": {
                                                "type": "PiecewiseBezier",
                                                "functions": [
                                                    {
                                                        "function": {
                                                            "p0": 0.3442688,
                                                            "p1": 0.7726024666666667,
                                                            "p2": 0.9485876666666666,
                                                            "p3": 1
                                                        },
                                                        "start": 0
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "type": "ColorOverLife",
                                            "color": {
                                                "type": "Gradient",
                                                "color": {
                                                    "type": "CLinearFunction",
                                                    "subType": "Color",
                                                    "keys": [
                                                        {
                                                            "value": {
                                                                "r": 1,
                                                                "g": 1,
                                                                "b": 1
                                                            },
                                                            "pos": 0
                                                        },
                                                        {
                                                            "value": {
                                                                "r": 1,
                                                                "g": 1,
                                                                "b": 1
                                                            },
                                                            "pos": 1
                                                        }
                                                    ]
                                                },
                                                "alpha": {
                                                    "type": "CLinearFunction",
                                                    "subType": "Number",
                                                    "keys": [
                                                        {
                                                            "value": 1,
                                                            "pos": 0
                                                        },
                                                        {
                                                            "value": 0,
                                                            "pos": 1
                                                        }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            "type": "LimitSpeedOverLife",
                                            "speed": {
                                                "type": "ConstantValue",
                                                "value": 0.7
                                            },
                                            "dampen": 0.09
                                        }
                                    ],
                                    "worldSpace": true
                                }
                            }
                        ]
                    },
                    {
                        "uuid": "014f0601-e69c-4004-a30a-8a346a43f685",
                        "type": "Group",
                        "name": "Droplets",
                        "layers": 1,
                        "matrix": [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        "up": [
                            0,
                            1,
                            0
                        ],
                        "children": [
                            {
                                "uuid": "5c4512e0-9b82-4eea-bdfd-a4d450ecd755",
                                "type": "ParticleEmitter",
                                "name": "DropletsEmitter",
                                "layers": 1,
                                "matrix": [
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    1
                                ],
                                "up": [
                                    0,
                                    1,
                                    0
                                ],
                                "ps": {
                                    "version": "3.0",
                                    "autoDestroy": false,
                                    "looping": false,
                                    "prewarm": false,
                                    "duration": 1,
                                    "shape": {
                                        "type": "sphere",
                                        "radius": 0.25,
                                        "arc": 6.283185307179586,
                                        "thickness": 1,
                                        "mode": 0,
                                        "spread": 0,
                                        "speed": {
                                            "type": "ConstantValue",
                                            "value": 1
                                        }
                                    },
                                    "startLife": {
                                        "type": "IntervalValue",
                                        "a": 0.2,
                                        "b": 0.4
                                    },
                                    "startSpeed": {
                                        "type": "IntervalValue",
                                        "a": 11,
                                        "b": 18
                                    },
                                    "startRotation": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "startSize": {
                                        "type": "IntervalValue",
                                        "a": 0.03,
                                        "b": 0.05
                                    },
                                    "startColor": {
                                        "type": "ConstantColor",
                                        "color": {
                                            "r": 1,
                                            "g": 1,
                                            "b": 1,
                                            "a": 1
                                        }
                                    },
                                    "emissionOverTime": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "emissionOverDistance": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "emissionBursts": [
                                        {
                                            "time": 0,
                                            "count": {
                                                "type": "ConstantValue",
                                                "value": 25
                                            },
                                            "probability": 1,
                                            "interval": 0.01,
                                            "cycle": 1
                                        }
                                    ],
                                    "onlyUsedByOther": false,
                                    "instancingGeometry": "433a755f-4115-4a64-bd06-1f05331a1078",
                                    "renderOrder": 0,
                                    "renderMode": 1,
                                    "rendererEmitterSettings": {
                                        "speedFactor": 0.01,
                                        "lengthFactor": 1
                                    },
                                    "material": "ffea9bce-9403-4681-b45b-17f5c326af15",
                                    "layers": 1,
                                    "startTileIndex": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "uTileCount": 1,
                                    "vTileCount": 1,
                                    "blendTiles": false,
                                    "softParticles": false,
                                    "softFarFade": 0,
                                    "softNearFade": 0,
                                    "simulations": [
                                        {
                                            "type": "ForceOverLife",
                                            "x": {
                                                "type": "ConstantValue",
                                                "value": 0
                                            },
                                            "y": {
                                                "type": "ConstantValue",
                                                "value": -11.76
                                            },
                                            "z": {
                                                "type": "ConstantValue",
                                                "value": 0
                                            }
                                        },
                                        {
                                            "type": "SizeOverLife",
                                            "size": {
                                                "type": "PiecewiseBezier",
                                                "functions": [
                                                    {
                                                        "function": {
                                                            "p0": 1,
                                                            "p1": 1,
                                                            "p2": 1,
                                                            "p3": 1
                                                        },
                                                        "start": 0
                                                    },
                                                    {
                                                        "function": {
                                                            "p0": 1,
                                                            "p1": 1,
                                                            "p2": 0.7474547374953784,
                                                            "p3": 0.6199093
                                                        },
                                                        "start": 0.65254235
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "type": "ColorOverLife",
                                            "color": {
                                                "type": "Gradient",
                                                "color": {
                                                    "type": "CLinearFunction",
                                                    "subType": "Color",
                                                    "keys": [
                                                        {
                                                            "value": {
                                                                "r": 1,
                                                                "g": 0.9647059,
                                                                "b": 0.9529412
                                                            },
                                                            "pos": 0.00123598077363241
                                                        },
                                                        {
                                                            "value": {
                                                                "r": 0.6627451,
                                                                "g": 0.9019608,
                                                                "b": 1
                                                            },
                                                            "pos": 0.991256580453193
                                                        }
                                                    ]
                                                },
                                                "alpha": {
                                                    "type": "CLinearFunction",
                                                    "subType": "Number",
                                                    "keys": [
                                                        {
                                                            "value": 1,
                                                            "pos": 0
                                                        },
                                                        {
                                                            "value": 1,
                                                            "pos": 0.6877393759060044
                                                        },
                                                        {
                                                            "value": 0,
                                                            "pos": 1
                                                        }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            "type": "LimitSpeedOverLife",
                                            "speed": {
                                                "type": "ConstantValue",
                                                "value": 2
                                            },
                                            "dampen": 0.15
                                        }
                                    ],
                                    "worldSpace": true
                                }
                            }
                        ]
                    },
                    {
                        "uuid": "8d685575-0e84-4748-9b4e-0773344d31a1",
                        "type": "ParticleEmitter",
                        "name": "BubbleExplosionEmitter",
                        "layers": 1,
                        "matrix": [
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            1
                        ],
                        "up": [
                            0,
                            1,
                            0
                        ],
                        "ps": {
                            "version": "3.0",
                            "autoDestroy": false,
                            "looping": false,
                            "prewarm": false,
                            "duration": 1,
                            "shape": {
                                "type": "sphere",
                                "radius": 0.07,
                                "arc": 6.283185307179586,
                                "thickness": 1,
                                "mode": 0,
                                "spread": 0,
                                "speed": {
                                    "type": "ConstantValue",
                                    "value": 1
                                }
                            },
                            "startLife": {
                                "type": "IntervalValue",
                                "a": 0.3,
                                "b": 0.7
                            },
                            "startSpeed": {
                                "type": "IntervalValue",
                                "a": 5,
                                "b": 11
                            },
                            "startRotation": {
                                "type": "ConstantValue",
                                "value": 0
                            },
                            "startSize": {
                                "type": "IntervalValue",
                                "a": 0.25,
                                "b": 0.65
                            },
                            "startColor": {
                                "type": "ConstantColor",
                                "color": {
                                    "r": 1,
                                    "g": 1,
                                    "b": 1,
                                    "a": 1
                                }
                            },
                            "emissionOverTime": {
                                "type": "ConstantValue",
                                "value": 0
                            },
                            "emissionOverDistance": {
                                "type": "ConstantValue",
                                "value": 0
                            },
                            "emissionBursts": [
                                {
                                    "time": 0,
                                    "count": {
                                        "type": "ConstantValue",
                                        "value": 20
                                    },
                                    "probability": 1,
                                    "interval": 0.01,
                                    "cycle": 1
                                }
                            ],
                            "onlyUsedByOther": false,
                            "instancingGeometry": "433a755f-4115-4a64-bd06-1f05331a1078",
                            "renderOrder": 0,
                            "renderMode": 0,
                            "rendererEmitterSettings": {},
                            "material": "13febd4e-0fcb-4a93-9e1e-ecd26f51fdf9",
                            "layers": 1,
                            "startTileIndex": {
                                "type": "ConstantValue",
                                "value": 0
                            },
                            "uTileCount": 1,
                            "vTileCount": 1,
                            "blendTiles": false,
                            "softParticles": false,
                            "softFarFade": 0,
                            "softNearFade": 0,
                            "simulations": [
                                {
                                    "type": "ForceOverLife",
                                    "x": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    },
                                    "y": {
                                        "type": "ConstantValue",
                                        "value": -1.9600000000000002
                                    },
                                    "z": {
                                        "type": "ConstantValue",
                                        "value": 0
                                    }
                                },
                                {
                                    "type": "SizeOverLife",
                                    "size": {
                                        "type": "PiecewiseBezier",
                                        "functions": [
                                            {
                                                "function": {
                                                    "p0": 0.725,
                                                    "p1": 0.820175920529332,
                                                    "p2": 0.9964393858931454,
                                                    "p3": 0.95625
                                                },
                                                "start": 0
                                            },
                                            {
                                                "function": {
                                                    "p0": 0.95625,
                                                    "p1": 0.9276931264865874,
                                                    "p2": 0.5867122749838567,
                                                    "p3": 0.56407094
                                                },
                                                "start": 0.3708154
                                            },
                                            {
                                                "function": {
                                                    "p0": 0.56407094,
                                                    "p1": 0.5388256414370334,
                                                    "p2": 0.78042638844737,
                                                    "p3": 0.77038664
                                                },
                                                "start": 0.6343011
                                            },
                                            {
                                                "function": {
                                                    "p0": 0.77038664,
                                                    "p1": 0.7681511437753881,
                                                    "p2": 1,
                                                    "p3": 1
                                                },
                                                "start": 0.9280901
                                            },
                                            {
                                                "function": {
                                                    "p0": 1,
                                                    "p1": 1,
                                                    "p2": 1,
                                                    "p3": 1
                                                },
                                                "start": 0.9935065
                                            }
                                        ]
                                    }
                                },
                                {
                                    "type": "LimitSpeedOverLife",
                                    "speed": {
                                        "type": "ConstantValue",
                                        "value": 0.1
                                    },
                                    "dampen": 0.15
                                },
                                {
                                    "type": "EmitSubParticleSystem",
                                    "subParticleSystem": "023fcdcf-f625-4089-8652-944559bfa261",
                                    "useVelocityAsBasis": false,
                                    "mode": 0,
                                    "emitProbability": 1
                                }
                            ],
                            "worldSpace": true
                        }
                    }
                ]
            }
        }
        let ps = app.loadParticleFromJson(json, {
            position: [-1, 0, 0],
            scale: [2, 2, 2],
            onAddSystem(object, system) {
                // 设置成循环播放
                system.looping = true
            },
        })
        
        const ui = await app.getConfigPane({ title: "工具", style: { width: "110px"}});
        ui.appendChild({
            type: "button",
            label: '移除粒子',
            value: async ()=>{
                app.removeParticle(ps)
            }
        })
        
        
    }
    catch (e) {
        console.error(e);
    }
};