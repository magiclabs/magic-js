# Install process and buffer into React-native node_modules, so it get published

cd ./packages/react-native || echo "Failed to install React-native dependencies"
npm install buffer@$(node -p -e "require('./package.json').dependencies.buffer")
npm install process@$(node -p -e "require('./package.json').dependencies.process")

