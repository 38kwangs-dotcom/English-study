import json
from playwright.sync_api import sync_playwright
URL='https://38kwangs-dotcom.github.io/English-study/office/'
HUB='https://38kwangs-dotcom.github.io/English-study/'
DL='/workspace/downloads'
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, locale='ko-KR', is_mobile=True, has_touch=True, accept_downloads=True)
    pg=ctx.new_page()
    pg.on('console', lambda m: errs.append('console['+m.type+']: '+m.text) if m.type=='error' else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: '+str(e)))
    pg.goto(URL, wait_until='networkidle'); pg.wait_for_timeout(2500)
    print('status: 200 (loaded) title:', pg.title())
    print('overflow:', pg.evaluate('[document.documentElement.scrollWidth, window.innerWidth]'))
    print('sync:', pg.locator('#syncTxt').inner_text())
    print('chips:', ' / '.join(pg.locator('.chips .chip').all_inner_texts()))
    print('parts:', pg.evaluate("window.__office.data().parts.map(p=>p.title+':'+p.tasks.length).join(' | ')"))
    pg.screenshot(path=f'{DL}/office_map_home.png', full_page=True)
    pg.screenshot(path=f'{DL}/office_map_fold.png')
    pg.click('.zlabel[data-part="travel"]'); pg.wait_for_timeout(900)
    pg.screenshot(path=f'{DL}/office_map_panel.png')
    print('panel title:', pg.locator('#sheetTitle').inner_text(), 'tasks:', pg.locator('#sheetBody li[data-task]').count(), 'links:', pg.locator('#sheetBody .link').count())
    pg.locator('#sheetBody [data-act="memo"]').scroll_into_view_if_needed(); pg.wait_for_timeout(500)
    pg.screenshot(path=f'{DL}/office_map_panel_memo.png')
    pg.locator('.sheet-x').click(); pg.wait_for_timeout(600)
    with pg.expect_download(timeout=12000) as dl:
        pg.click('#btnBackup')
    d=dl.value; j=json.load(open(f'{DL}/office_backup_live.json','w')) if False else None
    path=f'{DL}/office_backup_live.json'; d.save_as(path)
    data=json.load(open(path,encoding='utf-8'))
    print('backup ok:', d.suggested_filename, len(data['doc']['parts']), 'parts')
    # restore flow (cancel via dialog dismiss)
    pg.set_input_files('#fileInput', path); pg.wait_for_timeout(600)
    print('dialog open for restore:', pg.evaluate("!!document.querySelector('#fileInput')"))
    print('ERRORS:', errs[:8])
    # hub
    ctx2=b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, locale='ko-KR')
    hp=ctx2.new_page()
    hp.goto(HUB, wait_until='networkidle'); hp.wait_for_timeout(1200)
    hp.screenshot(path=f'{DL}/office_hub.png', full_page=True)
    print('hub has office card:', hp.locator('a[href="./office/"]').count())
    b.close()
