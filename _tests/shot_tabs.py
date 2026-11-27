from playwright.sync_api import sync_playwright
URL='https://38kwangs-dotcom.github.io/English-study/office/'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    pg=b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, locale='ko-KR', is_mobile=True, has_touch=True).new_page()
    pg.goto(URL, wait_until='networkidle'); pg.wait_for_timeout(2200)
    for tab in ['status','tasks','memo']:
        pg.click(f'#tabs button[data-tab="{tab}"]'); pg.wait_for_timeout(600)
        pg.screenshot(path=f'/workspace/downloads/office_tab_{tab}.png', full_page=True)
    print('ok')
    b.close()
