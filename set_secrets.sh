#!/usr/bin/env bash
# Sets the GitHub Actions secrets needed for auto-deploy on push to main.
# Values are read from local files and never echoed.
set -euo pipefail

REPO="thehafizuddin/kolarputih"
PY="/home/ubuntu/kolarputih/.secenv/bin/python"
SCRIPT="/home/ubuntu/kolarputih/set_gh_secret.py"

export GITHUB_TOKEN="$(grep -oP 'GITHUB_TOKEN=\K.*' /home/ubuntu/.github_token.secret | tr -d '"')"
VT="$(grep -oP 'VERCEL_TOKEN=\K.*' /home/ubuntu/expense-tracker/.env | tr -d '"')"

export SECRET_NAME=VERCEL_TOKEN SECRET_VALUE="$VT"
"$PY" "$SCRIPT" "$REPO"

export SECRET_NAME=VERCEL_ORG_ID SECRET_VALUE="WPHSrEVl5Rfl20zhWNBAFz6Z"
"$PY" "$SCRIPT" "$REPO"

export SECRET_NAME=VERCEL_PROJECT_ID SECRET_VALUE="prj_Tp5moPRTF1ab2TyUNFKZ7Jlms2lM"
"$PY" "$SCRIPT" "$REPO"

echo "done"
