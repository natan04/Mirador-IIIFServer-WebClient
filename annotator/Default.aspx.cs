﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        tbEmail.Focus();
        Utils.Clear();
    }

    protected void lbLogin_Click(object sender, EventArgs e)
    {
        WebGTModel.User user = WebGTModel.User.GetUser(tbEmail.Text, tbPassword.Text);
        if (user == null)
            lblMsg.Text = "login failed.";
        else if (!user.IsActive)
            lblMsg.Text = "User is not active. Please refer to system administrator.";
        else
        {
            Utils.Clear();
            Utils.SetCurrentUser(user);
            Response.Redirect("main.htm");
        }
    }

    protected void lbRegister_Click(object sender, EventArgs e)
    {
        if (WebGTModel.User.IsEmailExist(rgEmail.Text))
        {
            lblMsg.Text = "Email exist in the system. please refer system administrator.";
            return;
        }

        if (rgPassword.Text != rgPasswordConfirm.Text)
        {
            lblMsg.Text = "Please retype password.";
            rgPasswordConfirm.Text = rgPassword.Text = "";
            return;
        }

        if (rgEmail.Text == "" || rgPassword.Text == "" || rgFname.Text == "" || rgLname.Text == "")
        {
            lblMsg.Text = "Please fill all details.";
            return;
        }

        WebGTModel.User u = new WebGTModel.User();
        u.Email = rgEmail.Text;
        u.SetPassword(rgPassword.Text);
        u.FirstName = rgFname.Text;
        u.LastName = rgLname.Text;
        u.Institute = rgAff.Text;
        u.EnableCreateCollection = true;
        u.IsActive = false;

        Utils.Model.AddToUsers(u);
        Utils.Model.SaveChanges();

        rgEmail.Text = rgPassword.Text = rgFname.Text = rgLname.Text = rgAff.Text = ""; 


        lblMsg.Text = "The details has been added to our records. Your user will be activated soon!";

        var smtpClient = new System.Net.Mail.SmtpClient("indigo.cs.bgu.ac.il");
        try
        {
            smtpClient.Send("webGt@cs.bgu.ac.il", "ofer.biller@gmail.com,abed.asi87@gmail.com", "registration request at webGT",
                string.Format("{0},{1},{2},{3}", u.Email, u.FirstName, u.LastName, u.Institute));
        }catch(Exception ex)
        {
           //TODO: what to do?
            lblMsg.Text = "We are having some problem creating your user. <a href='http://www.cs.bgu.ac.il/~abedas/'>please contact us</a>.";
            lblhMsg.Text = ex.Message + "<br/>" + (ex.InnerException == null ? "" : ex.InnerException.Message);
        }

    }
}