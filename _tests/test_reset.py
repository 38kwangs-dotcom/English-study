from playwright.sync_api import sync_playwright
URL='https://38kwangs-dotcom.github.io/English-study/office/'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=b.new_context(viewport={'width':390,'height':844}, locale='ko-KR', is_mobile=True, has_touch=True)
    pg=ctx.new_page()
    pg.on('dialog', lambda d: (print('dialog:', d.message[:30].replace('\n',' ')), d.accept()))
    pg.goto(URL, wait_until='networkidle'); pg.wait_for_timeout(2200)
    print('before:', sum(len(x['tasks']) for x in pg.evaluate("window.__office.data().parts")))
    pg.click('#btnReset'); pg.wait_for_timeout(1200)
    d=pg.evaluate("window.__office.data()")
    print('after reset tasks:', sum(len(x['tasks']) for x in d['parts']), '| heads:', [x['title'] for x in d['parts']])
    print('toast:', pg.locator('#toast').inner_text())
    pg.wait_for_timeout(1200)
    b.close()
