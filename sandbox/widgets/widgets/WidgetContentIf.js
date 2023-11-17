(function (global) 
{
    var document = global.document;

  
    // if (typeof define === "function" && define.amd) {
    //   define(function () {
    //     return WidgetContentIf;
    //   });
    // } else if (typeof module === "object" && module.exports) {
    //   module.exports = WidgetContentIf;
    // } else {
    //   global.WidgetContentIf = WidgetContentIf;
    // }

    if (!document.WidgetList || !document.WidgetList.Registry) {
      if (!document.WidgetList)  document.WidgetList = {}
      if (!document.WidgetList.Registry) document.WidgetList.Registry = []
    }

    var WidgetRegistry = {
        name: "WidgetContentIf",
        init: function () {
          var components = document.getElementsByTagName("WidgetContentIf");
  
          if (components && components.length > 0) {
              //console.log(`existem ${components.length} components:`)
              for(let comp of components) {
                 
                  const placeholders = comp.getElementsByTagName("PlaceHolder");

                  if (!placeholders || (placeholders.length && placeholders.length == 0)) return;

                  const value = comp.getAttribute("value");
  
                  var htmlItems = comp.getElementsByTagName("Condition");

                  for (let index = 0; index < htmlItems.length; index++) {
                    
                    var htmlItem = htmlItems[index]

                    var itemValue = htmlItem.getAttribute("value")  
                    
                    if (value != itemValue)  {                     
                       htmlItem.remove();
                       index--
                    }

                    if (value == itemValue)
                      if(placeholders.length && placeholders.length > 0){
                        for(let placeholder of placeholders) {
                          placeholder.innerHTML = htmlItem.innerHTML;
                        }
                    }
                    
                  }
  
              };

          }
      }
    }

    document.WidgetList.Registry.push(WidgetRegistry);
    WidgetRegistry.init();

})(typeof window === "undefined" ? this : window);


    
  