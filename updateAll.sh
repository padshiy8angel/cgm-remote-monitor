cd /cmg
rm -R cgm-remote-monitor
git clone https://github.com/padshiy8angel/cgm-remote-monitor
cd cgm-remote-monitor
npm install &&   npm run postinstall &&   npm run env &&   npm audit fix
sh start.sh