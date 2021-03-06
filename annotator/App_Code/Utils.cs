﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for Utils
/// </summary>
public class Utils
{
	public Utils()
	{}

    public static System.Web.SessionState.HttpSessionState Session
    {
        get {
            return HttpContext.Current.Session;
        }
    }

    public static HttpRequest Request
    {
        get
        {
            return HttpContext.Current.Request;
        }
    }

	public static WebGTModel.WebGTEntities1 Model{
        get{
            if (Session["Model"] == null)
                Session["Model"] = new WebGTModel.WebGTEntities1();
            return Session["Model"] as WebGTModel.WebGTEntities1;
        }
        private set{Session["Model"] = value;}
    }

    private static int? CurrentUserID {
        get
        {
            if (Session["UserID"] == null)
                return null;
            else
                return (int?)Session["UserID"];
        }
        set
        {
            Session["UserID"] = value;
        }
    }

    public static WebGTModel.User CurrentUser
    {
        get
        {
            WebGTModel.User ret = null;
            //if (Session["User"] != null)
            //    ret = Session["User"] as WebGTModel.User;
            //if (ret == null)
            //    throw new Exception("No user is currently connected.");
            if (CurrentUserID == null)
                throw new Exception("No user is currently connected.");
            else
                ret = Utils.Model.Users.SingleOrDefault(u => u.ID == CurrentUserID);

            return ret;
        }
        private set {
            if (value == null)
                CurrentUserID = null;
            else
                CurrentUserID = value.ID; 
        }
            //Session["User"] = value;}
    }

    public static bool IsSuperAdmin
    {
        get
        {
            return CurrentUserID == 1 || CurrentUserID ==  2|| CurrentUserID == 41;
        }
    }

    public static void Clear()
    {
        CurrentUser = null;
        Model = null;
    }


    public static void SetCurrentUser(WebGTModel.User user)
    {
        CurrentUser = user;
    }


}