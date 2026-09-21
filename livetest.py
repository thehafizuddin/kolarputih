import asyncio, glob, os

CHROME = glob.glob('/home/ubuntu/.cache/ms-playwright/chromium-*/chrome-linux*/chrome')[0]
BASE = 'https://kolarputih.vercel.app'
OUT = '/home/ubuntu/shots/live'

from playwright.async_api import async_playwright

async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--no-sandbox', '--disable-dev-shm-usage'])

        # --- desktop ---
        pg = await b.new_page(viewport={'width': 1440, 'height': 950})
        errs, failed = [], []
        pg.on('console', lambda m: errs.append(f'{m.type}: {m.text}') if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(f'pageerror: {e}'))
        pg.on('requestfailed', lambda r: failed.append(f'{r.url} :: {r.failure}'))

        await pg.goto(BASE + '/', wait_until='networkidle')
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'{OUT}/1-home.png')
        # assert key rendered text (client-side, so read the DOM)
        body = await pg.inner_text('body')
        checks = {
            'hero headline': 'Compassion' in body,
            'brand tagline': 'Bersatu Demi Masyarakat' in body,
            'people helped stat': 'PEOPLE HELPED' in body.upper(),
            'mission pillar': 'Supporting the Homeless' in body,
            'care card': 'Care Beyond Food' in body,
            'cta': 'Your helping hand changes a life tonight.' in body,
            'footer': 'Persatuan Kebajikan Kolar Putih' in body,
        }
        for k, v in checks.items():
            print(('  OK  ' if v else ' FAIL ') + k)
        ov = await pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
        print('desktop overflow:', ov)

        # nav links actually navigate
        await pg.click('text=Milestone')
        await pg.wait_for_timeout(1800)
        print('after Milestone click, url:', pg.url)
        ms = await pg.inner_text('body')
        print('  timeline years 2021-2024 present:', all(y in ms for y in ['2021','2022','2023','2024']))
        print('  full year text:', 'Kolar Putih is born' in ms and 'New people, new energy' in ms)
        await pg.screenshot(path=f'{OUT}/2-milestone.png')

        await pg.click('text=About Us')
        await pg.wait_for_timeout(1800)
        ab = await pg.inner_text('body')
        print('after About click, url:', pg.url)
        print('  committee present:', all(n in ab for n in ['Muhamad Ainnul Haziq','Nik Izzat','Muhammad Naim']))
        print('  roles present:', all(r in ab for r in ['Pengerusi','Bendahari','Setiausaha']))
        await pg.screenshot(path=f'{OUT}/3-about.png')

        await pg.click('text=Contact')
        await pg.wait_for_timeout(1800)
        ct = await pg.inner_text('body')
        print('after Contact click, url:', pg.url)
        print('  email present:', 'unitednation.kolarputih@gmail.com' in ct)
        print('  donate section:', 'Every ringgit reaches a hand' in ct)
        await pg.screenshot(path=f'{OUT}/4-contact.png')
        print('desktop console errors:', errs)
        print('desktop failed requests:', failed)

        # --- donate deep link ---
        await pg.goto(BASE + '/contact#donate', wait_until='networkidle')
        await pg.wait_for_timeout(2000)
        y = await pg.evaluate('window.scrollY')
        print('donate deep-link scrolled to y =', y, '(>0 means it jumped to the donate block)')

        # --- mobile ---
        m = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2,
                             is_mobile=True, has_touch=True)
        merrs = []
        m.on('pageerror', lambda e: merrs.append(str(e)))
        await m.goto(BASE + '/', wait_until='networkidle')
        await m.wait_for_timeout(1500)
        await m.screenshot(path=f'{OUT}/m1-home.png')
        mov = await m.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
        print('mobile overflow:', mov)
        await m.click('.nav-toggle')
        await m.wait_for_timeout(900)
        await m.screenshot(path=f'{OUT}/m2-drawer.png')
        await m.click('.drawer-link:has-text("Milestone")')
        await m.wait_for_timeout(1800)
        print('mobile nav -> ', m.url)
        await m.screenshot(path=f'{OUT}/m3-milestone.png')
        await m.goto(BASE + '/contact', wait_until='networkidle')
        await m.wait_for_timeout(1500)
        await m.screenshot(path=f'{OUT}/m4-contact.png')
        print('mobile errors:', merrs)

        await b.close()

asyncio.run(main())
print('LIVE TEST DONE')
