import json
from playwright.sync_api import sync_playwright
URL='https://38kwangs-dotcom.github.io/English-study/office/'
DL='/workspace/downloads'
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, locale='ko-KR', is_mobile=True, has_touch=True, accept_downloads=True)
    pg=ctx.new_page()
    pg.on('console', lambda m: errs.append('console['+m.type+']: '+m.text) if m.type=='error' else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: '+str(e)))
    pg.goto(URL, wait_until='networkidle'); pg.wait_for_timeout(2500)
    print('title:', pg.title())
    print('overflow:', pg.evaluate('[document.documentElement.scrollWidth, window.innerWidth]'))
    print('sync:', pg.locator('#syncTxt').inner_text())
    print('head:', pg.locator('#workHead').inner_text())
    print('parts:', pg.evaluate("window.__office.data().parts.map(p=>p.title+':'+p.tasks.length).join(' | ')"))
    pg.screenshot(path=f'{DL}/office_map_home.png', full_page=True)
    pg.screenshot(path=f'{DL}/office_map_home_fold.png')
    # panel
    pg.click('.zlabel[data-part="study"]'); pg.wait_for_timeout(900)
    pg.screenshot(path=f'{DL}/office_map_panel.png')
    print('panel tasks:', pg.locator('#sheetBody li[data-task]').count(), 'links:', pg.locator('#sheetBody .link').count())
    # toggle a task on live
    first = pg.locator('#sheetBody li[data-task]').first
    txt = first.inner_text().split('\n')[0]
    before_done = pg.locator('#sheetBody li.done').count()
    first.locator('.chk').click(); pg.wait_for_timeout(800)
    print('toggle:', txt[:20], 'done', before_done, '->', pg.locator('#sheetBody li.done').count())
    first.locator('.chk').click(); pg.wait_for_timeout(800)  # revert
    print('reverted done:', pg.locator('#sheetBody li.done').count())
    # memo section visible after scroll
    pg.locator('#sheetBody [data-act="memo"]').scroll_into_view_if_needed()
    pg.wait_for_timeout(400)
    pg.screenshot(path=f'{DL}/office_map_panel_memo.png')
    pg.locator('.sheet-x').click(); pg.wait_for_timeout(500)
    # backup download on live
    with pg.expect_download(timeout=10000) as dl:
        pg.click('#btnBackup')
    d=dl.value
    path=f'{DL}/office_backup_live.json'; d.save_as(path)
    j=json.load(open(path,encoding='utf-8'))
    print('backup:', d.suggested_filename, 'parts', len(j['doc']['parts']), 'tasks', sum(len(p['tasks']) for p in j['doc']['parts']))
    # cloud row after toggle/revert
    pg.wait_for_timeout(1500)
    print('sync end:', pg.locator('#syncTxt').inner_text())
    print('ERRORS:', errs[:8])
    b.close()
