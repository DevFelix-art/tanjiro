import ws from 'ws'

const handler = async (m, { conn, usedPrefix }) => {
  const chat = global.db.data.chats[m.chat]

  if (!chat.primaryBot) {
    return conn.reply(m.chat, `*Aquí no hay bot principal*`, m, rcanal)
  }

  try {
    const oldPrimary = chat.primaryBot
    chat.primaryBot = null

    conn.reply(
      m.chat, 
      `*🔥 El bot @${oldPrimary.split`@`[0]} fue quitado de principal. Ahora todos los bots responderán en este grupo.*`, 
      m, 
      { mentions: [oldPrimary] }
    )
  } catch (e) {
    conn.reply(
      m.chat, 
      `*😿 No pude hacerlo. disculpa.*`, 
      m
    )
  }
}

handler.help = ['delprimary']
handler.tags = ['grupo']
handler.command = ['delprimary']
handler.admin = true  

export default handler