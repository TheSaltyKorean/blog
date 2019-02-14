---
layout: post
title:  "Writing to .Net Config Files"
date:   2008-06-05
banner_image: 
tags: []
---

I've been working with config files for quite some time.  I was recently reminded that I needed to finish my original article and share my final findings on my personal best practices for working with config files.

One of the coolest and most useful features in config files is the file attribute as displayed below (see my other article for a more detailed explaination, [preferred-method-for-read-only-config-files](http://www.mysoftwarestartup.com/blogs/general/archive/2008/03/26/preferred-method-for-read-only-config-files.aspx "http://www.mysoftwarestartup.com/blogs/general/archive/2008/03/26/preferred-method-for-read-only-config-files.aspx")).


> configuration  
>   <configSections>  
>     <section name="MyCustomSection" type="System.Configuration.NameValueFileSectionHandler, System, Version=1.0.3300.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"/>  
>   </configSections>  
> <font color="#ff0000">  <MyCustomSection file="MyCustomConfigFile.config"></MyCustomSection>  
> </font>configuration



If you take a look at the other article, it's a terrific way to setup a **read only** config file, but what about writing back to it at runtime?  Well, the best way is to use the ConfigurationManager object and then open the raw xml into an XmlDocument object.  (yes yes, I might be a Visual Basic MVP, but I can write the occasional C#)

> Configuration config = ConfigurationManager.OpenExeConfiguration(FileName);  
> ConfigurationSection section = config.GetSection(SectionName);

> XmlDocument xml = new XmlDocument();  
> xml.LoadXml(section.SectionInformation.GetRawXml());

But the problem is, if you have used the file attribute (file="MyCustomConfigFile.config"), it's not smart enough to grab the contents of the file (I'm hoping to contact the product team soon to see if they can address the issue).  Fortunately, there is a way to get the filename from the file attribute.  And by adding in a little recursion, we're able to create an easy method to write back to the proper config file, without having to know the actual filename at runtime.

> private const string SETTING_KEY_NAME = "key";  
> private const string SETTING_VALUE_NAME = "value";
> 
> public static void SetConfigValue(string SectionName, string KeyName, string Value)  
>         {  
>             SetConfigValue(System.Reflection.Assembly.GetEntryAssembly().Location , SectionName, KeyName, Value);  
>         }
> 
>         public static void SetConfigValue(string FileName, string SectionName, string KeyName, string Value)  
>         {  
>             Configuration config = ConfigurationManager.OpenExeConfiguration(FileName);  
>             ConfigurationSection section = config.GetSection(SectionName);
> 
>             XmlDocument xml = new XmlDocument();  
>             xml.LoadXml(section.SectionInformation.GetRawXml());
> 
>             if (xml.DocumentElement.Attributes["file"] == null)  
>                 {  
>                     foreach (XmlElement element in xml.ChildNodes[0])  
>                     {  
>                         if (element.Attributes[SETTING_KEY_NAME].Value == KeyName) element.Attributes[SETTING_VALUE_NAME].Value = Value;  
>                     };
> 
>                     section.SectionInformation.SetRawXml(xml.OuterXml);  
>                     <span class="skimlinks-unlinked">config.Save</span>();  
>                 }  
>             else  
>                 {  
>                     SetConfigValue(System.Reflection.Assembly.GetEntryAssembly().Location.Remove  
>                         (  
>                         System.Reflection.Assembly.GetEntryAssembly().Location.LastIndexOf("\\")) + "\\" + xml.DocumentElement.Attributes["file"].Value.Remove  
>                             (  
>                             xml.DocumentElement.Attributes["file"].Value.LastIndexOf(".config")  
>                             ),  
>                         SectionName,  
>                         KeyName,  
>                         Value);  
>                 }  
>         }

This creates a new problem though.  You can no longer use the same format of the underlying file, specified in the file attribute.

Old format of the MyCustomConfigFile.config specified in my other article [preferred-method-for-read-only-config-files](http://www.mysoftwarestartup.com/blogs/general/archive/2008/03/26/preferred-method-for-read-only-config-files.aspx "http://www.mysoftwarestartup.com/blogs/general/archive/2008/03/26/preferred-method-for-read-only-config-files.aspx"):

> <?xml version="1.0" encoding="utf-8" ?>  
> <SectionName>  
>      <add key="myKey" value ="" />  
> </SectionName>

New required format for writing to config files with the file attribute:

> <?xml version="1.0" encoding="utf-8" ?>  
> <!-- You must have an empty file named "MyCustomConfigFile" with no extention in the same directory as this file -->  
> <configuration>  
>   <MyCustomSection>  
>     <setting key="MySetting1" value="True" />  
>     <setting key="MySetting2" value="File;Email;EventLog"/>  
>     <setting key="MySetting3" value="File"/>  
>   </MyCustomSection>  
> </configuration>

You'll notice that I had a comment in the file specified in the file attritube. (<!-- You must have an empty file named "MyCustomConfigFile" with no extention in the same directory as this file -->)  I honestly can't recall why this is required (I'm posting this article months after I did the work), but it has to do with reading the config file, and the filenames it is looking for.

This new referred config file format creates a new problem.  You can no longer use the reading method I used in the other article.  I've fixed it in the code below as well as provided the full class.


**Below is the full class that I wrote.  All I ask is that you add a comment telling me how you used it.**

> using System.Configuration;  
> using <span class="skimlinks-unlinked">System.Xml</span>;
> 
> namespace HarvestIT.Common  
> {  
>     /// <summary>  
>     /// Application settings manager.  
>     /// </summary>  
>     public class ConfigManager  
>     {  
>         // Configuration file node names.  
>         private const string SETTING_KEY_NAME = "key";  
>         private const string SETTING_VALUE_NAME = "value";
> 
>         public static string GetConfigValue(string SectionName, string KeyName)  
>         {  
>             return GetConfigValue(System.Reflection.Assembly.GetEntryAssembly().Location, SectionName, KeyName);  
>         }
> 
>         public static string GetConfigValue(string FileName, string SectionName, string KeyName)  
>         {  
>             Configuration config = ConfigurationManager.OpenExeConfiguration(FileName);  
>             ConfigurationSection section = config.GetSection(SectionName);
> 
>             XmlDocument xml = new XmlDocument();  
>             xml.LoadXml(section.SectionInformation.GetRawXml());
> 
>             if (xml.DocumentElement.Attributes["file"] == null)  
>             {  
>                 foreach (XmlElement element in xml.ChildNodes[0])  
>                 {  
>                     if (element.Attributes[SETTING_KEY_NAME].Value == KeyName) return element.Attributes[SETTING_VALUE_NAME].Value;  
>                 };  
>             }  
>             else  
>             {  
>                 return GetConfigValue(System.Reflection.Assembly.GetEntryAssembly().Location.Remove  
>                     (  
>                     System.Reflection.Assembly.GetEntryAssembly().Location.LastIndexOf("\\")) + "\\" + xml.DocumentElement.Attributes["file"].Value.Remove  
>                         (  
>                         xml.DocumentElement.Attributes["file"].Value.LastIndexOf(".config")  
>                         ),  
>                     SectionName,  
>                     KeyName);  
>             }  
>             return null;  
>         }
> 
>         public static void SetConfigValue(string SectionName, string KeyName, string Value)  
>         {  
>             SetConfigValue(System.Reflection.Assembly.GetEntryAssembly().Location , SectionName, KeyName, Value);  
>         }
> 
>         public static void SetConfigValue(string FileName, string SectionName, string KeyName, string Value)  
>         {  
>             Configuration config = ConfigurationManager.OpenExeConfiguration(FileName);  
>             ConfigurationSection section = config.GetSection(SectionName);
> 
>             XmlDocument xml = new XmlDocument();  
>             xml.LoadXml(section.SectionInformation.GetRawXml());
> 
>             if (xml.DocumentElement.Attributes["file"] == null)  
>                 {  
>                     foreach (XmlElement element in xml.ChildNodes[0])  
>                     {  
>                         if (element.Attributes[SETTING_KEY_NAME].Value == KeyName) element.Attributes[SETTING_VALUE_NAME].Value = Value;  
>                     };
> 
>                     section.SectionInformation.SetRawXml(xml.OuterXml);  
>                     <span class="skimlinks-unlinked">config.Save</span>();  
>                 }  
>             else  
>                 {  
>                     SetConfigValue(System.Reflection.Assembly.GetEntryAssembly().Location.Remove  
>                         (  
>                         System.Reflection.Assembly.GetEntryAssembly().Location.LastIndexOf("\\")) + "\\" + xml.DocumentElement.Attributes["file"].Value.Remove  
>                             (  
>                             xml.DocumentElement.Attributes["file"].Value.LastIndexOf(".config")  
>                             ),  
>                         SectionName,  
>                         KeyName,  
>                         Value);  
>                 }  
>         }  
>     }  
> }