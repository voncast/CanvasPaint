var $ = function(id) {
  return document.getElementById(id);
};

function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}

function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date("2017-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: "北京",
  nowGraTime: "day"
}

/**
 * 渲染图表
 */
function renderChart() {
  var data = chartData[pageState.nowGraTime][pageState.nowSelectCity];
  // 获取上下文
  var graph = document.getElementById('graph');
  var context = graph.getContext("2d");
  context.clearRect(0, 0, graph.width, graph.height);

  // 绘制背景
  var gradient = context.createLinearGradient(0, 0, 0, 300);


  context.fillStyle = gradient;

  context.fillRect(0, 0, graph.width, graph.height);

  var realheight = graph.height - 15;
  var realwidth = graph.width - 40;
  // 描绘边框
  var grid_cols = data.length + 1;
  var grid_rows = 4;
  var cell_height = realheight / grid_rows;
  var cell_width = realwidth / grid_cols;
  context.lineWidth = 1;
  context.strokeStyle = "#a0a0a0";

  // 结束边框描绘
  context.beginPath();
  // 准备画横线

  //划横线
  context.moveTo(0, realheight);
  context.lineTo(realwidth, realheight);


  //画竖线
  context.moveTo(0, 20);
  context.lineTo(0, realheight);
  context.lineWidth = 1;
  context.strokeStyle = "black";
  context.stroke();


  var max = 0;

  for (var i = 0; i < data.length; i++) {
    if (data[i] > max) {
      max = data[i]
    };
  }
  max = max * 1.1;
  // 将数据换算为坐标
  var points = [];
  for (var i = 0; i < data.length; i++) {
    var v = data[i];
    var px = cell_width * 　(i + 1);
    var py = realheight - realheight * (v / max);
    points.push({
      "x": px,
      "y": py
    });
  }
  switch (pageState.nowGraTime) {
    case ("day"):
      context.font = "10px Arial";
      break;
    case ("week"):
      context.font = "30px Arial";
      break;
    case ("month"):
      context.font = "60px Arial";
      break;
    default:
      context.font = "10px Arial";
  }
  //绘制坐标图形
  for (var i in points) {
    var p = points[i];
    var color = "green";
    var y = realheight - p.y;
    if (!isNaN(y)) {
      if (y >= 100 && y < 200) {
        color = "blue";
      } else if (y >= 200 && y < 300) {
        color = "red";
      } else if (y >= 300 && y < 400) {
        color = "purple";
      } else if (y >= 400) {
        color = "black";
      }
    }
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(p.x, p.y, cell_width, y);
    var sy = y.toFixed(2);
    context.fillText(sy, p.x, p.y);
    context.fill();
  }

}
/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(radio) {
  for (var i = 0; i < 3; i++) {
    var item = radio[i];
    if (item.checked == true && !(item.value == pageState.nowGraTime)) {
      pageState.nowGraTime = item.value;
      renderChart();
    }
  }
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange() {
  pageState.nowSelectCity = document.all['city-select'].value;
  renderChart();
}

/**
 * 当点击时， 调用函数graTimeChange
 */
function initGraTimeForm() {
  var radio = document.getElementsByName("gra-time");
  for (var i = 0; i < radio.length; i++) {
    radio[i].onclick = function() {
      graTimeChange(radio);
    };
  }
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  var sel = $("city-select");
  sel.innerHTML = "";
  for (prop in aqiSourceData) {
    var op = document.createElement("option");
    op.innerHTML = "<option>" + prop + "</option>";
    sel.appendChild(op);
  }
  sel.onchange = function() {
    citySelectChange();
  };
}

/**
 * 初始化图表需要的数据格式
 */
Date.prototype.getWeekOfYear = function(weekStart) { // weekStart：每周开始于周几：周日：0，周一：1，周二：2 ...，默认为周日  
  weekStart = (weekStart || 0) - 0;
  if (isNaN(weekStart) || weekStart > 6)
    weekStart = 0;

  var year = this.getFullYear();
  var firstDay = new Date(year, 0, 1);
  var firstWeekDays = 7 - firstDay.getDay() + weekStart;
  var dayOfYear = (((new Date(year, this.getMonth(), this.getDate())) - firstDay) / (24 * 3600 * 1000)) + 1;
  return Math.ceil((dayOfYear - firstWeekDays) / 7) + 1;
}

function initAqiChartData() {
  // 将原始的源数据处理成图表需要的数据格式
  // 处理好的数据存到 chartData 中
  var d = {};
  var w = {};
  var m = {};
  for (prop in aqiSourceData) {
    var aqiDay = [];
    var aqiWeek = [];
    var aqiMonth = [];
    var calWeek = [];
    var calMonth = [];
    aqiWeek.fill(0);
    aqiMonth.fill(0);
    var city = aqiSourceData[prop];
    var keyArr = Object.getOwnPropertyNames(city);
    for (var i = 0; i < keyArr.length; i++) {
      var name = keyArr[i];
      var aqiData = city[name];
      aqiDay.push(aqiData);
      var year = parseInt(name.slice(0, 4));
      var week = parseInt(name.substring(8));
      var month = parseInt(name.slice(5, 7)) - 1;
      var date = new Date();
      date.setFullYear(year, month, week);
      var noWeek = date.getWeekOfYear();
      aqiWeek[noWeek] = [];
      aqiWeek[noWeek].push(aqiData);
      aqiMonth[month] = [];
      aqiMonth[month].push(aqiData);
    }
    for (var i = 0; i < aqiWeek.length; i++) {
      if (aqiWeek[i]) {
        var we = aqiWeek[i];
        var len = we.length;
        var sum = 0;
        for (k = 0; k < len; k++) {
          sum += we[k];
        }
        sum /= len;
        calWeek[i] = sum;
      }
    }
    for (var i = 0; i < aqiMonth.length; i++) {
      if (aqiMonth[i]) {
        var we = aqiMonth[i];
        var len = we.length;
        var sum = 0;
        for (k = 0; k < len; k++) {
          sum += we[k];
        }
        sum /= len;
        calMonth[i] = sum;
      }
    }
    d[prop] = aqiDay;
    w[prop] = calWeek;
    m[prop] = calMonth;
  }
  chartData["day"] = d;
  chartData["week"] = w;
  chartData["month"] = m;
  renderChart();
}


/**
 * 初始化函数
 */
function init() {
  initGraTimeForm();
  initCitySelector();
  initAqiChartData();
}
window.onload = function() {
  init();
}