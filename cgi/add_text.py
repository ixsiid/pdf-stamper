# -*- coding: utf-8 -*- 

import sys

name = "No name"
if len(sys.argv) > 1:
    name = sys.argv[1]

_y = 2
if len(sys.argv) > 2:
    _y = int(sys.argv[2])

import PyPDF2
from PyPDF2 import PdfFileWriter, PdfFileReader
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

fontname = "IPA Gothic"
pdfmetrics.registerFont(TTFont(fontname, './cgi/ipaexg.ttf'))

packet = io.BytesIO()

x = 3 * cm
y = (3 + 1.6 * _y) * cm

sign = canvas.Canvas(packet, pagesize=A4)
sign.setFont(fontname, 16)
sign.drawString(x, y, name)
sign.save()

packet.seek(0)
new_pdf = PdfFileReader(packet)

base_stream = io.BytesIO(sys.stdin.buffer.read())
existing_pdf = PdfFileReader(base_stream, strict=False)

output = PdfFileWriter()

for i in range(existing_pdf.numPages):
    page = existing_pdf.getPage(i)
    page.mergePage(new_pdf.getPage(0))
    output.addPage(page)

write_stream = io.BytesIO()
output.write(write_stream)

write_stream.seek(0)
sys.stdout.buffer.write(write_stream.getbuffer())

