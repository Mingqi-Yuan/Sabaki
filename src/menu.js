const {shell, clipboard, remote} = require('electron')
const {app} = remote || require('electron')

const i18n = require('./i18n')
const setting = remote && remote.require('./setting')

const t = i18n.context('menu')
const sabaki = typeof window !== 'undefined' && window.sabaki
const dialog = sabaki && require('./modules/dialog')
const gametree = sabaki && require('./modules/gametree')

let toggleSetting = key => setting.set(key, !setting.get(key))
let selectTool = tool => (sabaki.setMode('edit'), sabaki.setState({selectedTool: tool}))
let treePosition = () => [sabaki.state.gameTrees[sabaki.state.gameIndex], sabaki.state.treePosition]

let data = [
    {
        _label: 'file',
        label: t('&File'),
        submenu: [
            {
                label: t('&New'),
                accelerator: 'CmdOrCtrl+N',
                click: () => sabaki.newFile({playSound: true, showInfo: true})
            },
            {
                label: t('New &Window'),
                accelerator: 'CmdOrCtrl+Shift+N',
                clickMain: 'newWindow',
                enabled: true
            },
            {type: 'separator'},
            {
                label: t('&Open…'),
                accelerator: 'CmdOrCtrl+O',
                click: () => sabaki.loadFile()
            },
            {
                label: t('&Save'),
                accelerator: 'CmdOrCtrl+S',
                click: () => sabaki.saveFile(sabaki.state.representedFilename)
            },
            {
                label: t('Sa&ve As…'),
                accelerator: 'CmdOrCtrl+Shift+S',
                click: () => sabaki.saveFile()
            },
            {type: 'separator'},
            {
                label: t('&Clipboard'),
                submenu: [
                    {
                        label: t('&Load SGF'),
                        click: () => sabaki.loadContent(clipboard.readText(), 'sgf')
                    },
                    {
                        label: t('&Copy SGF'),
                        click: () => clipboard.writeText(sabaki.getSGF())
                    },
                    {
                        label: t('Copy &ASCII Diagram'),
                        click: () => clipboard.writeText(gametree.getBoard(...treePosition()).generateAscii())
                    }
                ]
            },
            {type: 'separator'},
            {
                label: t('Game &Info'),
                accelerator: 'CmdOrCtrl+I',
                click: () => sabaki.openDrawer('info')
            },
            {
                label: t('&Manage Games…'),
                accelerator: 'CmdOrCtrl+Shift+M',
                click: () => sabaki.openDrawer('gamechooser')
            },
            {type: 'separator'},
            {
                label: t('&Preferences…'),
                accelerator: 'CmdOrCtrl+,',
                click: () => sabaki.openDrawer('preferences')
            }
        ]
    },
    {
        _label: 'play',
        label: t('&Play'),
        submenu: [
            {
                label: t('&Toggle Player'),
                click: () => sabaki.setPlayer(...treePosition(), -sabaki.getPlayer(...treePosition()))
            },
            {type: 'separator'},
            {
                label: t('&Select Point'),
                accelerator: 'CmdOrCtrl+L',
                click: () => dialog.showInputBox('Enter a coordinate to select a point', ({value}) => {
                    sabaki.clickVertex(value)
                })
            },
            {
                label: t('&Pass'),
                accelerator: 'CmdOrCtrl+P',
                click: () => {
                    const autoGenmove = setting.get('gtp.auto_genmove')
                    sabaki.makeMove([-1, -1], {sendToEngine: autoGenmove})
                }
            },
            {
                label: t('&Resign'),
                click: () => sabaki.makeResign()
            },
            {type: 'separator'},
            {
                label: t('&Estimate'),
                click: () => sabaki.setMode('estimator')
            },
            {
                label: t('Sc&ore'),
                click: () => sabaki.setMode('scoring')
            }
        ]
    },
    {
        _label: 'edit',
        label: t('&Edit'),
        submenu: [
            {
                label: t('&Undo'),
                accelerator: 'CmdOrCtrl+Z',
                click: () => sabaki.undo()
            },
            {
                label: t('Re&do'),
                accelerator: process.platform === 'win32' ? 'CmdOrCtrl+Y' : 'CmdOrCtrl+Shift+Z',
                click: () => sabaki.redo()
            },
            {type: 'separator'},
            {
                label: t('Toggle &Edit Mode'),
                accelerator: 'CmdOrCtrl+E',
                click: () => sabaki.setMode(sabaki.state.mode === 'edit' ? 'play' : 'edit')
            },
            {
                label: t('&Select Tool'),
                submenu: [
                    {
                        label: t('&Stone Tool'),
                        accelerator: 'CmdOrCtrl+1',
                        click: () => selectTool(
                            sabaki.state.mode !== 'edit' || sabaki.state.selectedTool !== 'stone_1'
                            ? 'stone_1' : 'stone_-1'
                        )
                    },
                    {
                        label: t('&Cross Tool'),
                        accelerator: 'CmdOrCtrl+2',
                        click: () => selectTool('cross')
                    },
                    {
                        label: t('&Triangle Tool'),
                        accelerator: 'CmdOrCtrl+3',
                        click: () => selectTool('triangle')
                    },
                    {
                        label: t('S&quare Tool'),
                        accelerator: 'CmdOrCtrl+4',
                        click: () => selectTool('square')
                    },
                    {
                        label: t('C&ircle Tool'),
                        accelerator: 'CmdOrCtrl+5',
                        click: () => selectTool('circle')
                    },
                    {
                        label: t('&Line Tool'),
                        accelerator: 'CmdOrCtrl+6',
                        click: () => selectTool('line')
                    },
                    {
                        label: t('&Arrow Tool'),
                        accelerator: 'CmdOrCtrl+7',
                        click: () => selectTool('arrow')
                    },
                    {
                        label: t('La&bel Tool'),
                        accelerator: 'CmdOrCtrl+8',
                        click: () => selectTool('label')
                    },
                    {
                        label: t('&Number Tool'),
                        accelerator: 'CmdOrCtrl+9',
                        click: () => selectTool('number')
                    }
                ]
            },
            {type: 'separator'},
            {
                label: t('&Copy Variation'),
                click: () => sabaki.copyVariation(...treePosition())
            },
            {
                label: t('Cu&t Variation'),
                click: () => sabaki.cutVariation(...treePosition())
            },
            {
                label: t('&Paste Variation'),
                click: () => sabaki.pasteVariation(...treePosition())
            },
            {type: 'separator'},
            {
                label: t('Make Main &Variation'),
                click: () => sabaki.makeMainVariation(...treePosition())
            },
            {
                label: t('Shift &Left'),
                click: () => sabaki.shiftVariation(...treePosition(), -1)
            },
            {
                label: t('Shift Ri&ght'),
                click: () => sabaki.shiftVariation(...treePosition(), 1)
            },
            {type: 'separator'},
            {
                label: t('&Flatten'),
                click: () => sabaki.flattenVariation(...treePosition())
            },
            {
                label: t('&Remove Node'),
                accelerator: process.platform === 'darwin' ? 'CmdOrCtrl+Backspace' : 'CmdOrCtrl+Delete',
                click: () => sabaki.removeNode(...treePosition())
            },
            {
                label: t('Remove &Other Variations'),
                click: () => sabaki.removeOtherVariations(...treePosition())
            }
        ]
    },
    {
        _label: 'find',
        label: t('Fin&d'),
        submenu: [
            {
                label: t('Toggle &Find Mode'),
                accelerator: 'CmdOrCtrl+F',
                click: () => sabaki.setMode(sabaki.state.mode === 'find' ? 'play' : 'find'),
            },
            {
                label: t('Find &Next'),
                accelerator: 'F3',
                click: () => {
                    sabaki.setMode('find')
                    sabaki.findMove(1, {
                        vertex: sabaki.state.findVertex,
                        text: sabaki.state.findText
                    })
                }
            },
            {
                label: t('Find &Previous'),
                accelerator: 'Shift+F3',
                click: () => {
                    sabaki.setMode('find')
                    sabaki.findMove(-1, {
                        vertex: sabaki.state.findVertex,
                        text: sabaki.state.findText
                    })
                }
            },
            {type: 'separator'},
            {
                label: t('Toggle &Hotspot'),
                accelerator: 'CmdOrCtrl+B',
                click: () => sabaki.setComment(...treePosition(), {
                    hotspot: treePosition()[0].get(treePosition()[1]).data.HO == null
                })
            },
            {
                label: t('Jump to Ne&xt Hotspot'),
                accelerator: 'F2',
                click: () => sabaki.findHotspot(1),
            },
            {
                label: t('Jump to Pre&vious Hotspot'),
                accelerator: 'Shift+F2',
                click: () => sabaki.findHotspot(-1),
            }
        ]
    },
    {
        _label: 'navigation',
        label: t('&Navigation'),
        submenu: [
            {
                label: t('&Back'),
                accelerator: 'Up',
                click: () => sabaki.goStep(-1)
            },
            {
                label: t('&Forward'),
                accelerator: 'Down',
                click: () => sabaki.goStep(1)
            },
            {type: 'separator'},
            {
                label: t('Go to &Previous Fork'),
                accelerator: 'CmdOrCtrl+Up',
                click: () => sabaki.goToPreviousFork()
            },
            {
                label: t('Go to &Next Fork'),
                accelerator: 'CmdOrCtrl+Down',
                click: () => sabaki.goToNextFork()
            },
            {type: 'separator'},
            {
                label: t('Go to Previous Commen&t'),
                accelerator: 'CmdOrCtrl+Shift+Up',
                click: () => sabaki.goToComment(-1)
            },
            {
                label: t('Go to Next &Comment'),
                accelerator: 'CmdOrCtrl+Shift+Down',
                click: () => sabaki.goToComment(1)
            },
            {type: 'separator'},
            {
                label: t('Go to Be&ginning'),
                accelerator: 'Home',
                click: () => sabaki.goToBeginning()
            },
            {
                label: t('Go to &End'),
                accelerator: 'End',
                click: () => sabaki.goToEnd()
            },
            {type: 'separator'},
            {
                label: t('Go to &Main Variation'),
                accelerator: 'CmdOrCtrl+Left',
                click: () => sabaki.goToMainVariation()
            },
            {
                label: t('Go to Previous &Variation'),
                accelerator: 'Left',
                click: () => sabaki.goToSiblingVariation(-1)
            },
            {
                label: t('Go to Next Va&riation'),
                accelerator: 'Right',
                click: () => sabaki.goToSiblingVariation(1)
            },
            {type: 'separator'},
            {
                label: t('Go to Move N&umber'),
                accelerator: 'CmdOrCtrl+G',
                click: () => dialog.showInputBox('Enter a move number to go to', ({value}) => {
                    sabaki.closeDrawer()
                    sabaki.goToMoveNumber(value)
                })
            },
            {type: 'separator'},
            {
                label: t('Go to Ne&xt Game'),
                accelerator: 'CmdOrCtrl+PageDown',
                click: () => sabaki.goToSiblingGame(1)
            },
            {
                label: t('Go to Previou&s Game'),
                accelerator: 'CmdOrCtrl+PageUp',
                click: () => sabaki.goToSiblingGame(-1)
            }
        ]
    },
    {
        _label: 'engines',
        label: t('Eng&ines'),
        submenu: [
            {
                label: t('Manage &Engines…'),
                click: () => (sabaki.setState({preferencesTab: 'engines'}), sabaki.openDrawer('preferences'))
            },
            {type: 'separator'},
            {
                label: t('&Attach…'),
                click: () => sabaki.openDrawer('info')
            },
            {
                label: t('&Detach'),
                click: () => sabaki.detachEngines()
            },
            {
                label: t('&Suspend'),
                enabled: true,
                click: () => sabaki.suspendEngines()
            },
            {type: 'separator'},
            {
                label: t('S&ynchronize'),
                accelerator: 'F6',
                click: () => sabaki.syncEngines()
            },
            {
                label: t('Toggle A&nalysis'),
                accelerator: 'F4',
                click: () => {
                    if (sabaki.state.analysisTreePosition == null) {
                        sabaki.closeDrawer()
                        sabaki.setMode('play')
                        sabaki.startAnalysis()
                    } else {
                        sabaki.stopAnalysis()
                    }
                }
            },
            {
                label: t('Start &Playing'),
                accelerator: 'F5',
                click: () => sabaki.generateMove({analyze: sabaki.state.analysis != null, followUp: true})
            },
            {
                label: t('Generate &Move'),
                accelerator: 'F10',
                click: () => sabaki.generateMove({analyze: sabaki.state.analysis != null})
            },
            {type: 'separator'},
            {
                label: t('Toggle &GTP Console'),
                click: () => {
                    toggleSetting('view.show_leftsidebar')
                    sabaki.setState(({showConsole}) => ({showConsole: !showConsole}))
                }
            },
            {
                label: t('&Clear Console'),
                click: () => sabaki.clearConsole()
            }
        ]
    },
    {
        _label: 'tools',
        label: t('&Tools'),
        submenu: [
            {
                label: t('Toggle Auto&play Mode'),
                click: () => sabaki.setMode(sabaki.state.mode === 'autoplay' ? 'play' : 'autoplay')
            },
            {
                label: t('Toggle &Guess Mode'),
                click: () => sabaki.setMode(sabaki.state.mode === 'guess' ? 'play' : 'guess')
            },
            {type: 'separator'},
            {
                label: t('Clean &Markup…'),
                click: () => sabaki.openDrawer('cleanmarkup')
            },
            {
                label: t('&Edit SGF Properties…'),
                click: () => sabaki.openDrawer('advancedproperties')
            },
            {type: 'separator'},
            {
                label: t('&Rotate Clockwise'),
                click: () => sabaki.rotateBoard(false)
            },
            {
                label: t('Rotate &Anticlockwise'),
                click: () => sabaki.rotateBoard(true)
            }
        ]
    },
    {
        _label: 'view',
        label: t('&View'),
        submenu: [
            {
                label: t('Toggle Menu &Bar'),
                click: () => toggleSetting('view.show_menubar')
            },
            {
                label: t('Toggle &Full Screen'),
                accelerator: process.platform === 'darwin' ? 'CmdOrCtrl+Shift+F' : 'F11',
                click: () => sabaki.setState(({fullScreen}) => ({fullScreen: !fullScreen}))
            },
            {type: 'separator'},
            {
                label: t('Show &Coordinates'),
                accelerator: 'CmdOrCtrl+Shift+C',
                checked: 'view.show_coordinates',
                click: () => toggleSetting('view.show_coordinates')
            },
            {
                label: t('Show Move N&umbers'),
                checked: 'view.show_move_numbers',
                click: () => toggleSetting('view.show_move_numbers')
            },
            {
                label: t('Show Move Colori&zation'),
                checked: 'view.show_move_colorization',
                click: () => toggleSetting('view.show_move_colorization')
            },
            {
                label: t('Show &Next Moves'),
                checked: 'view.show_next_moves',
                click: () => toggleSetting('view.show_next_moves')
            },
            {
                label: t('Show &Sibling Variations'),
                checked: 'view.show_siblings',
                click: () => toggleSetting('view.show_siblings')
            },
            {type: 'separator'},
            {
                label: t('Show Game &Tree'),
                checked: 'view.show_graph',
                accelerator: 'CmdOrCtrl+T',
                click: () => {
                    toggleSetting('view.show_graph')
                    sabaki.setState(({showGameGraph}) => ({showGameGraph: !showGameGraph}))
                }
            },
            {
                label: t('Show Co&mments'),
                checked: 'view.show_comments',
                accelerator: 'CmdOrCtrl+Shift+T',
                click: () => {
                    toggleSetting('view.show_comments')
                    sabaki.setState(({showCommentBox}) => ({showCommentBox: !showCommentBox}))
                }
            },
            {type: 'separator'},
            {
                label: t('Z&oom'),
                submenu: [
                    {
                        label: t('&Increase'),
                        accelerator: 'CmdOrCtrl+Plus',
                        click: () => setting.set('app.zoom_factor',
                            setting.get('app.zoom_factor') + .1
                        )
                    },
                    {
                        label: t('&Decrease'),
                        accelerator: 'CmdOrCtrl+-',
                        click: () => setting.set('app.zoom_factor',
                            Math.max(0, setting.get('app.zoom_factor') - .1)
                        )
                    },
                    {
                        label: t('&Reset'),
                        accelerator: 'CmdOrCtrl+0',
                        click: () => setting.set('app.zoom_factor', 1)
                    }
                ]
            }
        ]
    },
    {
        _label: 'help',
        label: t('&Help'),
        submenu: [
            {
                label: t(p => `${p.appName} v${p.version}`, {
                    appName: app.getName(),
                    version: app.getVersion()
                }),
                enabled: false
            },
            {
                label: t('Check for &Updates'),
                clickMain: 'checkForUpdates',
                enabled: true
            },
            {type: 'separator'},
            {
                label: t('GitHub &Repository'),
                click: () => shell.openExternal(`https://github.com/SabakiHQ/${sabaki.appName}`)
            },
            {
                label: t('Report &Issue'),
                click: () => shell.openExternal(`https://github.com/SabakiHQ/${sabaki.appName}/issues`)
            }
        ]
    }
]

let findMenuItem = str => data.find(item => item._label === str)

// Modify menu for macOS

if (process.platform === 'darwin') {
    // Add 'App' menu

    let appMenu = [{role: 'about'}]
    let helpMenu = findMenuItem('help')
    let items = helpMenu.submenu.splice(0, 3)

    appMenu.push(...items.slice(0, 2))

    // Remove original 'Preferences' menu item

    let fileMenu = findMenuItem('file')
    let preferenceItem = fileMenu.submenu.splice(fileMenu.submenu.length - 2, 2)[1]

    appMenu.push(
        {type: 'separator'},
        preferenceItem,
        {type: 'separator'},
        {submenu: [], role: 'services'},
        {
            label: t('Text'),
            submenu: [
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                {role: 'selectall'}
            ]
        },
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {type: 'separator'},
        {role: 'quit'}
    )

    data.unshift({
        label: t(app.getName()),
        submenu: appMenu
    })

    // Add 'Window' menu

    data.splice(data.length - 1, 0, {
        submenu: [
            {
                label: t('New Window'),
                clickMain: 'newWindow',
                enabled: true
            },
            {role: 'minimize'},
            {type: 'separator'},
            {role: 'front'}
        ],
        role: 'window'
    })

    // Remove 'Toggle Menu Bar' menu item

    let viewMenu = findMenuItem('view')
    viewMenu.submenu.splice(0, 1)
}

// Generate ids for all menu items

let generateIds = (menu, idPrefix = '') => {
    menu.forEach((item, i) => {
        item.id = idPrefix + i

        if ('submenu' in item) {
            generateIds(item.submenu, `${item.id}-`)
        }
    })
}

generateIds(data)

module.exports = exports = data

exports.clone = function(x = data) {
    if (Array.isArray(x)) {
        return [...Array(x.length)].map((_, i) => exports.clone(x[i]))
    } else if (typeof x === 'object') {
        let result = {}
        for (let key in x) result[key] = exports.clone(x[key])
        return result
    }

    return x
}
