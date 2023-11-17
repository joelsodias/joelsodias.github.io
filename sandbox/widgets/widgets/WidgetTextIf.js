(function (global) 
{
    var document = global.document;

  
    var SVG_NS = "http://www.w3.org/2000/svg";
    var DEFAULT_OPTIONS = {
      showIcon: true,
      colorFunction: null,
      iconFunction: null,
      textFunction: null
    };
  
  
    function WidgetTextIf(element, options) {
      options = Object.assign({}, DEFAULT_OPTIONS, options);
  
      var showIcon = options.showIcon;
      var colorFunction = options.colorFunction;
      var textFunction = options.textFunction;
      var iconFunction = options.iconFunction;
  
      var currentColor = "#000"
      var currentText = ""
      var currentIcon = ""

      function calcColor(value) {
        return colorFunction ? colorFunction(value) : currentColor
      }

      function calcText(value){
        return textFunction ? textFunction(value) : currentText
      }

      function calcIcon(value){
        return iconFunction ? iconFunction(value) : iconFunction
      }
  
      var publicAPI = {
        setValue: function(value) {
          currentColor = calcColor(value)
          currentText =  calcText(value)
          currentIcon = calcIcon(value)

          this.setText(currentText, currentColor, currentIcon)
        },

        setText: function (text, color, icon) {
            currentColor = color
            currentText = text
            currentIcon = icon

            var placeholders = element.getElementsByTagName("PlaceHolder")
            if (placeholders && placeholders.length > 0) {
              for(let placeholder of placeholders) {
                placeholder.innerHTML = `<span style='color:${currentColor}'>${currentText}</span>`
              }
            }
          },
        
        getText: function () {
          return currentText;
        },

        getIcon: function () {
          return currentIcon;
        },

        getColor: function () {
          return currentColor;
        },

      };
  
      return publicAPI;
    }
 
  
    if (typeof define === "function" && define.amd) {
      define(function () {
        return WidgetTextIf;
      });
    } else if (typeof module === "object" && module.exports) {
      module.exports = WidgetTextIf;
    } else {
      global.WidgetTextIf = WidgetTextIf;
    }

    if (!document.WidgetList || !document.WidgetList.Registry) {
      if (!document.WidgetList)  document.WidgetList = {}
      if (!document.WidgetList.Registry) document.WidgetList.Registry = []
    }

    var WidgetRegistry = {
        name: "WidgetTextIf",
        init: function () {
          var components = document.getElementsByTagName("WidgetTextIf");
  
          if (components && components.length > 0) {
              console.log(`existem ${components.length} components:`)
              for(let comp of components) {
                 
                  const value = comp.getAttribute("value");
  
                  var htmlItems = comp.getElementsByTagName("Condition");
                  var ranges = []
                  for(let htmlItem of htmlItems) {
                      var item = {
                          label : htmlItem.getAttribute("label"),
                          value : parseFloat(htmlItem.getAttribute("value")),
                          color : htmlItem.getAttribute("color"),
                          icon : htmlItem.getAttribute("icon")
                      }
                      ranges.push(item)
                  }
                  comp.ranges = ranges.sort( (a,b) => { a.value - b.value } )
  
                  // for(let item of comp.ranges) {
                  //     console.log(`label: ${item.label}, value: ${item.value}, color: ${item.color} `)
                  // }
  
                  comp.ui = WidgetTextIf(
                      comp, {
                      colorFunction: function (value) {
                          for (let range of comp.ranges) {
                              if (range.value == value ) return range.color
                          }
                      },
                      textFunction: function (value) {
                        for (let range of comp.ranges) {
                          if (range.value == value ) return range.label
                        }
                      },
                      iconFunction: function (value) {
                        for (let range of comp.ranges) {
                          if (range.value == value ) return range.icon
                        }
                      }

                  }
                  );
  
                  comp.ui.setValue(value);
  
  
              };
          }
      }
    }

    document.WidgetList.Registry.push(WidgetRegistry);
    WidgetRegistry.init();

})(typeof window === "undefined" ? this : window);


    
  