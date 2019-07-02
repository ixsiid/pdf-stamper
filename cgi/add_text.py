# -*- coding: utf-8 -*- 

import argparse

parser = argparse.ArgumentParser(description="add text on pdf")
parser.add_argument('text', metavar='TEXT', type=str,
                    help='added text')
parser.add_argument('-x', metavar='X', type=float, default=9.5,
                    help='position of x at left bottom; units is [mm]')
parser.add_argument('-y', metavar='Y', type=float, default=12.2,
                    help='position of x at left bottom; units is [mm]')
parser.add_argument('-i', metavar='INPUT FILE', type=str,
                    help='base pdf file, if undefined read from stdin')
parser.add_argument('-o', metavar='OUTPUT FILE', type=str,
                    help='output pdf file name, if undefined write to stdout')
parser.add_argument('-p', metavar='FONT SIZE', type=float, default=16.0,
                    help='font size; units is [pt]')

args = parser.parse_args()

del parser

import sys

import PyPDF2
from PyPDF2 import PdfFileWriter, PdfFileReader
import io
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import gc

fontname = "IPA Gothic"
pdfmetrics.registerFont(TTFont(fontname, './cgi/ipaexg.ttf'))

if args.i == None:
    base_stream = io.BytesIO(sys.stdin.buffer.read())
else:
    base_stream = open(args.i, 'rb')
existing_pdf = PdfFileReader(base_stream, strict=False)

output = PdfFileWriter()

for i in range(existing_pdf.numPages):
    page = existing_pdf.getPage(i)

    packet = io.BytesIO()

    sign = canvas.Canvas(packet, pagesize=page.mediaBox.upperRight)
    texts = sign.beginText()
    texts.setTextOrigin(args.x * mm, args.y * mm)
    texts.setFont(fontname, args.p)
    for line in args.text.split("\n"):
        texts.textLine(line)
    sign.drawText(texts)
    sign.save()

    del sign
    del texts
    gc.collect()

    packet.seek(0)
    new_pdf = PdfFileReader(packet)

    page.mergePage(new_pdf.getPage(0))
    del new_pdf
    del packet
    gc.collect()

    output.addPage(page)

    del page
    gc.collect()

write_stream = io.BytesIO()
output.write(write_stream)

write_stream.seek(0)
if args.o == None:
    sys.stdout.buffer.write(write_stream.getbuffer())
else:
    with open(args.o, 'wb') as f:
        f.write(write_stream.getbuffer())




