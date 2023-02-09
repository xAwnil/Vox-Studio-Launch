'use strict';

import { database, changePanel, addAccount, accountSelect } from '../utils.js';
const { Mojang } = require('minecraft-java-core');
const { ipcRenderer } = require('electron');

class Login {
    static id = "login";
    async init(config) {
        this.config = config
        this.database = await new database().init();
        if (this.config.online) this.getOnline()
        else this.getOffline()
        this.botoneslinks()
    }

    getOnline() {
        console.log(`Initializing microsoft Panel...`)
        console.log(`Initializing mojang Panel...`)
        this.loginMicrosoft();
        this.loginMojang();
        document.querySelector('.cancel-login').addEventListener("click", () => {
            document.querySelector(".cancel-login").style.display = "none";
            changePanel("settings");
        })
    }

    getOffline() {
        console.log(`Initializing microsoft Panel...`)
        console.log(`Initializing mojang Panel...`)
        console.log(`Initializing offline Panel...`)
        this.loginMicrosoft();
        this.loginOffline();
        document.querySelector('.cancel-login').addEventListener("click", () => {
            document.querySelector(".cancel-login").style.display = "none";
            changePanel("settings");
        })
    }

    loginMicrosoft() {
        let microsoftBtn = document.querySelector('.microsoft')
        let mojangBtn = document.querySelector('.mojang')
        let cancelBtn = document.querySelector('.cancel-login')

        microsoftBtn.addEventListener("click", () => {
            microsoftBtn.disabled = true;
            mojangBtn.disabled = true;
            cancelBtn.disabled = true;
            ipcRenderer.invoke('Microsoft-window', this.config.client_id).then(account_connect => {
                if (!account_connect) {
                    microsoftBtn.disabled = false;
                    mojangBtn.disabled = false;
                    cancelBtn.disabled = false;
                    return;
                }

                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.client_token,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    refresh_token: account_connect.refresh_token,
                    user_properties: account_connect.user_properties,
                    meta: {
                        type: account_connect.meta.type,
                        xuid: account_connect.meta.xuid,
                        demo: account_connect.meta.demo
                    }
                }

                let profile = {
                    uuid: account_connect.uuid,
                    skins: account_connect.profile.skins || [],
                    capes: account_connect.profile.capes || []
                }

                this.database.add(account, 'accounts')
                this.database.add(profile, 'profile')
                this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

                addAccount(account)
                accountSelect(account.uuid)
                changePanel("home");

                microsoftBtn.disabled = false;
                mojangBtn.disabled = false;
                cancelBtn.disabled = false;
                cancelBtn.style.display = "none";
            }).catch(err => {
                console.log(err)
                microsoftBtn.disabled = false;
                mojangBtn.disabled = false;
                cancelBtn.disabled = false;

            });
        })
    }

    loginMojang() {
        let mailInput = document.querySelector('.Mail')
        let passwordInput = document.querySelector('.Password')
        let cancelMojangBtn = document.querySelector('.cancel-mojang')
        let loginBtn = document.querySelector(".login-btn")
        let mojangBtn = document.querySelector('.mojang')

        mojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "none";
            document.querySelector(".login-card-mojang").style.display = "block";
        })

        cancelMojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "block";
            document.querySelector(".login-card-mojang").style.display = "none";
        })

        loginBtn.addEventListener("click", () => {
            cancelMojangBtn.disabled = true;
            loginBtn.disabled = true;
            mailInput.disabled = true;
            passwordInput.disabled = true;


            if (mailInput.value == "") {
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            if (passwordInput.value == "") {
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            Mojang.getAuth(mailInput.value, passwordInput.value).then(account_connect => {
                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.client_token,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    user_properties: account_connect.user_properties,
                    meta: {
                        type: account_connect.meta.type,
                        offline: account_connect.meta.offline
                    }
                }

                this.database.add(account, 'accounts')
                this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

                addAccount(account)
                accountSelect(account.uuid)
                changePanel("home");

                cancelMojangBtn.disabled = false;
                cancelMojangBtn.click();
                mailInput.value = "";
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                loginBtn.style.display = "block";
            }).catch(err => {
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
            })
        })
    }

    loginOffline() {
        let mailInput = document.querySelector('.Mail')
        let passwordInput = document.querySelector('.Password')
        let cancelMojangBtn = document.querySelector('.cancel-mojang')
        let loginBtn = document.querySelector(".login-btn")
        let mojangBtn = document.querySelector('.mojang')

        mojangBtn.innerHTML = "Login Crack"

        mojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "none";
            document.querySelector(".login-card-mojang").style.display = "block";
        })

        cancelMojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "block";
            document.querySelector(".login-card-mojang").style.display = "none";
        })

        var sendbtn = document.getElementById('login-btn');

        loginBtn.addEventListener("click", () => {
            cancelMojangBtn.disabled = true;
            loginBtn.disabled = true;
            mailInput.disabled = true;
            passwordInput.disabled = false;
            document.getElementById("checkme").checked = false;
            document.getElementById("login-btn").disabled = true;
            sendbtn.innerText = "Acepta los terminos";


            if (mailInput.value == "") {
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = true;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            if (mailInput.value.length < 3) {
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = true;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            Mojang.getAuth(mailInput.value, passwordInput.value).then(async account_connect => {
                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.client_token,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    user_properties: account_connect.user_properties,
                    meta: {
                        type: account_connect.meta.type,
                        offline: account_connect.meta.offline
                    }
                }

                this.database.add(account, 'accounts')
                this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

                addAccount(account)
                accountSelect(account.uuid)
                changePanel("home");

                cancelMojangBtn.disabled = false;
                cancelMojangBtn.click();
                mailInput.value = "";
                mailInput.disabled = false;
                passwordInput.disabled = false;
                loginBtn.style.display = "block";
            }).catch(err => {
                console.log(err)
                cancelMojangBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
            })
        })
    }
    botoneslinks(){
        //funcion sleep
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
          }
        //botones linkeados
        const discord = document.querySelector(".discord")
        discord.addEventListener("click", () => {
            window.open("https://discord.io/VoxStudios", '_blank');
        })

        const patreon = document.querySelector(".patreon")
        patreon.addEventListener("click", () => {
            window.open("https://patreon.com/VoxStudios551", '_blank');
        })


        //Acept terms and conditions
        var checker = document.getElementById('checkme');
        var sendbtn = document.getElementById('login-btn');
        checker.onchange = function(){
       if(this.checked){
           sendbtn.disabled = false;
           sendbtn.style.opacity= '0'
           sleep(100)
           sendbtn.style.opacity= '1'
           sendbtn.innerText = "Acceder";
       } else {
           sendbtn.disabled = true;
           sendbtn.style.opacity= '0'
           sleep(7)
           sendbtn.style.opacity= '1'
           sendbtn.innerText = "Acepta los terminos";
       }
       
       

       }
    }
}

export default Login;