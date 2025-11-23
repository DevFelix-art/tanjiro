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
global.vs = "^1.0.0"
global.nameqr = "🔥̶۫̄͟Ⓣ︎𓏲𝐓a҉𝐧𝐣і̷r̤᥆𓍲̈͜𝗨̴ᥣ̥𝗍̈rᥲ̄𓊓̵̬𝐁o҉t̸⋆͙̈么͟͞──"
global.sessions = "Session"
global.jadi = "JadiBots"
global.Jadibts = true

// ====

global.botname = "⏤͟͞ू⃪ ፝͜⁞𝐓ꪖn͟𝐣𝐢𝐫𝐨 - 𝐔𝐥𝐭𝐫𝐚 𝐁𝐨𝐭 ִֶ ࣪˖🔥 ִֶָ་༘"
global.textbot = "𝓓𝓮𝓿𝓮𝓵𝓸𝓹𝓮𝓭 𝓫𝔂 𝐃𝖾𝘃𝐃𝖺𝗻𝗂𝗲𝗅"
global.dev = "Made With 𝐃𝖾𝘃𝐃𝖺𝗻𝗂𝗲𝗅"
global.author = "Made With 𝐃𝖾𝘃𝐃𝖺𝗻𝗂𝗲𝗅"
global.etiqueta = "𝐃𝖾𝘃𝐃𝖺𝗻𝗂𝗲𝗅"
global.currency = "Monedas"
global.emoji = "🔥"
global.banner = "https://qu.ax/EBBsc.jpg"
global.icono = "https://qu.ax/lTOFy.jpg"
global.catalogo = "https://qu.ax/STuvx.jpg"

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
