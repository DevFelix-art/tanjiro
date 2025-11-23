import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"

// ====

global.owner = [
"573235915041",
"18094374392"
]

global.suittag = ["1829×××××××"] 
global.prems = []

// ====

global.libreria = "Baileys Multi Device"
global.vs = "^1.8.2|Latest"
global.nameqr = "🔥 Tanjiro Ultra Bot 🔥"
global.sessions = "Session"
global.jadi = "JadiBots"
global.yukiJadibts = true

// ====

global.botname = "Yotsuba Nakano"
global.textbot = "𝓓𝓮𝓿𝓮𝓵𝓸𝓹𝓮𝓭 𝓫𝔂 *DanielDev*"
global.dev = "Made With *Daniel*"
global.author = "Made With *Daniel*"
global.etiqueta = "DevDaniel"
global.currency = "Monedas"
global.emoji = "🔥"
global.banner = "https://files.catbox.moe/o2zoj6.png"
global.icono = "https://files.catbox.moe/o2zoj6.png"
global.catalogo = "https://files.catbox.moe/o2zoj6.png"

// ====

global.group = "https://whatsapp.com/channel/0029VbBWqxJIXnlpbekjVV37"
global.community = "https://whatsapp.com/channel/0029VbBWqxJIXnlpbekjVV37"
global.channel = "https://whatsapp.com/channel/0029VbBWqxJIXnlpbekjVV37"
global.github = "https://whatsapp.com/channel/0029VbBWqxJIXnlpbekjVV37"
global.gmail = "https://whatsapp.com/channel/0029VbBWqxJIXnlpbekjVV37"
global.ch = {
ch1: "120363403323307346@newsletter"
}

// ====

global.APIs = {
xyro: { url: "https://xyro.site", key: null },
yupra: { url: "https://api.yupra.my.id", key: null },
vreden: { url: "https://api.vreden.web.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
zenzxz: { url: "https://api.zenzxz.my.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null }
}

// ====

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'settings.js'"))
import(`${file}?update=${Date.now()}`)
})
