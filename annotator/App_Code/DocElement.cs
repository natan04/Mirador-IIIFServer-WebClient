using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebGTModel
{

    public partial class DocElement
    {
        public enum DocElementType
        {
            None = 0,
            Character = 1,
            Punctuation = 2,
            PartOfWord = 3,
            Word = 4,
            Line = 5,
            Section = 6,
            Page = 7
        }


        public DocElementType ElementType
        {
            get
            {
                return (DocElementType)TypeID;
            }
            set
            {
                TypeID = Convert.ToByte(value);
            }
        }

        internal void UpdateData(DocElement updatedDocElement)
        {
            this.X = updatedDocElement.X;
            this.Y = updatedDocElement.Y;
            this.Width = updatedDocElement.Width;
            this.Height = updatedDocElement.Height;
            this.ParentID = updatedDocElement.ParentID;
            this.TypeID = updatedDocElement.TypeID;
            this.Threshold = updatedDocElement.Threshold;
            this.Transcript = updatedDocElement.Transcript;
        }


    }

    
}