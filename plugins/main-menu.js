import fs from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'

const pad = v => String(v).padStart(2, '0')
const formatClock = ms => {
  if (typeof ms !== 'number' || isNaN(ms)) return '00:00:00'
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}
const formatPing = ms => {
  if (typeof ms !== 'number' || isNaN(ms)) return '0ms'
  if (ms < 1000) return `${ms} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)} s`
  return `${(ms / 60000).toFixed(2)} m`
}

const readSessionConfig = (conn) => {
  try {
    const botId = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
    if (!botId) return {}
    const configPath = join('./JadiBots', botId, 'config.json')
    if (!fs.existsSync(configPath)) return {}
    return JSON.parse(fs.readFileSync(configPath))
  } catch (e) {
    return {}
  }
}

const ensureDB = () => {
  if (!global.db) global.db = { data: { users: {} } }
  if (!global.db.data) global.db.data = { users: {} }
  if (!global.db.data.users) global.db.data.users = {}
}

let handler = async (m, { conn }) => {
  ensureDB()

  // lectura de config de sesión (JadiBots/<botId>/config.json)
  const cfg = readSessionConfig(conn)
  const nombreBot = cfg.name || cfg.currency || cfg?.botname || '⏤͟͞ू⃪ ፝͜⁞𝐓ꪖn͟𝐣𝐢𝐫𝐨 - 𝐔𝐥𝐭𝐫𝐚 𝐁𝐨𝐭 ִֶ ࣪˖ 🔥ִֶָ་༘' // prefer name, fallback currency or botname
  const currency = cfg.currency || 'Monedas'
  const bannerUrl = cfg.banner || 'https://qu.ax/STuvx.jpg'

  // thumbnail para externalAdReply (intentar descargar)
  let thumbnail = null
  try {
    const res = await fetch(bannerUrl)
    thumbnail = await res.buffer()
  } catch (e) {
    thumbnail = null
  }

  // uptime
  let uptimeMs = 0
  try {
    if (conn?.uptime) uptimeMs = conn.uptime
    else if (typeof process !== 'undefined' && process.uptime) uptimeMs = Math.floor(process.uptime() * 1000)
    else uptimeMs = 0
  } catch (e) { uptimeMs = 0 }
  const uptime = formatClock(uptimeMs)

  // ping aproximado (desde timestamp del mensaje)
  let msgTimestamp = 0
  if (m?.messageTimestamp) msgTimestamp = m.messageTimestamp * 1000
  else if (m?.message?.timestamp) msgTimestamp = m.message.timestamp * 1000
  else if (m?.key?.t) msgTimestamp = m.key.t * 1000
  else msgTimestamp = Date.now()
  const p = formatPing(Date.now() - msgTimestamp)

  // total de usuarios en db
  const totalreg = Object.keys(global.db.data.users).length

  // username del que invoca
  let username = m.pushName || m.name || m.sender.split('@')[0]
  try { username = await conn.getName(m.sender) || username } catch (e) {}

  // obtener stats del usuario desde la DB
  const user = global.db.data.users[m.sender] || { money: 0, exp: 0, level: 1 }
  const userMoney = user.money || 0
  const userExp = user.exp || 0
  const userLevel = user.level || 1

  // rango según si es admin en el grupo (si aplica)
  let rango = 'Súbdito'
  try {
    if (m.isGroup) {
      const meta = await conn.groupMetadata(m.chat)
      const participant = meta.participants.find(p => p.id === m.sender)
      if (participant && (participant.admin || participant.isAdmin)) rango = 'Aprendiz'
    }
  } catch (e) {}

  // calcular posicion en el top del grupo (solo si es grupo)
  let rankText = 'N/A'
  try {
    if (m.isGroup) {
      const meta = await conn.groupMetadata(m.chat)
      const groupJids = meta.participants.map(p => p.id)
      const arr = Object.keys(global.db.data.users)
        .filter(jid => groupJids.includes(jid))
        .map(jid => {
          const u = global.db.data.users[jid] || {}
          return { jid, total: (u.money || 0) + (u.bank || 0) }
        })
        .sort((a, b) => b.total - a.total)
      const idx = arr.findIndex(x => x.jid === m.sender)
      rankText = idx >= 0 ? String(idx + 1) : 'N/A'
    } else {
      const arr = Object.keys(global.db.data.users)
        .map(jid => {
          const u = global.db.data.users[jid] || {}
          return { jid, total: (u.money || 0) + (u.bank || 0) }
        })
        .sort((a, b) => b.total - a.total)
      const idx = arr.findIndex(x => x.jid === m.sender)
      rankText = idx >= 0 ? String(idx + 1) : 'N/A'
    }
  } catch (e) { rankText = 'N/A' }

  // construir texto según el template proporcionado
  let txt = `¡𝐇𝐨𝐥𝐚! Soy *Tanjiro Kamado*
> Aquí tienes mi lista de comandos:

*╭ׅׄ̇─ׅ̻ׄ╮۪̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇⊹۪̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇⊹۪̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇⊹*
├ׁ̟̇            「 BOT - INFO 」 
*├ׁ̟̇ ✎ Creador:* DevDaniel
*├ׁ̟̇ ✎ Usuarios:* ${totalreg}
*├ׁ̟̇ ✎ Baileys:* Múlti Device
*├ׁ̟̇ ✎ Bot:* ${(conn.user.jid == global.conn.user.jid ? 'Principal' : 'Sub-Bot')}
*├ׁ̟̇ ✎ Tiempo activo:* ${uptime}
*├ׁ̟̇ ✎ Latencia:* ${p}
*╰━─━─≪≪✠≫≫─━─━╯*


*╭ׅׄ̇─ׅ̻ׄ╮۪̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇⊹۪̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇⊹۪̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇⊹*
├ׁ̟̇          「 INFO - USER 」 
*├ׁ̟̇ ✎ Nombre:* ${username}
*├ׁ̟̇ ✎ Rango:* ${rango}
*├ׁ̟̇ ✎ Nivel:* ${userLevel}
*├ׁ̟̇ ✎ ${currency}:* ${userMoney}
*├ׁ̟̇ ✎ Exp:* ${userExp}
*╰━─━─≪≪✠≫≫─━─━╯*
> Puedes hacerte Sub-Bot escribiendo los comandos *#code* para código de 8 dígitos y *#qr* para código Qr (de foto).


*➪ 𝗟𝗜𝗦𝗧𝗔*
       *➪  𝗗𝗘*
           *➪ 𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦*


*╔━ HERRAMIENTAS ━╗*
> ❏ *#pinterest <texto>*
➪ Descarga 10 imágenes de pinterest.
> *❏ #play <musica>*
➪ Descarga música como audio.
> *❏ #catbox <imagen>*
➪ Convierte fotos, videos o gifts en enlace.
> *❏ #toimg <sticker>*
➪ Convierte stickers en imagen.
> *❏ #pin <texto>*
➪ Descarga 10 imágenes de pinterest.
> *❏ #yts <link>*
➪ Descarga un video convertido en audio de YouTube mediante el enlace.
> *❏ #ytv*
➪ Descarga un video de YouTube mediante el enlace.
> *❏ #play2*
➪ Descarga video de YouTube.
> *❏ #ytm3*
➪ Descarga video de YouTube como mp3.
> *❏ #ytmp4*
➪ Descarga videos de YouTube como mp4.
*╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▭╝*


*╔━      SOCKETS     ━╗*
> *❏ #qr*
➪ Convietete en Sub-Bot mediante un código qr.
> *❏ #code*
➪ Conviértete en Sub-Bot mediante un código de 8 dígitos.
> *❏ #self <on/off>*
➪ Has que tu Session te responda solo a ti o a todos.
> *❏ #sologp <on/off>*
➪ Has que tu Session solo responda en grupos.
> *❏ #leave*
➪ Salte de un grupo.
*╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▭╝*


*╔━      JUEGOS     ━╗*
> *❏ #formarpareja5*
➪ El bot forma 5 parejas a lo random.
> *❏ #formarpareja*
➪ El bot forma una pareja a lo random.
> *❏ #top <texto>*
➪ El bot forma un top 10 a lo random.
*╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▭╝*


*╔━      EMOX     ━╗*
> *❏ #bailar*
➪ Has el baile de tilin.
> *❏ #dance*
➪ Has un bailesito perron.
> *❏ #lamer*
➪ Lame a alguien.
> *❏ #lamber*
➪ Lambe a alguien.
> *❏ #feliz*
➪ Envía un gift de alguien feliz.
> *❏ #happy*
➪ Di a todos que estas feliz.
> *❏ #triste*
➪ Di a todos que estas triste.
> *❏ #borracho*
➪ Emborrachate con un gifts.
> *❏ #drunk*
➪ Emborrachate.
> *❏ #kill*
➪ Mata a alguien del grupo.
> *❏ #matar*
➪ Matate a ti mismo o a alguien del grupo.
> *❏ #kiss*
➪ Besa a alguien del grupo.
> *❏ #besar*
➪ Besate a ti mismo o a alguien del grupo.
*╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▭╝*


*╔━      STICKERS     ━╗*
> *❏ #s*
➪ Crea Stickers con fotos videos gifts u otros stickers.
> *❏ #sticker*
➪ Crea Stickers con fotos o videos.
> *❏ #brat*
➪ Conviete stickers en textos.
> *❏ #qc*
➪ Has stickers de textos con tu nombre de usuario.
> *❏ #emojimix*
➪ Mescla dos emojis para hacer un sticker.
> *❏ #take*
➪ *Undefined*
> *❏ #wm*
➪ *Undefined*
> *❏ #bratv*
➪ Convierte textos en stickers de vídeo.
*╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▭╝*


╔━      GESTIÓN     ━╗*
> *❏ #testwelcome*
➪ Mira el mensaje de bienvenida.
> *❏ #testbye*
➪ Mira el mensaje de despedida. 
> *❏ #bye <on/off>*
➪ Activa o desactiva la despedida. 
> *❏ #welcome <on/off>*
➪ Activa o desactiva la bienvenida.
> *❏ #antienlace <on/off>*
➪ Activa o desactiva el antilinks.
> *❏ #antilink <on/off>*
➪ Activa o desactiva el antienlace. 
> *❏ #modoadmin <on/off>* 
➪ Activa o desactiva el modo de que el bot solo le responda a los administradores.
> *❏ #detect <on/off>* 
➪ Activa o desactiva los mensajes de avisos.
*╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▭╝*


*╔━     GRUPOS     ━╗*
> *❏ #demote*
➪ Quita a alguien de admin.
> *❏ #promote*
➪ Pon a alguien de admin. 
> *❏ #delete*
➪  Elimina un mensaje.
> *❏ #kick*
➪ Elimina a una persona.
> *❏ #del*
➪ Elimina un mensaje.
> *❏ #promover*
➪ Has que alguien sea admin del grupo. 
> *❏ #degradar*
➪ Quita a una persona de admin del grupo. 
> *❏ #delprimary*
➪ Quita al bot principal que está puesto en tu grupo.
> *❏ #setprimary*
➪ Has que un solo Sub-Bot responda en tu grupo.
*╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▭╝*


*╔━      ECONOMÍA     ━╗*
> *❏ #daily*
➪ Reclama una recompensa todos los días.
> *❏ #cofre*
➪ Reclama un cofre diario.
> *❏ #minar*
➪ Mina y gana *${currency}* cada 24 minutos.
> *❏ #rob*
➪ Roba *${currency}* a los usuarios cada 1 hora.
> *❏ #rob2*
➪ Roba Exp a usuarios cada 1 hora.
> *❏ #depositar <all>*
➪ Deposita tus *${currency}* al banco.
> *❏ #d <all>*
➪ Deposita tus *${currency}* al banco.
> *❏ #lvl*
➪ Sube de nivel.
> *❏ #bal*
➪ Mira cuantos recursos tienes en total.
> *❏ #baltop*
➪ Mira el top de usuarios con más recursos del grupo.
> *❏ #w*
➪ Trabaja para ganar *${currency}.*
> *❏ #trabajar*
➪ Trabaja para ganar *${currency}.*
> *❏ #work*
➪ Trabaja para ganar *${currency}.*
> *❏ #chambear*
➪ Trabaja para ganar *${currency}.*
> *❏ #chamba*
➪ Trabaja para ganar *${currency}.*
> *❏ #slut*
➪ prostitutate para ganar *${currency}*
> *❏ #prostituirse*
➪ prostitutate para ganar *${currency}*
> *❏ #perfil*
➪ Mira tu perfil e información.
> *❏ #profile*
➪ Mira tu perfil.
*╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▭╝*


*╔━   OWNER   ━╗*
> *❏ #autoadmin*
➪ Has que el bot te de admin en el grupo.
> *❏ #join*
➪ Has que el bot se una a un grupo.
> *❏ #update*
➪ Actualiza al bot.
> *❏ #spamwa*
➪ Has spam a un usuario.
> *❏ #prefix*
➪ Pon un solo prefijo al bot.
> *❏ #rprefix*
➪ Restablese el prefijo del bot.
*╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▭╝*


> ${textbot}
`.trim()

  // mentions: mencionar al usuario que abrió el menú (opc.)
  const mentions = [m.sender]

  await conn.sendMessage(m.chat, {
    text: txt,
    contextInfo: {
      mentionedJid: mentions,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: global.channelRD?.id || '',
        serverMessageId: '',
        newsletterName: global.channelRD?.name || ''
      },
      externalAdReply: {
        title: nombreBot,
        body: global.textbot || '',
        mediaType: 1,
        mediaUrl: global.redes || '',
        sourceUrl: global.redes || '',
        thumbnail,
        showAdAttribution: false,
        containsAutoReply: true,
        renderLargerThumbnail: true // thumbnail grande (como enlace)
      }
    }
  }, { quoted: m })
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']

export default handler