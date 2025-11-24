import fs from 'fs';

const infobot = '*| Status:* ✅ Online > *| Commmands:* > *| Owners:* 2';
const infostatus = '*| ServerName:* System\n*| CPU:* 13/25 % vCores\n*| RAM:* 12 GB\n*| Websites:* 3\n*|Domains:* 6\n*| Vps:* 0';

const menuText = `
*《 MENU SystemBot-V2 》*

*╔━━ INFO BOT ━━╗*
${infobot}
*╚━━━━━━━━━━╝*

*╔━ INFO - STATUS ━╗*
${infostatus}
*╚━━━━━━━━━━╝*

> *Commands the SystemBot-V2*

*╔━━ STATUS ━━╗*
*| SystemBot-actived
*| SystemBot-Desactived
*| .s-status
*╚━━━━━━━━━━╝*

*╔━━ MAIN ━━╗*
*| .s-domain (domain|option)
*| .add-owner (number|mention)
*| .add-domain (dates the domain)
*╚━━━━━━━━━━╝*
> Good bye
`.trim();

const handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    // Cambia esta URL por la de tu imagen. También puedes poner una ruta local y usar fs.readFileSync.
    const imageUrl = 'https://qu.ax/pWOnQ.jpg';

    if (!text) {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: imageUrl },
          caption );
  } catch (err) {
    console.error('Handler error:', err);
    try {
      await conn.sendMessage(m.chat, { text: 'Ocurrió un error al procesar el comando.' }, { quoted: m });
    } catch (_) {}
  }
};

handler.command = ['mmenu', 's-help'];

export default handler;