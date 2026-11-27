from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    pg=b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, locale='ko-KR').new_page()
    pg.goto('https://38kwangs-dotcom.github.io/English-study/', wait_until='networkidle'); pg.wait_for_timeout(1200)
    card=pg.locator('a[href="./office/"]')
    card.scroll_into_view_if_needed(); pg.wait_for_timeout(500)
    pg.evaluate("window.scrollBy(0,-90)"); pg.wait_for_timeout(400)
    pg.screenshot(path='/workspace/downloads/office_hub.png')
    print('card text:', card.inner_text().replace('\n',' / '))
    print('box:', card.bounding_box())
    b.close()
