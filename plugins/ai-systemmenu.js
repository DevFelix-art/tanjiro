const handler = async (m, { conn }) => {
  const nombre = '@' + (m.sender?.split('@')[0] || 'usuario');
  const texto = `*《 MENU SystemBot-V2 》*

*╔━━ INFO BOT ━━╗*
*| Status:* ✅ Online 
*| Commmands:* 7
*| Owners:* 2
*╚━━━━━━━━━━╝*     

*╔━ INFO - STATUS ━╗*
*| ServerName:* System
*| CPU:* 13/25 % vCores 
*| RAM:* 12 GB 
*| Websites:* 3 
*|Domains:* 6 
*| Vps:* 0
*╚━━━━━━━━━━╝*     

> *Commands the SystemBot-V2*

*╔━━    STATUS  ━━╗*
*| SystemBot-actived*
*| SystemBot-Desactived*
*| .s-status*
*╚━━━━━━━━━━╝*     

*╔━━    MAIN   ━━╗*
*| .s-help*
*| .s-menu*
*| .s-domain (domain|option)*
*| .add-owner (number|mention)*
*| .add-domain (dates the domain)*
*╚━━━━━━━━━━╝* 

> Good bye`;

  await conn.sendMessage(
    m.chat,
    {
      image: { url: global.banner }, // Usa la imagen desde global.menu
      caption: texto,
      mentions: [m.sender]
    },
    { quoted: m }
  );
};

handler.command = ['s-menu', 's-help'];
handler.group = false;
handler.rowner = true;

export default handler;