using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebGTModel
{
    public partial class User
    {
        public int CurrentlyEditImageID { get; set; }

        public static User GetUser(string email, string password)
        {
            
            var rets = Utils.Model.Users.Where(u => u.Email == email);
            //TODO: log
            if (rets.Count() > 0)
            {
                var ret = rets.Single();
                if (ret.Password == GetMD5Hash(password))
                    return ret;
            }
            return null;
        }


        private static string GetMD5Hash(string input)
        {
            System.Security.Cryptography.MD5CryptoServiceProvider x = new System.Security.Cryptography.MD5CryptoServiceProvider();
            byte[] bs = System.Text.Encoding.UTF8.GetBytes(input);
            bs = x.ComputeHash(bs);
            System.Text.StringBuilder s = new System.Text.StringBuilder();
            foreach (byte b in bs)
            {
                s.Append(b.ToString("x2").ToLower());
            }
            string password = s.ToString();
            return password;
        }

    //    internal List<Collection> GetDocuments()
    //    {
    //        //return Utils.Model.Collections.ToList<Collection>();
    //        var ret = from c in Utils.Model.Collections
    //                  select new
    //                  {
    //                      ID = c.ID,
    //                      Title = c.Title
    //                  };
    //        return ret.ToList();
    //    }

        internal List<Collection> GetDocuments()
        {
            //var ret = Collections.ToList<Collection>();
            //var ret = Utils.Model.Collections.Where(c=>c.Users.Contains(Utils.CurrentUser)).ToList<Collection>();
            List<Collection> ret = new List<Collection>();
            foreach (Collection c in Utils.Model.Collections)
            {
                if (c.PrepareByUserPermissions(Utils.CurrentUser))
                    ret.Add(c);

            }

            return ret;
        }

        public void SetPassword(string pass)
        {
            Password = GetMD5Hash(pass);
        }

        public bool CanViewImage(int pageID)
        {
            var page = Utils.Model.ManuscriptPages.SingleOrDefault(p => p.ID == pageID);
            if (page == null) return false;
            if (page.Manuscript.Collection.IsManager)
                return true;
            return false;
        }

        public static bool IsEmailExist(string email)
        {
            var rets = Utils.Model.Users.Where(u => u.Email == email);
            return (rets.Count() > 0);
        }
    }
}
