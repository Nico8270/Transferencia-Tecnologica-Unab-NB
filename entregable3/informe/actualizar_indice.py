"""Abre el .docx en LibreOffice (headless), actualiza índice y campos, y guarda .docx y .pdf.
Uso: python3 actualizar_indice.py archivo.docx"""
import subprocess, sys, time, os, uno
from com.sun.star.beans import PropertyValue

def prop(n, v):
    p = PropertyValue(); p.Name = n; p.Value = v; return p

src = os.path.abspath(sys.argv[1])
proc = subprocess.Popen(["soffice", "--headless", "--invisible", "--norestore",
                         "--accept=socket,host=localhost,port=2002;urp;"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
ctx = None
for _ in range(60):
    try:
        local = uno.getComponentContext()
        resolver = local.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", local)
        ctx = resolver.resolve("uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext")
        break
    except Exception:
        time.sleep(0.5)
desktop = ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
doc = desktop.loadComponentFromURL(uno.systemPathToFileUrl(src), "_blank", 0, (prop("Hidden", True),))
doc.getTextFields().refresh()
idx = doc.getDocumentIndexes()
for i in range(idx.getCount()):
    idx.getByIndex(i).update()
doc.getTextFields().refresh()
for i in range(idx.getCount()):
    idx.getByIndex(i).update()
doc.storeToURL(uno.systemPathToFileUrl(src), (prop("FilterName", "MS Word 2007 XML"),))
doc.storeToURL(uno.systemPathToFileUrl(src[:-5] + ".pdf"), (prop("FilterName", "writer_pdf_Export"),))
doc.close(True)
try:
    desktop.terminate()
except Exception:
    pass
proc.wait(timeout=30)
print("OK")
