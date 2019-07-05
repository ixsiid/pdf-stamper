# -*- coding: utf-8 -*- 

from http.server import BaseHTTPRequestHandler, HTTPServer
import socketserver

import os, sys, json, io, gc, base64

from PyPDF2 import PdfFileWriter, PdfFileReader
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

PORT = os.environ.PORT or 5002 if "PORT" in os.environ else 5002

version = 'version'

fontname = "IPA Gothic"
pdfmetrics.registerFont(TTFont(fontname, './cgi/ipaexg.ttf'))

class Handler(BaseHTTPRequestHandler):
    """
    Received the request as json, send the response as json
    please you edit the your processing
    """
    def Error(self, e, message):
        print("An error occured")
        print("The information of error is as following")
        print(type(e))
        print(e.args)
        print(e)
        response = { 'status' : 500,
                     'message' : message }

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        self.wfile.write(json.dumps(response).encode('utf-8'))
        return False

    def Stamp(self, args):
        """
        payload scheme
        {
            "text": 'added text' as str,
            "x": 'position of x at left bottom; units is [mm]' as float,
            "y": 'position of y at left bottom; units is [mm]' as float,
            "pdf": 'input file' as str (base64 encoded pdf file),
            "size": 'font size; units is [pt]' as float,
        }

        response scheme
        {
            "version": 'version data' as str,
            "message": not use,
            "pdf": 'text added pdf data' as str (base64 encoded pdf file),
        }
        """
        pdf = base64.b64decode(args['pdf'])
        base_pdf = PdfFileReader(io.BytesIO(pdf), strict=False)

        added_pdf = PdfFileWriter()
        
        for i in range(base_pdf.numPages):
            page = base_pdf.getPage(i)

            packet = io.BytesIO()

            sign = canvas.Canvas(packet, pagesize=page.mediaBox.upperRight)
            texts = sign.beginText()
            texts.setTextOrigin(args['x'] * mm, args['y'] * mm)
            texts.setFont(fontname, args['size'])
            for line in args['text'].split("\n"):
                texts.textLine(line)
            sign.drawText(texts)
            sign.save()

            packet.seek(0)
            new_pdf = PdfFileReader(packet)

            page.mergePage(new_pdf.getPage(0))
            added_pdf.addPage(page)

        write_stream = io.BytesIO()
        added_pdf.write(write_stream)

        write_stream.seek(0)
        buffer = write_stream.getbuffer()

        return {
            'version': version,
            'message': "text added",
            'pdf': base64.b64encode(buffer).decode('ascii'),
        }

    def do_POST(self):
        try:
            content_len = int(self.headers.get('content-length'))
            payload = json.loads(self.rfile.read(content_len).decode('utf-8'))
            
        except Exception as e:
            return self.Error(e, 'json parse error')

        if self.path == '/stamp':
            try:
                response = self.Stamp(payload)
            except Exception as e:
                return self.Error(e, 'stamp error')
        else:
            return self.Error(Exception('no defined command'), 'request path error')

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        self.wfile.write(json.dumps(response).encode('utf-8'))

        return True

    def Static(self, path):
        print(path)
        with open(path, 'rb') as f:
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f.read())
        return True

    def do_GET(self):
        if not self.path.endswith('.html'):
            self.Error(Exception('not found'), 'not found')

        local_path = './public' + self.path
        if os.path.exists(local_path):
            return self.Static(local_path)
        return True


with HTTPServer(("", PORT), Handler) as httpd:
    print("Listening in", PORT)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('^C received, shutting down server')

print('Finish...')
