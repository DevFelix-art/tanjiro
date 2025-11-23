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

// normalizar texto para comparar categorías (quita acentos y pasa a minúsculas)
const normalize = s => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

let handler = async (m, { conn }) => {
  ensureDB()

  // lectura de config de sesión (JadiBots/<botId>/config.json)
  const cfg = readSessionConfig(conn)
  const nombreBot = cfg.name || cfg.currency || cfg?.botname || 'Yotsuba Nakano' // prefer name, fallback currency or botname
  const currency = cfg.currency || 'Coins'
  const bannerUrl = cfg.banner || 'https://qu.ax/zRNgk.jpg'

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

  // -------------------------
  // Definición de categorías: cada valor es un bloque "plano" de comandos (ej. '#menu\n#help')
  // -------------------------
  // Guardado como objeto (similar a un JSON), cada propiedad contiene las líneas de comandos.
  const menu = {
    sistema: '#menu\n#help\n#p\n#ping',
    herramientas: '#pinterest <texto>\n#play <musica>\n#catbox <imagen>\n#toimg <sticker>\n#pin <texto>\n#yts\n#ytv\n#play2\n#ytm3\n#ytmp4\n#yta',
    sockets: '#qr\n#code\n#self <on/off>\n#sologp <on/off>\n#leave\n#setname <nombre>\n#setbanner <foto>\n#setcurrency <moneda>\n#setmoneda <moneda>\n#set',
    nsfw: '#sexo\n#69\n#violar\n#r34',
    juegos: '#formarpareja5\n#formarpareja\n#top',
    emox: '#bailar\n#dance\n#lamer\n#lamber\n#feliz\n#happy\n#triste\n#borracho\n#drunk\n#kill\n#matar\n#kiss\n#besar',
    stickers: '#s\n#sticker\n#brat\n#qc\n#emojimix\n#take\n#wm\n#bratv',
    rpg: '#daily\n#cofre\n#minar\n#rob\n#rob2\n#depositar <all>\n#d <all>\n#lvl\n#bal\n#baltop\n#w\n#trabajar\n#work\n#chambear\n#chamba\n#slut\n#prostituirse\n#perfil\n#profile',
    gestion: '#testwelcome\n#testbye\n#bye <on/off>\n#welcome <on/off>\n#antienlace <on/off>\n#antilink <on/off>\n#modoadmin <on/off>\n#detect <on/off>',
    grupos: '#demote\n#promote\n#delete\n#kick\n#del\n#promover\n#degradar\n#delprimary\n#setprimary\n#tagall\n#invocar\n#todos',
    owner: '#autoadmin\n#join\n#update\n#spamwa\n#prefix\n#rprefix'
  }

  // construir sidebar (lista de categorías)
  const sidebarLines = Object.keys(menu).map(k => `• ${k.toUpperCase()}`)
  const sidebar = sidebarLines.join('\n')

  // obtener argumento de categoría si el usuario lo puso: ejemplo "#menú herramientas"
  const fullText = (m.text || '').toString()
  const argsText = fullText.trim().split(/\s+/).slice(1).join(' ').trim() // todo lo que haya después del comando
  const requestedRaw = argsText // texto original escrito por el usuario después de #menú
  const requestedNorm = normalize(requestedRaw)

  // función para buscar clave de menú por texto normalizado
  const findMenuKey = (norm) => {
    if (!norm) return null
    for (const k of Object.keys(menu)) {
      if (normalize(k) === norm) return k
      // permitir coincidencias con nombre visible (sin acentos)
      if (normalize(k) === norm) return k
      // permitir coincidencias parciales exactas (por ejemplo "herramientas" == "herramientas")
      if (k.toLowerCase() === norm) return k
    }
    return null
  }

  const foundKey = findMenuKey(requestedNorm)

  // Helper para enviar mensajes con same contextInfo
  const sendWithContext = async (chatId, text) => {
    const mentions = [m.sender]
    await conn.sendMessage(chatId, {
      text,
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
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
  }

  // Si el usuario pidió una categoría específica
  if (requestedRaw && requestedRaw.length > 0) {
    if (!foundKey) {
      // categoría no existe -> enviar mensaje de error
      const errorText = `[ ☆ ] La categoría (${requestedRaw}) no existe. Puedes ver las categorías en <#menú sistema>`
      await sendWithContext(m.chat, errorText)
      return
    } else {
      // categoría encontrada -> mostramos sidebar + contenido (contenido mostrado como líneas de comandos)
      const commandsRaw = menu[foundKey] || ''
      const formattedCommands = commandsRaw.split('\n').map(l => l.trim()).filter(Boolean).join('\n')
      const catTitle = `*${foundKey.toUpperCase()}*\n`
      const txt = `¡𝐇𝐨𝐥𝐚! Soy *${nombreBot}* ${(conn.user.jid == global.conn.user.jid ? '(OficialBot)' : '(Sub-Bot)')}

❄ ¡Espero que tengas una feliz Navidad! ☃️

*╭╼ BOT - INFO 𐦯*
*|✎ Users:* ${totalreg.toLocaleString()}
*|✎ Uptime:* ${uptime}
*|✎ Ping:* ${p}
*|✎ Baileys:* PixelCrew-Bails
*|✎ Comandos:* https://yotsuba-web.giize.com/commands.html
*╰─…*

*╭╼ INFO - USER 𐦯*
*|✎ Nombre:* ${username}
*|✎ ${currency}:* ${userMoney}
*|✎ Exp:* ${userExp}
*|✎ Rango:* ${rango}
*|✎ Nivel:* ${userLevel}
*╰─…*

*➪ 𝗟𝗜𝗦𝗧𝗔*    (Categorías a la izquierda, comandos de la categoría a la derecha)

${sidebar}

${catTitle}${formattedCommands}

> ${global.textbot || ''}`.trim()

      await sendWithContext(m.chat, txt)
      return
    }
  }

  // si no pidió categoría -> mostrar todo el menú (sidebar + todo el contenido)
  const allCommandsBlocks = Object.entries(menu)
    .map(([k, v]) => `*${k.toUpperCase()}*\n${v.split('\n').map(l => l.trim()).filter(Boolean).join('\n')}`)
    .join('\n\n')

  const txt = `¡𝐇𝐨𝐥𝐚! Soy *${nombreBot}* ${(conn.user.jid == global.conn.user.jid ? '(OficialBot)' : '(Sub-Bot)')}

❄ ¡Espero que tengas una feliz Navidad! ☃️

*╭╼ BOT - INFO 𐦯*
*|✎ Users:* ${totalreg.toLocaleString()}
*|✎ Uptime:* ${uptime}
*|✎ Ping:* ${p}
*|✎ Baileys:* PixelCrew-Bails
*|✎ Comandos:* https://yotsuba-web.giize.com/commands.html
*╰─…*

*╭╼ INFO - USER 𐦯*
*|✎ Nombre:* ${username}
*|✎ ${currency}:* ${userMoney}
*|✎ Exp:* ${userExp}
*|✎ Rango:* ${rango}
*|✎ Nivel:* ${userLevel}
*╰─…*

*➪ 𝗟𝗜𝗦𝗧𝗔*    (Categorías a la izquierda, comandos a la derecha)

${sidebar}

${allCommandsBlocks}

> ${global.textbot || ''}`.trim()

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

handler.help = ['menu', 'menú']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']

export default handler