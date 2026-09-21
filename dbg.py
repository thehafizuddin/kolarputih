
import glob, asyncio, re
from playwright.async_api import async_playwright
CHROME = glob.glob('/home/ubuntu/.cache/ms-playwright/chromium-*/chrome-linux*/chrome')[0]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--no-sandbox','--disable-dev-shm-usage'])
        pg = await b.new_page(viewport={'width':1440,'height':950})
        await pg.goto('https://kolarputih.vercel.app/', wait_until='networkidle')
        await pg.wait_for_timeout(1500)
        # brand subtree
        print('=== NAV BRAND innerText ===')
        print(repr(await pg.inner_text('.brand')))
        print('=== NAV BRAND innerHTML ===')
        print((await pg.inner_html('.brand'))[:400])
        await pg.goto('https://kolarputih.vercel.app/about', wait_until='networkidle')
        await pg.wait_for_timeout(1500)
        print('=== TEAM SECTION text ===')
        t = await pg.inner_text('.team')
        print(t)
        print('=== end team ===')
        await b.close()
asyncio.run(main())
