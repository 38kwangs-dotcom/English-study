import json, functools, http.server, socketserver, threading, os
from playwright.sync_api import sync_playwright
ROOT='/workspace/work_office/office'; PORT=8158
Handler=functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(socketserver.TCPServer): allow_reuse_address=True
httpd=Q(('127.0.0.1',PORT),Handler); threading.Thread(target=httpd.serve_forever,daemon=True).start()
errs=[]
DL='/workspace/downloads'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, locale='ko-KR', is_mobile=True, has_touch=True, accept_downloads=True)
    pg=ctx.new_page()
    pg.on('console', lambda m: errs.append('console['+m.type+']: '+m.text) if m.type=='error' else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: '+str(e)))
    pg.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle'); pg.wait_for_timeout(1500)
    print('== initial')
    print('overflow:', pg.evaluate('[document.documentElement.scrollWidth, window.innerWidth]'))
    print('sync:', pg.locator('#syncTxt').inner_text())
    print('map labels:', pg.locator('.zlabel').count())
    # 1) backup download
    with pg.expect_download(timeout=8000) as dl:
        pg.click('#btnBackup')
    d = dl.value
    path = f'{DL}/backup_test.json'
    d.save_as(path)
    data=json.load(open(path,encoding='utf-8'))
    print('backup file:', d.suggested_filename, 'parts:', len(data['doc']['parts']), 'kind:', data['doc']['kind'])
    # 2) open panel, add task, toggle, memo
    pg.click('.zlabel[data-part="study"]'); pg.wait_for_timeout(600)
    before = pg.locator('#sheetBody li[data-task]').count()
    pg.fill('#sheetBody .new-task', '테스트 할 일 추가')
    pg.click('#sheetBody .add-task button'); pg.wait_for_timeout(500)
    after = pg.locator('#sheetBody li[data-task]').count()
    print('task add:', before, '->', after)
    # toggle first pending task
    pg.locator('#sheetBody li[data-task]:not(.done) .chk').first.click(); pg.wait_for_timeout(500)
    print('after toggle, done count:', pg.locator('#sheetBody li.done').count())
    pg.fill('#sheetBody [data-act="memo"]', '테스트 메모입니다')
    pg.wait_for_timeout(900)
    print('memo saved flag:', pg.locator('#sheetBody [data-memo-state]').inner_text())
    pg.screenshot(path=f'{DL}/office_panel_test.png')
    pg.click('.sheet-x'); pg.wait_for_timeout(500)
    # 3) other tabs
    for tab,name in [('status','현황'),('tasks','할 일'),('memo','메모')]:
        pg.click(f'#tabs button[data-tab="{tab}"]'); pg.wait_for_timeout(400)
        pg.screenshot(path=f'{DL}/office_tab_{tab}.png', full_page=True)
        print(tab, 'visible:', pg.locator(f'#view-{tab}').is_visible())
    # 4) persistence across reload
    pg.reload(wait_until='networkidle'); pg.wait_for_timeout(1500)
    memo = pg.evaluate("JSON.parse(localStorage.getItem('eunjin_office_map_v1')).parts[0]")
    print('after reload - tasks:', len(memo['tasks']), 'memo:', memo['memo'][:20], 'done:', sum(1 for t in memo['tasks'] if t['done']))
    print('sync after reload:', pg.locator('#syncTxt').inner_text())
    pg.screenshot(path=f'{DL}/office_home_final.png', full_page=True)
    print('ERRORS:', errs[:10])
    b.close()
httpd.shutdown()
