'use strict';

import { logger, database, changePanel, accountSelect, Slider } from '../utils.js';


const { Launch, Status } = require('minecraft-java-core');
const { ipcRenderer } = require('electron');
const launch = new Launch();
const pkg = require('../package.json');

const dataDirectory = process.env.APPDATA || (process.platform == 'darwin' ? `${process.env.HOME}/Library/Application Support` : process.env.HOME)


class Home {
    static id = "home";
    async init(config) {
        this.config = config
        this.database = await new database().init();
        this.initLaunch();
        this.initBtn();
    }
    

    async initLaunch() {
        document.querySelector('.play-btn').addEventListener('click', async() => {
            let urlpkg = pkg.user ? `${pkg.url}/${pkg.user}` : pkg.url;
            let uuid = (await this.database.get('1234', 'accounts-selected')).value;
            let account = (await this.database.get(uuid.selected, 'accounts')).value;
            let ram = (await this.database.get('1234', 'ram')).value;
            let javaPath = (await this.database.get('1234', 'java-path')).value;
            let javaArgs = (await this.database.get('1234', 'java-args')).value;
            let Resolution = (await this.database.get('1234', 'screen')).value;
            let launcherSettings = (await this.database.get('1234', 'launcher')).value;
            let screen;

            let playBtn = document.querySelector('.play-btn');
            let info = document.querySelector(".text-download")
            let progressBar = document.querySelector(".progress-bar")

            if (Resolution.screen.width == '<auto>') {
                screen = false
            } else {
                screen = {
                    width: Resolution.screen.width,
                    height: Resolution.screen.height
                }
            }

            let opts = {
                url: this.config.game_url === "" || this.config.game_url === undefined ? `${urlpkg}/files` : this.config.game_url,
                authenticator: account,
                path: `${dataDirectory}/${process.platform == 'darwin' ? this.config.dataDirectory : `.${this.config.dataDirectory}`}`,
                version: this.config.game_version,
                detached: launcherSettings.launcher.close === 'close-all' ? false : true,
                downloadFileMultiple: 10,
                java: this.config.java,
                javapath: javaPath.path,
                args: [...javaArgs.args, ...this.config.game_args],
                screen,
                modde: this.config.modde,
                verify: this.config.verify,
                ignored: this.config.ignored,
                memory: {
                    min: `${ram.ramMin * 1024}M`,
                    max: `${ram.ramMax * 1024}M`
                }
            }

            playBtn.style.display = "none"
            info.style.display = "block"
            launch.Launch(opts);

            launch.on('progress', (DL, totDL) => {
                progressBar.style.display = "block"
                document.querySelector(".text-download").innerHTML = `Descargando ${((DL / totDL) * 100).toFixed(0)}%`
                ipcRenderer.send('main-window-progress', {DL, totDL})
                progressBar.value = DL;
                progressBar.max = totDL;
            })

            launch.on('speed', (speed) => {
                console.log(`${(speed / 1067008).toFixed(2)} Mb/s`)
            })

            launch.on('check', (e) => {
                progressBar.style.display = "block"
                document.querySelector(".text-download").innerHTML = `Verificacion ${((DL / totDL) * 100).toFixed(0)}%`
                progressBar.value = DL;
                progressBar.max = totDL;

            })

            launch.on('data', (e) => {
                new logger('Minecraft', '#36b030');
                if(launcherSettings.launcher.close === 'close-launcher') ipcRenderer.send("main-window-hide");
                progressBar.style.display = "none"
                info.innerHTML = `Empezando...`
                console.log(e);
            })

            launch.on('close', () => {
                if(launcherSettings.launcher.close === 'close-launcher') ipcRenderer.send("main-window-show");
                progressBar.style.display = "none"
                info.style.display = "none"
                playBtn.style.display = "block"
                info.innerHTML = `Verificacion`
                new logger('Launcher', '#7289da');
                console.log('Close');
            })
        })
    }
    initBtn() {

        // for hide and show profile
        let profilebtn = document.querySelector('.profile-btn');
        let cardprofile = document.querySelector(".cardprofile")
        let accountdelete = document.querySelector(".acount-delete")
        let cardprofiledragbar = document.querySelector(".cardprofile-dragbar")
        let cardprofileprofilepho = document.querySelector(".cardprofile-profilepho")
        let cardprofilex = document.querySelector('.cardprofile-x')

        document.querySelector('.profile-btn').addEventListener('click', () => {
            accountdelete.style.display='block'
            cardprofile.style.opacity= '1'
            cardprofiledragbar.style.opacity='1'
            cardprofileprofilepho.style.opacity='1'
            accountdelete.style.opacity='1'
            cardprofilex.style.display='block'
            cardprofilex.style.opacity='1'

        });

        document.querySelector('.cardprofile-x').addEventListener('click', () =>{
            accountdelete.style.display='none'
            cardprofile.style.opacity= '0'
            cardprofiledragbar.style.opacity='0'
            cardprofileprofilepho.style.opacity='0'
            accountdelete.style.opacity='0'
            cardprofilex.style.display='none'
            cardprofilex.style.opacity='0'
        })

        // for logout
        document.querySelector('.acount-delete').addEventListener('click', async (e) => {
            let uuid = e.target.id;
            let selectedaccount = await this.database.get('1234', 'accounts-selected');
            if (e.path[0].classList.contains('account')) {
                accountSelect(uuid);
                this.database.update({ uuid: "1234", selected: uuid }, 'accounts-selected');
            }

            if (e.target.classList.contains("accountdelete")) {
                this.database.delete(e.path[1].id, 'accounts');
                changePanel("login");
                
                if (e.path[1].id === selectedaccount.value.selected) {
                    let uuid = (await this.database.getAll('accounts'))[0].value.uuid
                    this.database.update({
                        uuid: "1234",
                        selected: uuid
                    }, 'accounts-selected')
                    accountSelect(uuid)
                }
            }

            accountdelete.style.display='none'
            cardprofile.style.opacity= '0'
            cardprofiledragbar.style.opacity='0'
            cardprofileprofilepho.style.opacity='0'
            accountdelete.style.opacity='0'
            cardprofilex.style.display='none'
            cardprofilex.style.opacity='0'
        })

        // settings
        document.querySelector('.setings-btn').addEventListener('click', () => {
            changePanel('settings');
        });
    }

    
    
}

export default Home;