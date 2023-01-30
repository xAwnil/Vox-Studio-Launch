'use strict';

import { database, changePanel, accountSelect, Slider } from '../utils.js';
const dataDirectory = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME)

const os = require('os');

class Settings {
    static id = "settings";
    async init(config) {
        this.config = config;
        this.database = await new database().init();
        this.initSettingsDefault();
        this.initTab();
        this.initRam();
    }

    async initRam() {
        let ramDatabase = (await this.database.get('1234', 'ram'))?.value;
        let totalMem = Math.trunc(os.totalmem() / 1073741824 * 10) / 10;
        let freeMem = Math.trunc(os.freemem() / 1073741824 * 10) / 10;

        let sliderDiv = document.querySelector(".memory-slider");
        sliderDiv.setAttribute("max", Math.trunc((80 * totalMem) / 100));

        let ram = ramDatabase ? ramDatabase : { ramMin: "1", ramMax: "4" };
        let slider = new Slider(".memory-slider", parseFloat(ram.ramMin), parseFloat(ram.ramMax));

        let minSpan = document.querySelector(".slider-touch-left span");
        let maxSpan = document.querySelector(".slider-touch-right span");

        minSpan.setAttribute("value", `${ram.ramMin} Gb`);
        maxSpan.setAttribute("value", `${ram.ramMax} Gb`);

        slider.on("change", (min, max) => {
            minSpan.setAttribute("value", `${min} Gb`);
            maxSpan.setAttribute("value", `${max} Gb`);
            this.database.update({ uuid: "1234", ramMin: `${min}`, ramMax: `${max}` }, 'ram')
        });
    }

    initTab() {
        let TabBtn = document.querySelectorAll('.tab-btn');
        let TabContent = document.querySelectorAll('.tabs-settings-content');

        for (let i = 0; i < TabBtn.length; i++) {
            TabBtn[i].addEventListener('click', () => {
                if (TabBtn[i].classList.contains('save-tabs-btn')) return
                for (let j = 0; j < TabBtn.length; j++) {
                    TabContent[j].classList.remove('active-tab-content');
                    TabBtn[j].classList.remove('active-tab-btn');
                }
                TabContent[i].classList.add('active-tab-content');
                TabBtn[i].classList.add('active-tab-btn');
            });
        }

        document.querySelector('.save-tabs-btn').addEventListener('click', () => {
            document.querySelector('.default-tab-btn').click();
            changePanel("home");
        })
    }

    async initSettingsDefault() {
        if (!(await this.database.getAll('java-path')).length) {
            this.database.add({ uuid: "1234", path: false }, 'java-path')
        }

        if (!(await this.database.getAll('java-args')).length) {
            this.database.add({ uuid: "1234", args: [] }, 'java-args')
        }

        if (!(await this.database.getAll('launcher')).length) {
            this.database.add({
                uuid: "1234",
                launcher: {
                    close: 'close-launcher'
                }
            }, 'launcher')
        }

        if (!(await this.database.getAll('ram')).length) {
            this.database.add({ uuid: "1234", ramMin: "1", ramMax: "2" }, 'ram')
        }

        if (!(await this.database.getAll('screen')).length) {
            this.database.add({ uuid: "1234", screen: { width: "1280", height: "720" } }, 'screen')
        }
    }
}
export default Settings;