import { jidDecode } from '@whiskeysockets/baileys'
import path from 'path'
import fs from 'fs'

const handler = async (m, { conn, command, usedPrefix }) => {
  try {
    const isSubBots = [conn.user.jid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].includes(m.sender)
    if (!isSubBots) return m.reply(`❖ El comando *setbanner* solo puede ser usado por el dueño del número del *bot*.`)

    const rawId = conn.user?.id || ''
    const cleanId = jidDecode(rawId)?.user || rawId.split('@')[0]
    const index = global.conns?.findIndex(c => c.user.jid === m.sender)
    if (global.conn.user.jid === conn.user.jid)
      return conn.reply(m.chat, '🔥 Este comando está deshabilitado en las sesiones principales.', m, rcanal)
    if (index === -1 || !global.conns[index])
      return conn.reply(m.chat, '🔥 La sesión ya está cerrada o no se encontró una conexión activa.', m, rcanal)
    conn.reply(m.chat, '🔥 Tu sesión ha sido cerrada exitosamente.', m, rcanal)
    setTimeout(async () => {
      await global.conns[index].logout()
      global.conns.splice(index, 1)
      const sessionPath = path.join(global.jadi, cleanId)
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true })
        console.log(`La session de ${cleanId} eliminada de ${sessionPath}`)
      }
    }, 3000)
  } catch (error) {
    await m.react('✖️')
    conn.reply(m.chat, `Error:\n\n${error.message || error}`, m, rcanal)
  }
}

handler.command = ['logout']
handler.help = ['logout']
handler.tags = ['socket']

export default handler