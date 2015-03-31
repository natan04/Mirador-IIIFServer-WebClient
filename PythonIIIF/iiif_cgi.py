#!/usr/bin/env python2.6
"""Crude CGI implementation for IIIF service

Relies upon IIIFManupulator object to do the image
manipulations requested.
"""

import BaseHTTPServer
import re
import sys
import os
import os.path
import traceback

# These will likely need to be change for any installation
HOME_DIR = os.path.normpath(os.path.join(os.getcwd(),'..'))
TMP_DIR = os.path.join(HOME_DIR,'tmp')
TESTIMAGE_DIR = os.path.join(HOME_DIR,'testimages')
PNM_DIR = os.path.join(HOME_DIR,'opt/usr/bin')
SHELL_SETUP = '' #'export LD_LIBRARY_PATH='+os.path.join(HOME_DIR,'opt/usr/lib')+'; ';

from iiif.error import IIIFError
from iiif.request import IIIFRequest
from iiif.info import IIIFInfo

class CGI_responder(object):
    def send_response(self,code,text=''):
        print "Status: %s %s\r" % (str(code),text)

    def send_header(self,header,value):
        print "%s: %s\r" % (header,value)

    def end_headers(self):
        print "\r"

    
#class IIIFRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):
class IIIFRequestHandler(CGI_responder):

    manipulator_class=None

#    def __init__(self, request, client_address, server):
    def __init__(self):
        # Add some local attributes for this subclass (seems we have to 
        # do this ahead of calling the base class __init__ because that
        # does not return
        self.debug=True
        self.complianceLevel=None;
        # Cannot use super() because BaseHTTPServer.BaseHTTPRequestHandler 
        # is not new style class
        #super(IIIFRequestHandler, self).__init__(request, client_address, server)
        #BaseHTTPServer.BaseHTTPRequestHandler.__init__(self, request, client_address, server)
        self.path= ( os.environ['PATH_INFO'] if ('PATH_INFO' in os.environ) else '/bogus')
        self.wfile=sys.stdout

    """Minimal implementation of HTTP request handler to do iiif GET
    """
    def error_response(self,code,content=''):
        self.send_response(code)
        self.send_header('Content-Type','text/xml')
        self.add_compliance_header()
        self.end_headers()
        self.wfile.write(content)

    def add_compliance_header(self):
        if (self.complianceLevel is not None):
            self.send_header('Link','<'+self.complianceLevel+'>;rel="compliesTo"')
        
    def do_GET(self):
        """Implement the HTTP GET method

        The bulk of this code is wrapped in a big try block and anywhere
        within the code may raise an IIIFError which then results in an
        IIIF error response (section 5 of spec).
        """
        self.complianceLevel=None
        self.iiif = IIIFRequest(baseurl='/')
        try:
            (of,mime_type) = self.do_GET_body()
            if (not of):
                raise IIIFError("Unexpected failure to open result image")
            self.send_response(200,'OK')
            if (mime_type is not None):
                self.send_header('Content-Type',mime_type)
            self.add_compliance_header()
            self.end_headers()
            while (1):
                buffer = of.read(8192)
                if (not buffer):
                    break
                self.wfile.write(buffer)
            # Now cleanup
            self.manipulator.cleanup()
        except IIIFError as e:
            if (self.debug):
                e.text += "\nRequest parameters:\n" + str(self.iiif)
            self.error_response(e.code, str(e))
        except Exception as ue:
            # Anything else becomes a 500 Internal Server Error
            e = IIIFError(code=500,text="Something went wrong... %s ---- %s.\n"%(str(ue),traceback.format_exc()))
            if (self.debug):
                e.text += "\nRequest parameters:\n" + str(self.iiif)
            self.error_response(e.code, str(e))

    def do_GET_body(self):
        iiif=self.iiif
        if (len(self.path)>1024):
            raise IIIFError(code=414,
                            text="URI Too Long: Max 1024 chars, got %d\n" % len(self.path))
        try:
            # self.path has leading / then identifier/params...
            self.path = self.path.lstrip('/')
            sys.stderr.write("path = %s"%(self.path))
            iiif.parse_url(self.path)
        except Exception as e:
            # Something completely unexpected => 500
            raise IIIFError(code=500,
                            text="Internal Server Error: unexpected exception parsing request (" + str(e) + ")")
        # Now we have a full iiif request
        if (re.match('[\w\.\-]+$',iiif.identifier)):
            file = os.path.join(TESTIMAGE_DIR,iiif.identifier)
            if (not os.path.isfile(file)):
                images_available=""
                for image_file in os.listdir(TESTIMAGE_DIR):
                    if (os.path.isfile(os.path.join(TESTIMAGE_DIR,image_file))):
                        images_available += "  "+image_file+"\n"
                raise IIIFError(code=404,parameter="identifier",
                               text="Image resource '"+iiif.identifier+"' not found. Local image files available:\n" + images_available)
        else:
            raise IIIFError(code=404,parameter="identifier",
                           text="Image resource '"+iiif.identifier+"' not found. Only local test images and http: URIs for images are supported.\n")
        # Now know image is OK
        manipulator = IIIFRequestHandler.manipulator_class()
        # Stash manipulator object so we can cleanup after reading file
        self.manipulator=manipulator
        self.complianceLevel=manipulator.complianceLevel;
        if (iiif.info):
            # get size
            manipulator.srcfile=file
            manipulator.do_first()
            # most of info.json comes from config, a few things
            # specific to image
            i = IIIFInfo()
            i.identifier = self.iiif.identifier
            i.width = manipulator.width
            i.height = manipulator.height
            import StringIO
            return(StringIO.StringIO(i.as_json()),"application/json")
        else:
            (outfile,mime_type)=manipulator.derive(file,iiif)
            return(open(outfile,'r'),mime_type)
               
#print "Content-type: text/plain\r\n\r"
#print "hello"
#exit(0)
myname = ( os.environ['SCRIPT_NAME'] if ('SCRIPT_NAME' in os.environ) else '/iiif_dummy.cgi')
#sys.stderr = sys.stdout
if (re.match(myname,'/iiif_dummy') is not None):
    from iiif.manipulator_dummy import IIIFManipulatorDummy
    IIIFRequestHandler.manipulator_class = IIIFManipulatorDummy
elif (re.match(myname,'/iiif_netpbm') is not None):
    from iiif.manipulator_netpbm import IIIFManipulatorNetpbm
    IIIFManipulatorNetpbm.find_binaries(tmpdir=TMP_DIR,
                                       shellsetup=SHELL_SETUP,
                                       pnmdir=PNM_DIR)
    IIIFRequestHandler.manipulator_class = IIIFManipulatorNetpbm
else:
    #elif (re.match(myname,'/iiif_pil'):
    from iiif.manipulator_pil import IIIFManipulatorPIL
    IIIFRequestHandler.manipulator_class = IIIFManipulatorPIL
#else:
#    print "Status: 500\r"
#    print "Content-type: text/plain\r\n\r"
#    print "Bad script name '%s'" % myname
#    exit(0)

rh = IIIFRequestHandler()
rh.do_GET()
