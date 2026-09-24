function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function isValidIp(ip) {
  const p = ip.split('.').map(Number);
  return p.length === 4 && p.every(x => !isNaN(x) && x >= 0 && x <= 255);
}

module.exports = {
  name: 'subnet',
  alias: ['ipcalc', 'cidr'],
  category: 'tools',
  description: 'Kalkulator subnet IP (CIDR)',

  async run({ from, args, sendMessage }) {
    let ip = args?.[0];
    let cidr = parseInt(args?.[1], 10);

    // Support format 192.168.1.0/24
    if (ip && ip.includes('/')) {
      const parts = ip.split('/');
      ip = parts[0];
      cidr = parseInt(parts[1], 10);
    }

    if (!ip || isNaN(cidr) || cidr < 0 || cidr > 32) {
      return sendMessage(from,
        '🌐 *SUBNET CALCULATOR*\n\n' +
        '*Format:* `subnet <ip> <cidr>`\n' +
        'Atau: `subnet <ip/cidr>`\n\n' +
        '*Contoh:*\n' +
        '• `subnet 192.168.1.0 24`\n' +
        '• `subnet 10.0.0.0/8`\n' +
        '• `subnet 172.16.0.0 16`'
      );
    }

    if (!isValidIp(ip)) return sendMessage(from, '❌ IP gak valid.');

    const ipInt = ipToInt(ip);
    const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = totalHosts > 2 ? totalHosts - 2 : totalHosts;
    const firstHost = totalHosts > 2 ? network + 1 : network;
    const lastHost = totalHosts > 2 ? broadcast - 1 : broadcast;

    // Class IP
    const firstOctet = (network >>> 24) & 255;
    let kelas = 'A';
    if (firstOctet >= 128 && firstOctet < 192) kelas = 'B';
    else if (firstOctet >= 192 && firstOctet < 224) kelas = 'C';
    else if (firstOctet >= 224 && firstOctet < 240) kelas = 'D (Multicast)';
    else if (firstOctet >= 240) kelas = 'E (Experimental)';

    // Private IP check
    let tipe = '🌍 Public';
    if (firstOctet === 10) tipe = '🏠 Private (10.x.x.x)';
    else if (firstOctet === 172 && ((network >>> 16) & 255) >= 16 && ((network >>> 16) & 255) <= 31) tipe = '🏠 Private (172.16-31.x.x)';
    else if (firstOctet === 192 && ((network >>> 16) & 255) === 168) tipe = '🏠 Private (192.168.x.x)';
    else if (firstOctet === 127) tipe = '🔁 Loopback';
    else if (firstOctet === 169 && ((network >>> 16) & 255) === 254) tipe = '⚠️ Link-Local (APIPA)';

    await sendMessage(from,
      `🌐 *SUBNET CALCULATOR*\n\n` +
      `📌 IP: \`${ip}\`\n` +
      `📌 CIDR: \`/${cidr}\`\n` +
      `📌 Subnet Mask: \`${intToIp(mask)}\`\n\n` +
      `━━━━━━━━━━━━━━\n` +
      `🏠 Network: \`${intToIp(network)}\`\n` +
      `📡 Broadcast: \`${intToIp(broadcast)}\`\n` +
      `🔽 First Host: \`${intToIp(firstHost)}\`\n` +
      `🔼 Last Host: \`${intToIp(lastHost)}\`\n\n` +
      `━━━━━━━━━━━━━━\n` +
      `👥 Total Hosts: *${totalHosts.toLocaleString('id-ID')}*\n` +
      `✅ Usable Hosts: *${usableHosts.toLocaleString('id-ID')}*\n\n` +
      `🏷️ Kelas: *${kelas}*\n` +
      `🌍 Tipe: *${tipe}*`
    );
  },
};
