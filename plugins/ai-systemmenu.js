const handler = async (m, { conn }) => {
  const nombre = '@' + (m.sender?.split('@')[0] || 'usuario');
  const texto = `*《 MENU SystemBot-V2 》*

*╔━━ INFO BOT ━━╗*
${infobot}
*╚━━━━━━━━━━╝*

*╔━ INFO - STATUS ━╗*
${infostatus}
*╚━━━━━━━━━━╝*

> *Commands the SystemBot-V2*

*╔━━ STATUS ━━╗*
*| SystemBot-actived*
*| SystemBot-Desactived*
*| .s-status*
*╚━━━━━━━━━━╝*

*╔━━ MAIN ━━╗*
*| .s-domain (domain|option)*
*| .add-owner (number|mention)*
*| .add-domain (dates the domain)*
*╚━━━━━━━━━━╝*
> Good bye`;

  await conn.sendMessage(
    m.chat,
    {
      image: { url: global.banner }, // Usa la imagen desde global.banner de settings.js
      caption: texto,
      mentions: [m.sender]
    },
    { quoted: m }
  );
};

handler.command = ['s-menu', 's-help'];

export default handler;