#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Diary App Hands-on Cleanup Script
#
# setup.sh で作ったプロジェクトディレクトリ (と fork) を削除して
# 「セットアップ前」の状態に戻します。動作確認をやり直したいときに使います。
#
# Usage (in WSL Ubuntu):
#   bash <(curl -fsSL https://raw.githubusercontent.com/ncc-toda/2026-add-diary-app/main/cleanup.sh)
#
# Optional:
#   PROJECT_DIR=~/work/diary-app bash <(curl -fsSL ...)
#   ASSUME_YES=1  bash <(curl -fsSL ...)   # 確認プロンプトをスキップ
#   KEEP_FORK=1   bash <(curl -fsSL ...)   # GitHub fork は残してローカルだけ消す
#
# 残るもの (このスクリプトは触りません):
#   - apt パッケージ (git, curl, direnv 等)
#   - GitHub CLI (gh) とログイン状態
#   - Nix
#   - ~/.bashrc の direnv フック
#   - VS Code 拡張
# ============================================================

PROJECT_PARENT_DIR="${PROJECT_PARENT_DIR:-$HOME/projects}"
PROJECT_DIR="${PROJECT_DIR:-$PROJECT_PARENT_DIR/2026-add-diary-app}"
REPO="ncc-toda/2026-add-diary-app"
REPO_OWNER="${REPO%%/*}"
REPO_NAME="${REPO##*/}"

info() { echo ""; echo "==> $*"; }
warn() { echo ""; echo "[warn] $*"; }

confirm() {
  local prompt="$1"
  if [ "${ASSUME_YES:-0}" = "1" ]; then
    return 0
  fi
  read -r -p "$prompt [y/N] " reply
  case "$reply" in
    [yY][eE][sS]|[yY]) return 0 ;;
    *) return 1 ;;
  esac
}

# ============================================================
# 削除対象の確認
# ============================================================

fork_to_delete=""
if [ "${KEEP_FORK:-0}" != "1" ] && command -v gh >/dev/null 2>&1; then
  current_user="$(gh api user -q .login 2>/dev/null || true)"

  if [ -n "$current_user" ] && [ "$current_user" != "$REPO_OWNER" ]; then
    candidate="$current_user/$REPO_NAME"
    if gh repo view "$candidate" >/dev/null 2>&1; then
      fork_to_delete="$candidate"
    fi
  fi
fi

cat <<EOF

以下を削除します:

  - プロジェクトディレクトリ: $PROJECT_DIR
    (.env.local も一緒に消えます)
EOF

if [ -n "$fork_to_delete" ]; then
  echo "  - GitHub fork: $fork_to_delete"
fi

echo ""

if ! confirm "本当に削除しますか?"; then
  echo "中止しました。"
  exit 0
fi

# ============================================================
# direnv deny (ディレクトリを消す前に許可を取り消す)
# ============================================================

if [ -d "$PROJECT_DIR" ] && command -v direnv >/dev/null 2>&1; then
  info "direnv の許可を取り消します"
  (cd "$PROJECT_DIR" && direnv deny . >/dev/null 2>&1) || true
fi

# ============================================================
# プロジェクトディレクトリ削除
# ============================================================

if [ -d "$PROJECT_DIR" ]; then
  info "プロジェクトディレクトリを削除します: $PROJECT_DIR"
  rm -rf "$PROJECT_DIR"
else
  warn "$PROJECT_DIR は存在しません (スキップ)"
fi

# ============================================================
# GitHub fork 削除
# ============================================================

if [ -n "$fork_to_delete" ]; then
  info "GitHub fork を削除します: $fork_to_delete"

  if ! gh repo delete "$fork_to_delete" --yes 2>/dev/null; then
    warn "fork の削除に失敗しました。'delete_repo' 権限が無い可能性があります。"
    warn "次のコマンドで権限を追加してから手動で削除してください:"
    warn "  gh auth refresh -h github.com -s delete_repo"
    warn "  gh repo delete $fork_to_delete --yes"
  fi
fi

# ============================================================
# 完了
# ============================================================

cat <<EOF

✅ クリーンアップが完了しました。

setup.sh をもう一度実行すれば、最初からセットアップできます:

  bash <(curl -fsSL https://raw.githubusercontent.com/ncc-toda/2026-add-diary-app/main/setup.sh)

EOF
