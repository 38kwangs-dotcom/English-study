import json
from playwright.sync_api import sync_playwright
URL='https://38kwangs-dotcom.github.io/English-study/office/'
DL='/workspace/downloads'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, locale='ko-KR', is_mobile=True, has_touch=True, accept_downloads=True)
    pg=ctx.new_page()
    pg.on('dialog', lambda d: (print('dialog:', d.message[:40].replace('\n',' ')), d.accept()))
    pg.goto(URL, wait_until='networkidle'); pg.wait_for_timeout(2200)
    base = pg.evaluate("window.__office.data().parts[1].tasks.length")
    print('travel tasks start:', base)
    pg.click('#tabs button[data-tab="tasks"]'); pg.wait_for_timeout(400)
    # add a task through the panel
    pg.click('#tabs button[data-tab="office"]'); pg.wait_for_timeout(300)
    pg.click('.zlabel[data-part="travel"]'); pg.wait_for_timeout(700)
    pg.fill('#sheetBody .new-task', '복원 테스트 항목')
    pg.click('#sheetBody .add-task button'); pg.wait_for_timeout(800)
    print('after add:', pg.locator('#sheetBody li[data-task]').count())
    pg.locator('.sheet-x').click(); pg.wait_for_timeout(1400)
    pg.reload(wait_until='networkidle'); pg.wait_for_timeout(2200)
    persisted = pg.evaluate("window.__office.data().parts[1].tasks.map(t=>t.text)")
    print('after reload has test task:', '복원 테스트 항목' in persisted, len(persisted))
    # restore from clean backup file
    pg.set_input_files('#fileInput', f'{DL}/office_map_backup.json')
    pg.wait_for_timeout(1500)
    after = pg.evaluate("window.__office.data().parts[1].tasks.map(t=>t.text)")
    print('after restore has test task:', '복원 테스트 항목' in after, len(after))
    print('toast:', pg.locator('#toast').inner_text())
    pg.wait_for_timeout(1500)
    pg.screenshot(path=f'{DL}/office_map_after_restore.png')
    b.close()
