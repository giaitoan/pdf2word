name: Deploy to GitHub Pages

on:
  push:
    branches: ["main", "master"] # Cháº¡y khi cÃ³ code má»›i Ä‘áº©y lÃªn nhÃ¡nh main hoáº·c master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        env:
          # DÃ²ng nÃ y sáº½ láº¥y API Key tá»« BÆ°á»›c 1 báº¡n Ä‘Ã£ cÃ i Ä‘á»ƒ Ä‘Æ°a vÃ o web
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
