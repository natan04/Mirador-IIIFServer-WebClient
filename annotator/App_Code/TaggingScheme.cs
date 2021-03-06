﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;
using System.Xml;
using System.Text;

namespace WebGTModel
{
    /// <summary>
    /// Summary description for TaggingScheme
    /// </summary>
    public class TaggingScheme
    {
        private static TaggingScheme[] _schemes = null;

        public static TaggingScheme GetScheme(int id)
        {
            if (_schemes == null)
                InitSchemes();
            if (id < 1 || id > _schemes.Length) return null;
            return _schemes[id-1];
        }

        public static int GetNumOfSchemes()
        {
            if (_schemes == null)
                InitSchemes();
            return _schemes.Length;
        }

        private static void InitSchemes()
        {
            //TaggingScheme scm1 = new TaggingScheme { Name = "Heb1" };
            //scm1.Types = new DocElement.DocElementType[] { DocElement.DocElementType.Character,DocElement.DocElementType.Word, DocElement.DocElementType.Line,DocElement.DocElementType.Section};
            //scm1.BaseTypes = new DocElement.DocElementType[] { DocElement.DocElementType.Character };
            //scm1.TypesAggregators = new int[]{0,0,0,0,0,0};
            //scm1.TypesAggregators[(int)DocElement.DocElementType.Character] = (int)DocElement.DocElementType.Word;
            //scm1.TypesAggregators[(int)DocElement.DocElementType.Word] = (int)DocElement.DocElementType.Line;
            //scm1.TypesAggregators[(int)DocElement.DocElementType.Line] = (int)DocElement.DocElementType.Section;
            //scm1.TranscriptMultiCharMode = false;

            //TaggingScheme scm2 = new TaggingScheme { Name = "Arb1" };
            //scm2.Types = new DocElement.DocElementType[] { DocElement.DocElementType.PartOfWord, DocElement.DocElementType.Word, DocElement.DocElementType.Line, DocElement.DocElementType.Section };
            //scm2.BaseTypes = new DocElement.DocElementType[] { DocElement.DocElementType.PartOfWord };
            //scm2.TypesAggregators = new int[] { 0, 0, 0, 0, 0, 0 };
            //scm2.TypesAggregators[(int)DocElement.DocElementType.PartOfWord] = (int)DocElement.DocElementType.Word;
            //scm2.TypesAggregators[(int)DocElement.DocElementType.Word] = (int)DocElement.DocElementType.Line;
            //scm2.TypesAggregators[(int)DocElement.DocElementType.Line] = (int)DocElement.DocElementType.Section;
            //scm2.TranscriptMultiCharMode = true;

            //TaggingScheme scm3 = new TaggingScheme { Name = "scm3" };
            //scm3.Types = new DocElement.DocElementType[] { DocElement.DocElementType.PartOfWord, DocElement.DocElementType.Word, DocElement.DocElementType.Line, DocElement.DocElementType.Section };
            //scm3.BaseTypes = new DocElement.DocElementType[] { DocElement.DocElementType.PartOfWord, DocElement.DocElementType.Word, DocElement.DocElementType.Line };
            //scm3.TypesAggregators = new int[] { 0, 0, 0, 0, 0, 0 };
            //scm3.TypesAggregators[(int)DocElement.DocElementType.PartOfWord] = (int)DocElement.DocElementType.Word;
            //scm3.TypesAggregators[(int)DocElement.DocElementType.Word] = (int)DocElement.DocElementType.Line;
            //scm3.TypesAggregators[(int)DocElement.DocElementType.Line] = (int)DocElement.DocElementType.Section;
            //scm3.TranscriptMultiCharMode = true;

            //_schemes = new TaggingScheme[3];
            //_schemes[0] = scm1;
            //_schemes[1] = scm2;
            //_schemes[2] = scm3;
            //try
            //{
            //    XmlSerializer ser = new XmlSerializer(typeof(TaggingScheme[]));
            //    XmlTextWriter writer = new XmlTextWriter("D:\\Ofer\\Projects\\WebGT\\schemes.xml", Encoding.UTF8);
            //    ser.Serialize(writer, _schemes);
            //    writer.Close();
            //}
            //catch (Exception e) { }

            try
            {
                XmlSerializer ser = new XmlSerializer(typeof(TaggingScheme[]));
                XmlReader rd = new XmlTextReader(System.Configuration.ConfigurationManager.AppSettings["SchemesFile"]);
                _schemes = (TaggingScheme[])ser.Deserialize(rd);
            }
            catch (Exception e)
            {
                throw new Exception ("Fail to read schemes");
            }
        }

        private TaggingScheme()
        {
        }

        public DocElement.DocElementType[] BaseTypes
        {
            get;
            set;
        }

        //public int[] BaseTypesIDs
        //{
        //    get
        //    {
        //        return BaseTypes.Select(t => Convert.ToInt32(t)).ToArray();
        //    }
        //}

        public DocElement.DocElementType[] Types
        {
            get;
            set;
        }

        public string Name { get; set; }
        public string[] TypesNames
        {
            get
            {
                if (Types == null) return null;
                return Types.Select(t => (t.ToString())).ToArray();
            }
        }

        public int[] TypesAggregators
        {
            get;
            set;
        }

        public bool TranscriptMultiCharMode
        {
            get;
            set;
        }
    }
}