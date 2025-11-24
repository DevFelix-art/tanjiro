const ensureSystemBotDB = () => {
  if (!global.db) global.db = { data: {} }
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.systembot) {
    global.db.data.systembot = {
      enabled: true,
      owners: ['18094374392@s.whatsapp.net'],
      domains: {
        'kozow.com': true,
        'giize.com': true,
        'xo.je': true,
        'misite.site': true,
        'ooguy.com': true
      },
      statusbot: `> Velocidad: 12 ms\n> Speed: 14\n> Webs manager: 6\n> Vps Manager: 0`
    }
  }
  return global.db.data.systembot
}

const normalizeToJid = (input) => {
  if (!input) return null
  if (input.includes('@')) return input.replace(/[^0-9@.]/g, '')
  const digits = input.replace(/[^0-9]/g, '')
  if (!digits) return null
  return digits + '@s.whatsapp.net'
}

const senderIsOwner = (sender, db) => {
  if (!sender) return false
  if (db.owners && db.owners.includes(sender)) return true
  if (global.owner && Array.isArray(global.owner)) {
    const normalized = global.owner.map(o => {
      const raw = Array.isArray(o) ? (o[0] || '') : (o || '')
      return raw.toString().replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    })
    if (normalized.includes(sender)) return true
  }
  return false
}

/* handler principal para comandos con prefijo (#s-status, #s-domain, #add-owner) */
const handler = async (m, { conn, args = [], command = '', usedPrefix = '', text = '' }) => {
  try {
    const db = ensureSystemBotDB()
    const sender = m.sender || (m.key && m.key.participant) || ''
    const isOwner = senderIsOwner(sender, db)

    // Sólo owners autorizados pueden usar los comandos de este archivo
    if (!isOwner) return await m.reply?.('❌ Solo el owner puede usar estos comandos.')

    // Si SystemBot está desactivado, ignorar TODO excepto permitir que el owner active con
    // el mensaje sin prefijo "SystemBot-enable". Aquí devolvemos sin respuesta para cumplir eso.
    if (!db.enabled) return

    const cmd = (command || '').toString().toLowerCase()

    // #s-status
    if (cmd === 's-status' || cmd === 'sstatus') {
      const statusbot = db.statusbot
      const domainsbot = Object.keys(db.domains).map(d => `> ${d}`).join('\n')
      const caption = `> Bot: SystemBot-V2\n\n*《◇》 STATUS BOT 《◇》*\n\n${statusbot}\n\n*《♡》 DOMAINS 《♡》*\n\n${domainsbot}`

      // Construir fake quoted para que parezca respuesta a "SystemBot-V2 | Online."
      const quotedFake = {
        key: {
          fromMe: false,
          id: 'systembot-status-quoted',
          remoteJid: m.chat,
          participant: db.owners && db.owners[0] ? db.owners[0] : sender
        },
        message: {
          conversation: 'SystemBot-V2 | Online.'
        }
      }

      try {
        await conn.sendMessage(m.chat, { image: { url: 'https://qu.ax/pWOnQ.jpg' }, caption }, { quoted: quotedFake })
      } catch (e) {
        // fallback a texto si algo falla
        await m.reply?.(caption + '\n\nhttps://qu.ax/pWOnQ.jpg')
      }
      return
    }

    // #s-domain <dominio> <suspended|actived>
    if (cmd === 's-domain' || cmd === 'sdomain') {
      if (!args || args.length < 2) return await m.reply?.('Uso: #s-domain <dominio> <suspended|actived>\nEj: #s-domain xo.je suspended')
      const domain = args[0].toLowerCase()
      const action = args[1].toLowerCase()
      if (!Object.prototype.hasOwnProperty.call(db.domains, domain)) {
        return await m.reply?.('*❌ Dominio no reconocido. Dominios permitidos:*\n' + Object.keys(db.domains).map(d => `- ${d}`).join('\n'))
      }
      if (action === 'suspended') {
        if (!db.domains[domain]) return await m.reply?.('*ℹ️ El dominio ya estaba suspendido.*')
        db.domains[domain] = false
        return await m.reply?.('*✅ El dominio fue suspendido.*')
      } else if (action === 'actived' || action === 'activated' || action === 'activate') {
        if (db.domains[domain]) return await m.reply?.('*ℹ️ El dominio ya estaba activado.*')
        db.domains[domain] = true
        return await m.reply?.('*✅ El dominio fue activado y ya puedes ver o alojar tu web en el.*')
      } else {
        return await m.reply?.('Acción inválida. Usa: suspended | actived\nEj: #s-domain xo.je suspended')
      }
    }

    // #add-owner <numero|mención|reply>
    if (cmd === 'add-owner' || cmd === 'addowner') {
      // obtener target desde reply, mencion o argumento
      let target = null
      if (m.quoted && (m.quoted.sender || (m.quoted.key && m.quoted.key.participant))) {
        target = m.quoted.sender || (m.quoted.key && m.quoted.key.participant)
      } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0]
      } else if (args && args.length > 0) {
        target = normalizeToJid(args[0])
      }

      if (!target) return await m.reply?.('Uso: #add-owner <numero|mención> o responde al mensaje de la persona.\nEj: #add-owner 5491112345678')

      target = target.replace(/[^0-9@.]/g, '')
      if (!target.includes('@')) target = target + '@s.whatsapp.net'

      if (db.owners.includes(target)) return await m.reply?.('*ℹ️ Esta persona ya es owner autorizado.*')
      db.owners.push(target)
      return await m.reply?.('*✅ Owner agregado con éxito.*')
    }

  } catch (e) {
    console.error('Error en _ai-SystemBot handler:', e)
    try { await m.reply?.('Ocurrió un error al ejecutar el comando.') } catch {}
  }
}

/* before: intercepta mensajes SIN prefijo para SystemBot-enable / systembot-disable
   y bloquea al owner cuando db.enabled === false (no responde a nada excepto enable) */
handler.before = async (m, { conn }) => {
  try {
    if (!m || !m.text) return false
    const db = ensureSystemBotDB()
    const text = m.text.trim()
    const ltext = text.toLowerCase()
    const sender = m.sender || (m.key && m.key.participant) || ''
    const isOwner = senderIsOwner(sender, db)

    // Permitir sólo a owners cambiar el estado
    if (ltext === 'systembot-enable' || ltext === 'systembot-disable') {
      if (!isOwner) {
        // opcional: responder que no tiene permisos
        await m.reply?.('❌ Solo el owner puede usar este comando.')
        return true
      }
      if (ltext === 'systembot-enable') {
        if (db.enabled) {
          await m.reply?.('✅ SystemBot ya estaba activado.')
          return true
        }
        db.enabled = true
        await m.reply?.('✅ SystemBot online.')
        return true
      } else {
        if (!db.enabled) {
          await m.reply?.('❌ SystemBot ya estaba desactivado.')
          return true
        }
        db.enabled = false
        await m.reply?.('❌ SystemBot Disabled.')
        return true
      }
    }

    // Si está desactivado, ignorar TODO lo que haga el owner (no responder)
    if (!db.enabled && isOwner) {
      return true // mensaje manejado/ignorado
    }

    return false
  } catch (e) {
    console.error('Error en _ai-SystemBot.before:', e)
    return false
  }
}

/* Metadata para el loader del bot (ajusta si tu framework usa otras claves) */
handler.help = ['s-status', 's-domain <dominio> <suspended|actived>', 'add-owner <numero|mención|reply>']
handler.tags = ['owner', 'system']
handler.command = ['s-status', 's-domain', 'add-owner'] // comandos con prefijo

export default handler