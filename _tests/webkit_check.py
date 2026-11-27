import json
from playwright.sync_api import sync_playwright
URL='https://38kwangs-dotcom.github.io/English-study/office/'
errs=[]
with sync_playwright() as p:
    b=p.webkit.launch()
    ctx=b.new_context(viewport={'width':390,'height':844}, device_scale_factor=3, locale='ko-KR', is_mobile=True, has_touch=True, accept_downloads=True,
                      user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
    pg=ctx.new_page()
    pg.on('console', lambda m: errs.append('console['+m.type+']: '+m.text) if m.type=='error' else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: '+str(e)))
    pg.goto(URL, wait_until='networkidle'); pg.wait_for_timeout(2500)
    print('webkit title:', pg.title())
    print('overflow:', pg.evaluate('[document.documentElement.scrollWidth, window.innerWidth]'))
    print('sync:', pg.locator('#syncTxt').inner_text())
    print('map labels:', pg.locator('.zlabel').count(), 'rows:', pg.locator('.part-row').count())
    pg.screenshot(path='/workspace/downloads/office_map_home.png', full_page=True)
    pg.screenshot(path='/workspace/downloads/office_map_fold.png')
    pg.click('.zlabel[data-part="study"]'); pg.wait_for_timeout(800)
    pg.screenshot(path='/workspace/downloads/office_map_panel.png')
    print('panel open:', pg.locator('#sheetWrap').is_visible(), 'tasks', pg.locator('#sheetBody li[data-task]').count())
    # toggle on webkit
    pg.locator('#sheetBody li[data-task]').first.locator('.chk').click(); pg.wait_for_timeout(700)
    print('done after toggle:', pg.locator('#sheetBody li.done').count())
    pg.locator('#sheetBody li[data-task]').first.locator('.chk').click(); pg.wait_for_timeout(700)
    print('done reverted:', pg.locator('#sheetBody li.done').count())
    pg.locator('.sheet-x').click(); pg.wait_for_timeout(500)
    # backup download (webkit)
    try:
        with pg.expect_download(timeout=10000) as dl:
            pg.click('#btnBackup')
        d=dl.value; d.save_as('/workspace/downloads/office_backup_webkit.json')
        j=json.load(open('/workspace/downloads/office_backup_webkit.json',encoding='utf-8'))
        print('webkit backup:', d.suggested_filename, len(j['doc']['parts']))
    except Exception as e:
        print('webkit backup download failed:', str(e)[:200])
    print('ERRORS:', errs[:8])
    b.close()
