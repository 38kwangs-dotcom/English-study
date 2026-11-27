from playwright.sync_api import sync_playwright
URL='https://38kwangs-dotcom.github.io/English-study/office/'
DL='/workspace/downloads'
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=b.new_context(viewport={'width':390,'height':1500}, device_scale_factor=2, locale='ko-KR', is_mobile=True, has_touch=True)
    pg=ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL, wait_until='networkidle'); pg.wait_for_timeout(2200)
    pg.click('.zlabel[data-part="travel"]'); pg.wait_for_timeout(900)
    pg.locator('#sheet').screenshot(path=f'{DL}/office_map_panel.png')
    pg.screenshot(path=f'{DL}/office_map_panel_full.png')
    print('panel height', pg.locator('#sheet').bounding_box())
    print('sheet scroll height', pg.evaluate("document.querySelector('#sheetBody').scrollHeight"), 'client', pg.evaluate("document.querySelector('#sheetBody').clientHeight"))
    # scroll inside to bottom and capture
    pg.evaluate("document.querySelector('#sheetBody').scrollTop = 99999"); pg.wait_for_timeout(400)
    pg.locator('#sheet').screenshot(path=f'{DL}/office_map_panel_bottom.png')
    print('errors', errs[:5])
    b.close()
