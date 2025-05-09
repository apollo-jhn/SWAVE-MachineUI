#!/bin/bash
cd /home/powamare/Desktop/design_project/SWAVE-DesignProject || exit
npm run build
python3 api/main.py &
sleep 3
firefox --kiosk http://localhost:5000/machineui

# Keep terminal open
exec bash
