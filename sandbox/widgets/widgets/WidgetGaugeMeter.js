(function (global) 
{
    var document = global.document;



    var requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
      return setTimeout(callback, 1000 / 60);
    };
  
    var SVG_NS = "http://www.w3.org/2000/svg";
    var DEFAULT_OPTIONS = {
      centerX: 50,
      centerY: 50,
      dialRadius: 40,
      dialStartAngle: 135,
      dialEndAngle: 45,
      value: 0,
      max: 100,
      min: 0,
      valueMask: "0",
      valueDialClass: "value",
      valueClass: "value-text",
      dialClass: "dial",
      gaugeClass: "WidgetGaugeMeter",
      textDividerClass : "text-divider",
      showValue: true,
      showBaseValue: true,
      gaugeColor: null,
      label: function (value) {
        return Math.round(value);
      }
    };

    function trueRound(value, decimals) {
      return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

    function formatNumber(number, format) {
      function createFormatter(digits, style) { 
        return new Intl.NumberFormat({
          style: style,
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        })
      }

      var decimalsRegexClause = /0[,|\.](0)*[%]?$/
      var hasDecimals = decimalsRegexClause.test(format) 
      var matchDecmnals = format.match(decimalsRegexClause)
      var decimalCount = hasDecimals ? matchDecmnals[1].length : 0
      var isPercent = /0\%$/.test(format) 
      var addPercent = format == "+%" || format == "%"
      
      var valueToPresent = trueRound(isPercent ? number * 100 : number, decimalCount)
      var styleToFormat = isPercent ? "percent" : "decimal"

      var formatter = createFormatter(decimalCount, styleToFormat)
      var result = formatter.format(valueToPresent) + (addPercent || isPercent ? "%" : "");

      return result


      // switch (format) {
      //     case '0':
      //       return formatter( , isPercent ? "percent" : null ).format(number);
  
      //     case '0.00':
      //         return formatter(2).format(number);
  
      //     case '0,00':
      //         return formatter(2).format(number).replace('.', ',');
  
      //     case '%':
      //     case '+%':
      //         return formatter(0).format(number) + '%';

      //     case '0%':
      //         const percentage = number * 100;
      //         return formatter(0).format(percentage) + '%';
  
      //     case '0.00%':
      //         const percentageWithDecimals = number * 100;
      //         return formatter(2).format(percentageWithDecimals) + '%';
  
      //     case '0,00%':
      //         const percentageWithComma = number * 100;
      //         return formatter(2).format(percentageWithComma).replace('.', ',') + '%';
  
      //     case '#,##0':
      //       return formatter(0).format(number);
            
      //     case '#.##0':
      //       return formatter(0).format(number).replace(',', '.');
  
      //     case '#.##0,00':
      //         return formatter(2).format(number).replace('.', ',');
              
      //     case '#,##0.00':
      //         return formatter(2).format(number);
  
      //     default:
      //         // If the format is not recognized, use the default formatter
      //         return formatter(0).format(number);
      // }
  }
  
    
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

  
    function calculatePercentage(value, min, max) {
      return (value - min) * 100 / (max - min);
    }
  
    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
  
    function polarToCartesian(centerX, centerY, radius, angle) {
      var radians = angle * Math.PI / 180;
      return {
        x: Math.round(1000 * (centerX + radius * Math.cos(radians))) / 1000,
        y: Math.round(1000 * (centerY + radius * Math.sin(radians))) / 1000
      };
    }
  
    function WidgetGaugeMeter(element, options) {
      options = Object.assign({}, DEFAULT_OPTIONS, options);
  
      var svgElement, pathElement, textElement;
      var value = options.value;
      var max = options.max;
      var min = options.min;
      var dialRadius = options.dialRadius;
      var showValue = options.showValue;
      var showBaseValue = options.showBaseValue;
      var startAngle = options.dialStartAngle;
      var endAngle = options.dialEndAngle;
      var valueDialClass = options.valueDialClass;
      var valueClass = options.valueClass;
      var valueMask = options.valueMask
      var dialClass = options.dialClass;
      var gaugeClass = options.gaugeClass;
      var gaugeColor = options.gaugeColor;
      var labelFunction = options.label;
      var viewBox = options.viewBox;
  
      if (startAngle < endAngle) {
        console.log("WARN! startAngle < endAngle, Swapping");
        var temp = startAngle;
        startAngle = endAngle;
        endAngle = temp;
      }
  
      function createPath(radius, startAngle, endAngle, largeArcFlag) {
        var points = polarToCartesian(options.centerX, options.centerY, radius, startAngle);
        var endPoint = polarToCartesian(options.centerX, options.centerY, radius, endAngle);
        var largeArc = largeArcFlag ? 1 : 0;
  
        return ["M", points.x, points.y, "A", radius, radius, 0, largeArc, 1, endPoint.x, endPoint.y].join(" ");
      }
  
      function updatePath(value, duration) {
        var percentage = calculatePercentage(value, min, max);
        var angle = (360 - Math.abs(startAngle - endAngle)) * percentage / 100;
  
        if (showValue) {
          textElement.textContent = labelFunction(value);
          if(showBaseValue) textBaseElement.textContent = max
        }
  
        pathElement.setAttribute("d", createPath(dialRadius, startAngle, angle + startAngle, angle <= 180 ? 0 : 1));
  
        if (gaugeColor) {
          var color = gaugeColor(element, value);
          var durationMs = duration * 1000;
          var transition = "stroke " + durationMs + "ms ease";
          pathElement.style.stroke = color;
          pathElement.style["-webkit-transition"] = transition;
          pathElement.style["-moz-transition"] = transition;
          pathElement.style.transition = transition;
        }
      }
  
      var publicAPI = {
        setMaxValue: function (maxValue) {
          max = maxValue;
        },
        setValue: function (newValue) {
          value = clamp(newValue, min, max);
          if (gaugeColor) {
            updatePath(value, 0);
          }
          updatePath(value);
        },
        setValueAnimated: function (newValue, duration) {
          var oldValue = value;
          value = clamp(newValue, min, max);
          if (oldValue !== value && gaugeColor) {
            updatePath(value, duration);
          }
          function animateValueChange() {
            var time = 1;
            var steps = 60 * duration;
            var startValue = oldValue || 0;
            var endValue = value;
            var easing = function (t) {
              return (t /= 0.5) < 1 ? 0.5 * Math.pow(t, 3) : 0.5 * (Math.pow(t - 2, 3) + 2);
            };
  
            requestAnimationFrame(function step() {
              var t = time / steps;
              var interpolatedValue = (endValue - startValue) * easing(t) + startValue;
              updatePath(interpolatedValue, time / steps);
              time++;
              if (t < 1) {
                requestAnimationFrame(step);
              }
            });
          }
          animateValueChange();
        },
        getValue: function () {
          return value;
        },

       
      };
  
      function initializeGauge() {
        textElement = createSvgElement("text", {
          x: options.centerX,
          y: options.centerY - (showBaseValue ? 15 : 0),
          fill: "#36373B",
          class: valueClass,
          "font-size": "100%",
          "font-family": "sans-serif",
          "font-weight": "bold",
          "text-anchor": "middle",
          "alignment-baseline": "middle",
          "dominant-baseline": "central"
        });


        textBaseElement = createSvgElement("text", {
          x: options.centerX,
          y: options.centerY - (showBaseValue ? 5 : 0),
          fill: "#ACAFB8",
          class: valueClass,
          "font-size": "30%",
          "font-family": "sans-serif",
          "font-weight": "normal",
          "text-anchor": "middle",
          "alignment-baseline": "middle",
          "dominant-baseline": "central"
        });
  
        pathElement = createSvgElement("path", {
          class: valueDialClass,
          fill: "none",
          stroke: "#666",
          "stroke-width": 6,
          d: createPath(dialRadius, startAngle, startAngle)
        });
  
        var gaugePath = createPath(dialRadius, startAngle, endAngle, endAngle - startAngle <= 180 ? 0 : 1);
  
        svgElement = createSvgElement("svg", {
          viewBox: viewBox || "0 0 100 100",
          class: gaugeClass
        }, [
          createSvgElement("path", {
            class: dialClass,
            fill: "none",
            stroke: "#eee",
            "stroke-width": 2,
            d: gaugePath
          }),
          createSvgElement("g", {
            class: "text-container"
          }, [textElement, textBaseElement]),
          pathElement
        ]);
  
        var placeholders = element.getElementsByTagName("PlaceHolder");
        for (const placeholder of placeholders) {
          placeholder.innerHTML = "";
          placeholder.appendChild(svgElement);
        }

        publicAPI.setValue(value);
      }
  
      initializeGauge();
      return publicAPI;
    }
 
  
    if (typeof define === "function" && define.amd) {
      define(function () {
        return WidgetGaugeMeter;
      });
    } else if (typeof module === "object" && module.exports) {
      module.exports = WidgetGaugeMeter;
    } else {
      global.WidgetGaugeMeter = WidgetGaugeMeter;
    }

    if (!document.WidgetList || !document.WidgetList.Registry) {
      if (!document.WidgetList)  document.WidgetList = {}
      if (!document.WidgetList.Registry) document.WidgetList.Registry = []
    }

    var WidgetRegistry = {
        name: "WidgetGaugeMeter",
        init: function () {
          var gauges = document.getElementsByTagName("WidgetGaugeMeter");
  
          if (gauges && gauges.length > 0) {
              //console.log(`existem ${gauges.length} gauges:`)
              for(let gauge of gauges) {
                  
                  const value = gauge.getAttribute("value");
                  const maxValue = gauge.getAttribute("max");
                  const minValue = gauge.getAttribute("min");
                  const animate = gauge.getAttribute("anime");
                  const mask = gauge.getAttribute("mask");
  
                  //console.log(`valor: ${value} `)
                  var htmlItems = gauge.getElementsByTagName("Condition");
                  var ranges = []
                  for(let htmlItem of htmlItems) {
                      //console.log(`label: ${htmlItem.getAttribute("label")}, value: ${htmlItem.getAttribute("value")}, color: ${htmlItem.getAttribute("color")} `)
                      var item = {
                          label : htmlItem.getAttribute("label"),
                          value : parseFloat(htmlItem.getAttribute("value")),
                          color : htmlItem.getAttribute("color")
                      }
                      ranges.push(item)
                  }
                  gauge.ranges = ranges.sort( (a,b) => { a.value - b.value } )
  
                  // for(let item of gauge.ranges) {
                  //     console.log(`label: ${item.label}, value: ${item.value}, color: ${item.color} `)
                  // }
  
                  gauge.ui = WidgetGaugeMeter(
                      gauge, {
                      viewBox : "0 0 100 50",
                      min: minValue,
                      max: maxValue,
                      dialStartAngle: 180,
                      dialEndAngle: 0,
                      value: animate == undefined ? value : 0,
                      gaugeColor: function (gauge, value) {
  
                          for (let range of gauge.ranges) {
                              if (range.value <= value ) return range.color
                          }
                      },
                      // label: function (value) {
                      //   return Math.round(value);
                      // }
                      label: function (value) {
                        
                        return formatNumber(mask ? value : Math.round(value),(mask ? mask : "0"));
                      }
                  }
                  );
  
                  gauge.ui.setValueAnimated(value, 1);
  
  
              };
          }
      }
    }

    document.WidgetList.Registry.push(WidgetRegistry);
    WidgetRegistry.init();

})(typeof window === "undefined" ? this : window);


    
  