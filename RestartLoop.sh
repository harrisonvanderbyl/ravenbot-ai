# Runs ts-node ./index in superuser mode, and then if it crashes, immediatly call this .sh file to restart it
echo startloop
ts-node ./index.ts
git pull
bash ./RestartLoop.sh