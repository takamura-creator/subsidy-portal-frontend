#!/bin/bash
# backend/data/subsidies.json → frontend/src/data/subsidies.json 同期スクリプト
#
# バックエンドの補助金データをフロントエンドの静的JSONにコピーする。
# Vercel は frontend のみ clone するため、ビルド時に backend を参照できない。
# データ更新後にこのスクリプトを実行し、フロントエンドに反映する。
#
# 使い方:
#   npm run sync-subsidies
#   または直接: bash scripts/sync-subsidies.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DATA="$FRONTEND_DIR/../backend/data/subsidies.json"
FRONTEND_DATA="$FRONTEND_DIR/src/data/subsidies.json"

if [ ! -f "$BACKEND_DATA" ]; then
  echo "ERROR: バックエンドデータが見つかりません: $BACKEND_DATA"
  exit 1
fi

# バックエンドのデータ形式を確認し、{subsidies: [...]} ラッパーで出力
python3 -c "
import json, sys

with open('$BACKEND_DATA') as f:
    data = json.load(f)

# リスト形式なら {subsidies: [...]} でラップ
if isinstance(data, list):
    output = {'subsidies': data}
elif isinstance(data, dict) and 'subsidies' in data:
    output = data
else:
    print('ERROR: 不明なデータ形式', file=sys.stderr)
    sys.exit(1)

subs = output['subsidies']
with open('$FRONTEND_DATA', 'w') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f'sync complete: {len(subs)} subsidies → src/data/subsidies.json')
"
