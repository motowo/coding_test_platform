FROM mcr.microsoft.com/playwright:v1.41.0-focal

# Node.js環境のセットアップ
WORKDIR /workspace

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# プロジェクトファイルをコピー
COPY . .

# Playwrightブラウザのインストール
RUN npx playwright install

# 実行コマンド
CMD ["tail", "-f", "/dev/null"]