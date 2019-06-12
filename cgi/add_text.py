# -*- coding: utf-8 -*- 

import sys

name = "No name"
if len(sys.argv) > 1:
    name = sys.argv[1]

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

sign = canvas.Canvas(packet, pagesize=A4)
sign.setFont(fontname, 16)
sign.drawString(10*cm, 10*cm, name)
sign.save()

packet.seek(0)
new_pdf = PdfFileReader(packet)
existing_pdf = PdfFileReader(sys.stdin.buffer)
output = PdfFileWriter()

for i in range(existing_pdf.numPages):
    page = existing_pdf.getPage(i)
    page.mergePage(new_pdf.getPage(0))
    output.addPage(page)

output.write(sys.stdout.buffer)

