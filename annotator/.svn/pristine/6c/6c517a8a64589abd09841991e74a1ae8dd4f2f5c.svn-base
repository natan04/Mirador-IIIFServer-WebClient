<%@ WebHandler Language="C#" Class="docElementsXml" %>

using System;
using System.Web;
using System.Linq;
using System.Xml.Linq;

using System.Collections.Generic;
using WebGTModel;
using System.Data.Objects;


public class docElementsXml : IHttpHandler, System.Web.SessionState.IReadOnlySessionState {

    public void ProcessRequest(HttpContext context)
    {
        int docID = Convert.ToInt32(context.Request["docID"]);
        int msID = Convert.ToInt32(context.Request["msID"]);
        
        string format = context.Request["format"];

        WebGTModel.User u = Utils.CurrentUser; //context.Session["user"] as WebGTModel.User;
        if (u == null)
        {
            //TODO: log image request with no user
            context.Response.Write("no user");
            return;
        }

        
        Manuscript manuscript = null;
        ManuscriptPage doc = null;
        if (docID != 0)
        {
            if (!Utils.CurrentUser.CanViewImage(docID))
            {
                //TODO: log image request with no permissions
                context.Response.Write("no permissions");
                return;
            }
            doc = Utils.Model.ManuscriptPages.SingleOrDefault(mp => mp.ID == docID);
            manuscript = Utils.Model.Manuscripts.SingleOrDefault(ms => doc.ManuscriptID == ms.ID);
        }
        else
        {
            manuscript = Utils.Model.Manuscripts.SingleOrDefault(m => m.ID == msID);
            if (manuscript == null)
            {
                context.Response.Write("manuscript not found");
                return;
            }
            Collection c = Utils.Model.Collections.SingleOrDefault(cl => cl.ID == manuscript.CollectionID);
            if (c == null)
            {
                context.Response.Write("error finding collection");
                return;
            }
            if (!c.IsManager)
            {
                context.Response.Write("no permissions");
                return;                
            }
        }

        if (format == "hadara")
        {
            //TODO: check permissions of user on manuscript, combine format with doc/manuscript
            WriteDocumentInHadaraFormat(context, manuscript, doc);
            return;
        }
        
        
        var docElements = doc.GetDocElements();
        decimal reductionRatio = 1;
        if (doc.ReductionRatio != null)
            reductionRatio = doc.ReductionRatio.Value;
        
        var outObjects = from de in docElements
                         select new DocumentElement
                         {
                             ID = de.ID,
                             ParentID = de.ParentID,
                             ElementType = de.ElementType.ToString(),
                             X = Convert.ToInt32(de.X * reductionRatio),
                             Y = Convert.ToInt32(de.Y * reductionRatio),
                             Width = Convert.ToInt32(de.Width * reductionRatio),
                             Height = Convert.ToInt32(de.Height * reductionRatio),
                             Transcript = de.Transcript,
                             Threshold = de.Threshold,
                             OriginX = Convert.ToInt32(de.OriginX * reductionRatio),
                             OriginY = Convert.ToInt32(de.OriginY * reductionRatio)
                         };

        
        if (format == "csv")
        {
            context.Response.ContentType = "text/csv";
            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            foreach (DocumentElement el in outObjects)
                sb.AppendFormat("{0},{1},{2},{3},{4},{5},{6},{7},{8}{9}",
                    el.Threshold ?? 0,
                    (el.Transcript==null|| el.Transcript.Length==0)?0:Convert.ToInt32(el.Transcript[0]), 
                    el.X,
                    el.Y,
                    el.Width,
                    el.Height,
                    el.OriginX ?? 0,
                    el.OriginY ?? 0,
                    el.ParentID,
                    Environment.NewLine);              
            context.Response.Write(sb.ToString());
            //context.Response.Cache.SetExpires(DateTime.Now.AddDays(1));
        }
        //else if (format == "hadara")
        //{
        //    WriteDocumentInHadaraFormat(context.Response.OutputStream, outObjects.ToList());
        //}
        else 
        {
            var outList = outObjects.ToList();
            System.Xml.Serialization.XmlSerializer ser = new System.Xml.Serialization.XmlSerializer(outList.GetType());
            context.Response.ContentType = "text/xml";
            ser.Serialize(context.Response.OutputStream, outList);
        } 


    }

    private void WriteDocumentInHadaraFormat(HttpContext context, Manuscript manuscript, ManuscriptPage page)
    {

        XDocument doc = new System.Xml.Linq.XDocument();
        XElement root = new XElement("HADARA",
            new XAttribute("xmlns-dcterms", "http://purl.org/dc/terms/"),
            new XAttribute("xmlns-europeana", "http://www.europeana.eu/schemas/ese/"),
            new XAttribute("xmlns-xsi", "http://www.w3.org/2001/XMLSchema-instance"),
            new XAttribute("version", "0.1"),
            new XAttribute("xsi-noNamespaceSchemaLocation", "HADARA_v0.1.xsd"));

        doc.AddFirst(root);

        XElement manuscriptNode = new XElement("document",
            new XAttribute("nbpages", manuscript.ManuscriptPages.Count()),
            new XAttribute("id", manuscript.ID)
            );

        root.Add(manuscriptNode);

        if (page == null)
        {
            foreach (ManuscriptPage msPage in manuscript.ManuscriptPages)
                AddPageToManuscriptXml(msPage, manuscriptNode);
        }else
            AddPageToManuscriptXml(page, manuscriptNode);
        
        context.Response.ContentType = "text/xml";
        doc.Save(context.Response.OutputStream);


    }

    private void AddPageToManuscriptXml(ManuscriptPage page, XElement manuscriptNode)
    {
        //TODO: fit to format
        XElement imageNode = new XElement("image",
            new XAttribute("id", page.ID),
            new XAttribute("src", page.Title));

        XElement contentNode = new XElement("content",
            new XAttribute("image_id", page.ID));

        manuscriptNode.Add(imageNode, contentNode);
        
        // adding the page nodes
        List<DocElement> docElements = page.GetDocElements();
        
        
        //List<DocElement> pages =  docElements.Find(el=> el.ElementType== DocElement.DocElementType.Page)
        //imageNode.Add(new XElement("polygon",
        //    new XElement("point", 
        //        new XAttribute("y",1),
        //        new XAttribute("x",1)),
        //    new XElement("point",
        //        new XAttribute("y", 1),
        //        new XAttribute("x", page.)),
        //    new XElement("point",
        //        new XAttribute("y", ""),
        //        new XAttribute("x", "")),
        //    new XElement("point", 
        //        new XAttribute("y",""),
        //        new XAttribute("x",""))
        //    ));
        XElement pageNode = new XElement("page");
        imageNode.Add(pageNode);
        XElement contentSection = new XElement("section",
            new XAttribute("type", "page"));
        contentNode.Add(contentSection);
            
        // adding elements nodes
        foreach(DocElement element in docElements)
        {
            pageNode.Add(
                new XElement("zone",
                    new XAttribute("id", element.ID),
                    new XAttribute("type",element.ElementType.ToString()),
                    new XAttribute("parent_id",element.ParentID==null?0:element.ParentID.Value),
                    new XElement("polygon",
                        new XElement("point", 
                            new XAttribute("y",element.Y),
                            new XAttribute("x",element.X)),
                        new XElement("point",
                            new XAttribute("y", element.Y),
                            new XAttribute("x", element.X+element.Width)),
                        new XElement("point",
                            new XAttribute("y", element.Y+element.Height),
                            new XAttribute("x", element.X + element.Width)),
                        new XElement("point",
                            new XAttribute("y", element.Y + element.Height),
                            new XAttribute("x",element.X))
                            )
                )
            );

            if (!string.IsNullOrEmpty(element.Transcript))
            {
                contentSection.Add(
                    new XElement("segment",
                        new XAttribute("id", element.ID),
                        new XAttribute("ref_id", element.ID),
                        new XElement("transcriptionInfo",
                            new XAttribute("id", element.ID),
                            new XAttribute("transcription_users", element.UserID),
                            new XAttribute("transcription_timestamp", ""),
                            new XAttribute("annotation_users", element.UserID),
                            new XAttribute("annotation_timestamp", "")),
                         new XElement("transcription", element.Transcript)
                         ));
            }           
        }
        
    }

        
    public bool IsReusable {
        get {
            return false;
        }
    }
    
    public class DocumentElement
    {
        public int ID;
        public int? ParentID;
        public string ElementType;
        public int? X;
        public int? Y;
        public int? Width;
        public int? Height;
        public string Transcript;
        public int? Threshold;
        public int? OriginX;
        public int? OriginY;
    }
    
 
}