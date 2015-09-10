<%@ WebHandler Language="C#" Class="Image" %>

using System;
using System.Web;

public class Image : IHttpHandler, System.Web.SessionState.IReadOnlySessionState{
    
    public void ProcessRequest (HttpContext context) {
        int imgID = Convert.ToInt32(context.Request["ID"]);

        WebGTModel.User u = Utils.CurrentUser;//context.Session["user"] as WebGTModel.User;
        if (u==null)
        {
            //TODO: log image request with no user
            context.Response.Write("no user");
            return;
        }
        if (!Utils.CurrentUser.CanViewImage(imgID))
        {
            //TODO: log image request with no permissions
            context.Response.Write("no permissions");
            return;
        }

        u.CurrentlyEditImageID = imgID;
            
        string imgFile =
            string.Format("{0}{1}.png",
            System.Configuration.ConfigurationManager.AppSettings["ImagesFolder"],
            imgID);
        
        context.Response.ContentType = "image/png";
        context.Response.WriteFile(imgFile);
        //context.Response.Cache.SetExpires(DateTime.Now.AddDays(1));
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}