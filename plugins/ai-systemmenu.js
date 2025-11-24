import fs from 'fs';
import fetch from 'node-fetch';

const infobot = '*| Status:* ✅ Online > *| Commmands:* > *| Owners:* 2';
const infostatus = '*| ServerName:* System > *| CPU:* 13/25 % vCores > *| RAM:* 12 GB > *| Websites:* 3 > *|Domains:* 6 > *| Vps:* 0';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `*《 MENU SystemBot-V2 》*\n*╔━━ INFO BOT ━━╗*\n${infobot}\n*╚━━━━━━━━━━╝*\n*╔━ INFO - STATUS ━╗*\n${infostatus}\n*╚━━━━━━━━━━╝*\n> *Commands the SystemBot-V2*\n*╔━━ STATUS ━━╗*\n*| SystemBot-actived\n*| SystemBot-Desactived\n*| .s-status\n*╚━━━━━━━━━━╝*\n*╔━━ MAIN ━━╗*\n*| .s-domain (domain|option)\n*| .add-owner (number|mention)\n*| .add-domain (dates the domain)\n*╚━━━━━━━━━━╝*\n> Good bye`,
      image: { url: 'https:                    
    }, { quoted: m });
  }
};

handler.command = ['//qu.ax/pWOnQ.jpg' }
    }, { quoted: m });
  }
};

handler.command = ['s-menu', 's-help'];

export default handler;