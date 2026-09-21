#!/usr/bin/env python3
"""Create/update a GitHub Actions secret from a value, using libsodium sealed box.

GitHub rejects plaintext secret writes; the value must be sealed with the repo's
Actions public key.

Usage:
    GITHUB_TOKEN=ghp_... SECRET_NAME=VERCEL_TOKEN SECRET_VALUE=... \
        python set_gh_secret.py OWNER/REPO
"""
import base64, os, sys, json, urllib.request
from nacl.public import PublicKey
from nacl.bindings import crypto_box_seal

REPO = sys.argv[1]
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
SECRET_NAME = os.environ["SECRET_NAME"]
SECRET_VALUE = os.environ["SECRET_VALUE"]


def api(method, path, body=None):
    req = urllib.request.Request(
        "https://api.github.com" + path, method=method,
        headers={"Authorization": "Bearer " + GITHUB_TOKEN,
                 "Accept": "application/vnd.github+json"})
    if body is not None:
        req.data = json.dumps(body).encode()
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())


pk = api("GET", f"/repos/{REPO}/actions/secrets/public-key")
key_id, pub = pk["key_id"], PublicKey(base64.b64decode(pk["key"]))
sealed = crypto_box_seal(SECRET_VALUE.encode(), bytes(pub))
enc = base64.b64encode(sealed).decode()
res = api("PUT", f"/repos/{REPO}/actions/secrets/{SECRET_NAME}",
          {"encrypted_value": enc, "key_id": key_id})
print(f"secret {SECRET_NAME} set on {REPO} -> {res.get('status', 'ok')}")
