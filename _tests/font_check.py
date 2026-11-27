from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':390,'height':844}, locale='ko-KR').new_page()
    pg.goto('https://38kwangs-dotcom.github.io/English-study/office/', wait_until='networkidle'); pg.wait_for_timeout(1000)
    pg.click('#tabs button[data-tab="status"]'); pg.wait_for_timeout(400)
    print(pg.evaluate("""(() => { const el=document.querySelector('#stDone'); const cs=getComputedStyle(el);
      return {ff: cs.fontFamily, fw: cs.fontWeight, fs: cs.fontSize, fnum: cs.fontVariantNumeric, bodyFF: getComputedStyle(document.body).fontFamily}; })()"""))
    b.close()
