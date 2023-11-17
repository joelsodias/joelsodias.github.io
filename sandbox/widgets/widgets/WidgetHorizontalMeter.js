(function (global) 
{
    var document = global.document;

  
    var SVG_NS = "http://www.w3.org/2000/svg";

    var DEFAULT_OPTIONS = {
      showIcon: true,
      colorFunction: null,
      sections: ["a","b", "c"]
    };

    function createSvgElement(name, attributes, children) {
      var element = document.createElementNS(SVG_NS, name);
      for (var attr in attributes) {
        element.setAttribute(attr, attributes[attr]);
      }
      if (children) {
        children.forEach(function (child) {
          element.appendChild(child);
        });
      }
      return element;
    }

    function createSvgText(x, y, text, color, valueClass) {
      var textElement = createSvgElement("text", {
        x: x,
        y: y,
        fill: color,
        class: valueClass,
        "font-size": "50%",
        "font-family": "sans-serif",
        "font-weight": "bold",
        "text-anchor": "middle",
        "alignment-baseline": "middle",
        "dominant-baseline": "central"
      });
      textElement.textContent = text
      return textElement;
    }


    function createSvgRectangle(x,y,width,height, color) {
      rect = createSvgElement("rect", {
        x: x,
        y: y,
        width: width,
        height: height,
        fill : color
      }, null)
      return rect;
    }

    function createSvgCircle(cx,cy,r, color) {
      rect = createSvgElement("circle", {
        cx: cx,
        cy: cy,
        r: r,
        fill : color
      }, null)
      return rect;
    }

    function createSvgTriangle(x, y, radius, rotation, color) {
      // Calculate the coordinates of the equilateral triangle vertices with rotation
      var angleInRadians = (Math.PI / 180) * rotation;

      var x1 = x + radius * Math.cos(angleInRadians);
      var y1 = y + radius * Math.sin(angleInRadians);

      var x2 = x + radius * Math.cos(angleInRadians + (2 * Math.PI / 3));
      var y2 = y + radius * Math.sin(angleInRadians + (2 * Math.PI / 3));

      var x3 = x + radius * Math.cos(angleInRadians + (4 * Math.PI / 3));
      var y3 = y + radius * Math.sin(angleInRadians + (4 * Math.PI / 3));



      // Create a polygon element (triangle)
      var triangle = createSvgElement("polygon", {
        points: `${x1},${y1} ${x2},${y2} ${x3},${y3}`,
        style :`fill:${color}`
      }, null)

      //triangle.setAttribute("fill", "lime");

      return triangle;
    }

    function calculatePercentage(value, min, max) {
      return (value - min) * 100 / (max - min);
    }

  
    function WidgetHorizontalMeter(element, options) {
      options = Object.assign({}, DEFAULT_OPTIONS, options);
  
      var min = options.min
      var max = options.max
      var viewBox = options.viewBox
      var compClass = options.compClass
      var sections = options.sections
      var colorFunction = options.colorFunction
      
  
      var publicAPI = {
        setValue: function(value) {
          DrawComponent(value)
        },

      };

      function DrawComponent(value) {

        var percent = calculatePercentage(value, min, max)
        var color = colorFunction ? colorFunction(value) : "#000"

        viewW = 500
        viewH = 20

        marginX = 10
        ruleHeight = 2
        dotsSize = 3
        triangleSize = dotsSize * 3
        triangleYOffset = triangleSize / 2

        refY = viewH / 2
        

        

        svgElement = createSvgElement("svg", {
          viewBox: viewBox || `0 0 ${viewW} ${viewH}`,
          class: compClass || ""
        }, [
          createSvgRectangle(0,0, viewW,viewH, "#fff"),
          createSvgRectangle(marginX+dotsSize/2,refY-ruleHeight/2, viewW-marginX*2-dotsSize/2,ruleHeight, color),
          createSvgCircle(marginX,refY,dotsSize, color),
          createSvgCircle(viewW-marginX,refY,dotsSize, color),
          
        ]);





        if (sections && sections.length > 0) {
          
          lastPosition = (viewW-marginX*2) + marginX

          for (let index = 0; index < sections.length; index++) {
            const item = sections[index];

            var sectionPercent = calculatePercentage(item.value, min, max)

            position = (viewW-marginX*2) * (sectionPercent/100) + marginX

            textPosition = (lastPosition - position) / 2 + position

            lastPosition = position
            
          }  
         
        }

        var percent = calculatePercentage(value, min, max)


        

        positionX = (viewW-marginX*2) * (percent/100)

        var triangle = createSvgTriangle(positionX+marginX, refY - triangleYOffset, triangleSize, 90, color)
        

        svgElement.appendChild(
          triangle,
        )

        var placeholders = element.getElementsByTagName("PlaceHolder");
        for (const placeholder of placeholders) {
          placeholder.innerHTML = "";
          placeholder.appendChild(svgElement);
        }
  

      }

      //DrawComponent();
  
      return publicAPI;
    }
 
  
    if (typeof define === "function" && define.amd) {
      define(function () {
        return WidgetHorizontalMeter;
      });
    } else if (typeof module === "object" && module.exports) {
      module.exports = WidgetHorizontalMeter;
    } else {
      global.WidgetHorizontalMeter = WidgetHorizontalMeter;
    }

    if (!document.WidgetList || !document.WidgetList.Registry) {
      if (!document.WidgetList)  document.WidgetList = {}
      if (!document.WidgetList.Registry) document.WidgetList.Registry = []
    }

    var WidgetRegistry = {
        name: "WidgetHorizontalMeter",
        init: function () {
          var components = document.getElementsByTagName("WidgetHorizontalMeter");
  
          if (components && components.length > 0) {
              
              for(let comp of components) {
                 
                  const value = comp.getAttribute("value");
                  const maxValue = comp.getAttribute("max");
                  const minValue = comp.getAttribute("min");
  
                  var htmlItems = comp.getElementsByTagName("Condition");
                  var ranges = []
                  for(let htmlItem of htmlItems) {
                      var item = {
                          label : htmlItem.getAttribute("label"),
                          value : parseFloat(htmlItem.getAttribute("value")),
                          color : htmlItem.getAttribute("color"),
                      }
                      ranges.push(item)
                  }
                  comp.ranges = ranges.sort( (a,b) => { return a.value - b.value } )
                  comp.ranges = comp.ranges.reverse()
  
                  // for(let item of comp.ranges) {
                  //     console.log(`label: ${item.label}, value: ${item.value}, color: ${item.color} `)
                  // }
  
                  comp.ui = WidgetHorizontalMeter(
                      comp, {
                      sections: comp.ranges,
                      max: maxValue,
                      min: minValue,
                      colorFunction: function (value) {
                          // var index = 0
                          // while(parseFloat(value) > comp.ranges[index].value && index < comp.ranges.length) 
                          //   index++
                          // return comp.ranges[index >= 1 ? index -1 : index].color

                          for (let range of comp.ranges) {
                             if (range.value <= parseFloat(value) ) return range.color
                          }
                      },
                  }
                  );
                  comp.ui.setValue(value)
  
  
              };
          }
      }
    }

    document.WidgetList.Registry.push(WidgetRegistry);
    WidgetRegistry.init();

})(typeof window === "undefined" ? this : window);


    
  