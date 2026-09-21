import json, os, base64, time, sys, urllib.request, urllib.error

TOKEN = os.environ["VERCEL_TOKEN"]
API = "https://api.vercel.com"
PROJ = sys.argv[1] if len(sys.argv) > 1 else "kolarputih"
SRC = sys.argv[2] if len(sys.argv) > 2 else "/home/ubuntu/kolarputih/dist"

def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(API + path, data=data, method=method)
    r.add_header("Authorization", "Bearer " + TOKEN)
    r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return {"_error": e.code, "_body": e.read().decode()[:800]}

files = []
for root, dirs, names in os.walk(SRC):
    for n in names:
        fp = os.path.join(root, n)
        rel = os.path.relpath(fp, SRC)
        with open(fp, "rb") as fh:
            files.append({"file": rel, "data": base64.b64encode(fh.read()).decode(), "encoding": "base64"})
print("files:", len(files), sorted(f["file"] for f in files if "/" not in f["file"]))

depl = req("POST", "/v13/deployments", {
    "name": PROJ,
    "files": files,
    "target": "production",
    "projectSettings": {"framework": None, "buildCommand": None,
                        "outputDirectory": None, "devCommand": None, "installCommand": None},
})
did = depl.get("id")
print("id:", did, "initial:", depl.get("readyState") or depl.get("status"))
if not did:
    print("RESP:", str(depl)[:800]); sys.exit(1)

for i in range(60):
    time.sleep(4)
    d = req("GET", f"/v13/deployments/{did}")
    st = d.get("readyState")
    print(f"  [{i}] {st}", flush=True)
    if st in ("READY", "ERROR", "CANCELED"):
        if st != "READY":
            print("DETAIL:", json.dumps({k: d.get(k) for k in ("errorMessage","errorCode","builds","aliasError")})[:900])
        print("url:", d.get("url"), "| alias:", d.get("alias"))
        break
