import json, functools, http.server, socketserver, threading, urllib.request
from playwright.sync_api import sync_playwright
ROOT='/workspace/work_office/office'; PORT=8159
Handler=functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(socketserver.TCPServer): allow_reuse_address=True
httpd=Q(('127.0.0.1',PORT),Handler); threading.Thread(target=httpd.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=b.new_context(viewport={'width':390,'height':844}, locale='ko-KR')
    pg=ctx.new_page()
    ctx.route('**zzkjwucarircmqmuhpka**', lambda r: r.abort())
    pg.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='load'); pg.wait_for_timeout(900)
    data=pg.evaluate("window.__office.data()")
    b.close()
httpd.shutdown()
print('parts:', [ (p['id'], len(p['tasks']), p['summary'][:12]) for p in data['parts']])
print('any test text:', any('테스트' in t['text'] for p in data['parts'] for t in p['tasks']))
doc = data
doc['touched'] = True
import time
doc['rev'] = int(time.time()*1000)
doc['updatedAt'] = doc['rev']
SB='https://zzkjwucarircmqmuhpka.supabase.co'
KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2p3dWNhcmlyY21xbXVwa2EiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc5NDg1MzU2NCwiZXhwIjoyMTEwNDI5NTY0fQ.QH2-UdpeYZiRi7zUIQ9kvwB5focUA49ZE7B-Qj1KaQQ'
KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2p3dWNhcmlyY21xbXVocGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NTM1NjQsImV4cCI6MjExMDQyOTU2NH0.QH2-UdpeYZiRi7zUIQ9kvwB5focUA49ZE7B-Qj1KaQQ'
body=json.dumps([{'id':'office_map_eunjin','doc':doc,'updated_at':time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}]).encode()
req=urllib.request.Request(SB+'/rest/v1/fb_sync?on_conflict=id', data=body, method='POST')
req.add_header('apikey',KEY); req.add_header('Authorization','Bearer '+KEY)
req.add_header('Content-Type','application/json'); req.add_header('Prefer','resolution=merge-duplicates,return=representation')
with urllib.request.urlopen(req, timeout=25) as r:
    print('upsert status', r.status, len(r.read()))
# verify
req2=urllib.request.Request(SB+'/rest/v1/fb_sync?id=eq.office_map_eunjin&select=id,doc,updated_at', method='GET')
req2.add_header('apikey',KEY); req2.add_header('Authorization','Bearer '+KEY)
with urllib.request.urlopen(req2, timeout=25) as r:
    rows=json.loads(r.read().decode())
print('server row parts:', [p['id'] for p in rows[0]['doc']['parts']], 'tasks:', sum(len(p['tasks']) for p in rows[0]['doc']['parts']))
