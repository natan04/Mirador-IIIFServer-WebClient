using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using WebGTModel;
using System.Drawing;
using System.IO;

public partial class AddPage : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        lblMsg.Text = "";
        if (!IsPostBack)
        {
            ViewState["src"] = Request.UrlReferrer;

            try
            {
                int? msid = null;
                if (Request["msid"] != null)
                    msid = Convert.ToInt32(Request["msid"]);
                int? cid = null;
                if (Request["cid"] != null)
                    cid = Convert.ToInt32(Request["cid"]);
                if (msid == null && cid == null)
                    throw new Exception("Collection or manuscript must be specified.");
                if (msid != null)
                {
                    Manuscript manuscript = Utils.Model.Manuscripts.SingleOrDefault(ms => ms.ID == msid.Value);
                    Collection collection = Utils.Model.Collections.SingleOrDefault(c => c.ID == manuscript.CollectionID);
                    lblTitle.Text = string.Format("Add pages to manuscript: {0}, in collection: {1}", manuscript.Title, collection.Title);
                    if (!collection.IsManager)
                        throw new Exception("User is not autohrized");
                }
                else
                {
                    Collection collection = Utils.Model.Collections.SingleOrDefault(c => c.ID == cid.Value);
                    lblTitle.Text = string.Format("Add manuscript to collection: {0}", collection.Title);
                    if (!collection.IsManager)
                        throw new Exception("User is not autohrized");
                    pnlAddManuscript.Visible = true;
                    LinkButton1.Text = "Add Manuscript";
                }
                Repeater1.DataSource = Enumerable.Range(1, 20);
                Repeater1.DataBind();
            }
            catch (Exception)
            {
                Response.Redirect(ViewState["src"].ToString());
            }

        }
    }
    protected void LinkButton1_Click(object sender, EventArgs e)
    {
        int counter = 0;
        Manuscript manuscript = null;
        int? msid = null;
        if (Request["msid"] != null)
            msid = Convert.ToInt32(Request["msid"]);
        int? cid = null;
        if (Request["cid"] != null)
            cid = Convert.ToInt32(Request["cid"]);

        if (msid != null)
        {
            manuscript = Utils.Model.Manuscripts.SingleOrDefault(ms => ms.ID == msid);
        }
        else
        {
            if (tbManuscriptTitle.Text.Trim() == "")
            {
                lblMsg.Text = "Please provide manuscript title.";
                return;
            }
            Collection collection = Utils.Model.Collections.SingleOrDefault(c => c.ID == cid.Value);
            var msWithThatTitle = Utils.Model.Manuscripts.SingleOrDefault(ms => (ms.Title == tbManuscriptTitle.Text.Trim()) && ms.CollectionID == cid);
            if (msWithThatTitle != null)
            {
                lblMsg.Text = "Manuscript with that title allready exists in the collection.";
                return;
            }

            manuscript = new Manuscript();
            manuscript.CollectionID = collection.ID;
            manuscript.Title = tbManuscriptTitle.Text.Trim();
            Utils.Model.Manuscripts.AddObject(manuscript);
            Utils.Model.SaveChanges();
        }

        for (int i = 0; i < 20; i++)
        {
            FileUpload fuNewPage = Repeater1.Items[i].FindControl("fuImg") as FileUpload;
            TextBox tbTitle = Repeater1.Items[i].FindControl("tbTitle") as TextBox;
            if (fuNewPage == null || tbTitle == null) continue;
            if (fuNewPage.HasFile)
            {
                ManuscriptPage page = new ManuscriptPage();
                page.ManuscriptID = manuscript.ID;
                if (!string.IsNullOrEmpty(tbTitle.Text))
                    page.Title = tbTitle.Text;
                else
                    page.Title = fuNewPage.FileName.Substring(0, fuNewPage.FileName.LastIndexOf('.'));

                var oldPageWithThatName = manuscript.ManuscriptPages.SingleOrDefault(msp => msp.Title == page.Title &&  !msp.IsDeleted);
                if (oldPageWithThatName != null )
                {
                    //TODO: send the user some message that file was not added(problem is the user is redirected to another page)
                    continue;
                }

                Utils.Model.ManuscriptPages.AddObject(page);
                Utils.Model.SaveChanges();


                string imgFileName =
                    string.Format("{0}{1}.png",
                    System.Configuration.ConfigurationManager.AppSettings["ImagesFolder"],
                    page.ID);
                
                bool enableSizeReduction = true;

                if (!enableSizeReduction)
                {
                    fuNewPage.SaveAs(imgFileName);
                }
                else
                {
                    string imgRawFileName =
                        string.Format("{0}raw\\{1}.png",
                        System.Configuration.ConfigurationManager.AppSettings["ImagesFolder"],
                        page.ID);

                    fuNewPage.SaveAs(imgRawFileName);

                    Bitmap bmp = new Bitmap(imgRawFileName);

                    if (bmp.Width > 1655)
                    {
                        decimal reductionRatio = 1;
                        reductionRatio = bmp.Width / 1655;
                        reductionRatio = Math.Round(reductionRatio, 1);
                        int newWidth = Convert.ToInt32(bmp.Width / reductionRatio);
                        int newHeight = Convert.ToInt32(bmp.Height / reductionRatio);
                        Bitmap newImg = new Bitmap(newWidth, newHeight);
                        Graphics.FromImage(newImg).DrawImage(bmp, 0, 0, (float)newWidth, (float)newHeight);
                        newImg.Save(imgFileName, System.Drawing.Imaging.ImageFormat.Png);
                        page.ReductionRatio = reductionRatio;
                    }
                    else
                    {
                        (new FileInfo(imgRawFileName)).CopyTo(imgFileName);
                    }
                }
            }
        }

        Utils.CurrentUser.LastDocID = manuscript.ManuscriptPages.First().ID;
        Utils.Model.SaveChanges();
        if (ViewState["src"] == null)
            Response.Redirect("main.htm");
        else
            Response.Redirect(ViewState["src"].ToString());
    }
}