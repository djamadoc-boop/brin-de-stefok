#!/bin/bash
# Optimisation automatique avant déploiement Netlify

echo "🎨 Minification CSS..."
npx cssnano style.css style.min.css

echo "📦 Minification JS..."
npx terser app.js -o app.min.js --compress --mangle

echo "🖼️ Optimisation images..."
# Nécessite imagemagick ou sharp
find images -name "*.jpg" -exec convert {} -quality 85 -resize '800>' {}.tmp \; -exec mv {}.tmp {} \;

echo "✅ Build terminé"