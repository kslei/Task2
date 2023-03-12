const container = document.querySelector('.map');
const mans = document.querySelectorAll('.mans');
const gajets = document.querySelectorAll('.gajets');
const users = document.querySelector('.text__users');
const next = document.querySelector('.next');
const storage = document.querySelector('.text__storage');
const byteCloud = document.querySelector('.text__byteCloud');
const startAgain = document.querySelector('.text__startAgain');
const start = document.querySelector('.start');
const restart = document.querySelector('.restart');
const circles = document.querySelectorAll('.circle');
const modal = document.querySelector('.modal');
const time = 3000;//ms
const distances = [
  { path: "europe_germany", latency: 19.769},
  { path: "europe_east-usa", latency: 97.798},
  { path: "europe_west-usa", latency: 170.207},
  { path: "europe_singapore", latency: 182.078},
  { path: "asia_germany", latency: 296.262},
  { path: "asia_east-usa", latency: 232.983},
  { path: "asia_west-usa", latency: 143.422},
  { path: "asia_singapore", latency: 70.663},
  { path: "north-america_germany", latency: 122.733},
  { path: "north-america_east-usa", latency: 48.174},
  { path: "north-america_west-usa", latency: 32.798},
  { path: "north-america_singapore", latency: 204.497},
  { path: "south-america_germany", latency: 174.77},
  { path: "south-america_east-usa", latency: 139.533},
  { path: "south-america_west-usa", latency: 181.719},
  { path: "south-america_singapore", latency: 367.718},
  { path: "oceania_germany", latency: 255.303},
  { path: "oceania_east-usa", latency: 207.875},
  { path: "oceania_west-usa", latency: 179.444},
  { path: "oceania_singapore", latency: 92.456},
]
let max = distances.reduce((acc, curr) => acc.latency > curr.latency ? acc : curr).latency;
var gajetActive = [];
var serverByteCloud = [];
var regions = [];
var tableByteCloud = [];
var tableStorage = [];
var serverStorage;
let count = 0;
let countServer = 0;
var routes = [];
var latencies = [];
//Ищем на каком "mans" отработало событие "click"
mans.forEach(item => {
  item.addEventListener("click", showGajets);
})
//Формируем массив регионов
function showGajets(event) {
  let parent = event.target.offsetParent//region
  if (!regions.includes(parent.className)) {
    regions.push(parent.className);
  }
  let manType = event.target.className.split("__")[1];
  if (manType === undefined) return;
  event.target.parentElement.style.display = "none";
  gajets.forEach(item => {
    if(item.parentElement === parent) {
      next.style.display = 'block';//Включаем Next
      item.style.display = "flex";//Включаем div с гаджетами
      for (let i=0; i<item.children.length; i++) {
        let gajetType = item.children[i].className.split("__")[1];
        if (manType === "large" || manType === "medium" && gajetType !== "large" || manType === "small" && gajetType === "small") {
          item.children[i].style.opacity = 1;//Включаем те гаджеты, которые выбраны 
          let gajet = parent.className + "_" + gajetType;
          gajetActive.push(gajet)
        }
      }
    }
  })
  //Отслеживаем сколько регионов задействовано
  if (regions.length > 4) {
    showCircle()
  }
}
next.addEventListener("click", showCircle); 
function showCircle () {
  //Выключаем иконки людей
  mans.forEach(item => {
    item.style.display = "none";
  })
  //Включаем иконки выбора серверов
  circles.forEach(circle => {
    circle.style.display = "block"; 
    circle.parentElement.style.zIndex = 5;
  })
  users.style.display = "none";
  storage.style.display = "flex";
}
//Выбираем серверы
circles.forEach(item => {
  item.onclick = showServer;
})
function showServer (event) {
  event.target.style.display = "none";
  storage.style.display = "none";
  
  byteCloud.style.display = "flex";
  start.style.display = "block";
  let server = event.target.nextElementSibling;
  server.style.display = "block";//Включаем div с сервером, нулевой - serverStorage
  if (countServer === 0) {
    server.style.background = 'url("../img/server.png") center/contain no-repeat';
    serverStorage = event.target.parentElement.className;//расположение сервера Storage
  }
  if (countServer !== 0) {
    server.style.background = 'url("../img/server_ByteCloud.png") center/contain no-repeat';
  }
  serverByteCloud.push(event.target.parentElement.className);
  countServer = countServer + 1;
  if (countServer > 2) {
    start.style.color = "rgb(0, 0, 255)";
    start.style.cursor = "pointer";
    start.addEventListener("click", startTest);
  }
  if (countServer == circles.length) startTest();
}
//Запуск теста
function startTest () {
  start.removeEventListener("click", startTest);
  circles.forEach(item => {
    item.style.display = "none";//Выключаем иконки выбора серверов
  })
  byteCloud.style.display = "none";
  //Формируем маршруты для ByteCloud с учетом минимальной задержки
  for (let i=0; i<regions.length; i++) {
    let route;
    let maxLatency = max;
    for (let j=0; j<serverByteCloud.length; j++) {
      let path = regions[i] + "_" + serverByteCloud[j];
      let latency = distances.find(item => item.path === path).latency;
      if (latency < maxLatency) {
        maxLatency = latency
        route = path.split("_")[1] + "_" + path.split("_")[0];
      }
    }
    routes.push(route);
    latencies.push(maxLatency);
  }
  drawPath(tableByteCloud, routes, latencies);//Для ByteCloud
  //Формируем маршруты для serverStorage
  routes = [];
  latencies = [];
  for (let i=0; i<regions.length; i++) {
    let route;
    let path = regions[i] + "_" + serverStorage;
    let latency = distances.find(item => item.path === path).latency;
    route = path.split("_")[1] + "_" + path.split("_")[0];
    routes.push(route);
    latencies.push(latency);
  }
  setTimeout(() => {
    document.querySelectorAll('.path').forEach(item => item.remove());//очистка путей
    document.querySelectorAll('span').forEach(item => item.remove());//очистка надписей
    count = count + 1;
    drawPath(tableStorage, routes, latencies);//Для serverStorage
    setTimeout(showModal, time);//Время показа serverStorage и запуск модального окна
  }, time + 100)//Время показа ByteCloud
}
//Рисование путей от серверов к потребителям
function drawPath (tables, routes, latencies) {
  for (let i=0; i<routes.length; i++) {
    let table = {region: "", latency: 0, download: 0, video: "", rating: 0, number: 0};
    let num = 0;
    for (let j=0; j<gajetActive.length; j++) {
      if(gajetActive[j].split('_')[0] === routes[i].split('_')[1]) {
        gajets.forEach(item => {
          if (item.parentElement.className === gajetActive[j].split('_')[0]) {
            for (let k=0; k<item.children.length; k++) {
              if(item.children[k].className.split('__')[1] == gajetActive[j].split('_')[1]) {
                item.children[k].firstChild.firstChild.style.transition = `width ${latencies[i] * 10}ms ease-in`;
                item.children[k].firstChild.firstChild.style.width = "100%";
                setTimeout(()=> {
                  item.children[k].firstChild.firstChild.style.transition = `width 0ms ease-in`;
                  item.children[k].firstChild.firstChild.style.width = '0%';
                }, time)
              }
            }
          }
        })
        num +=1;
        let adress = "../img/arc_" + routes[i].split('_')[0] + "_" + gajetActive[j] + ".png";
        let path = document.createElement('div');
        path.className = "path";
        path.style.backgroundImage = `url(${adress})`;
        container.append(path)
      }
    }
    //Формируем надписи к каждому пути
    let description = document.createElement('span');
    description.className = "des__" + routes[i];
    container.append(description);
    description.innerHTML = `latency: ${latencies[i]} ms`;//Задержка
    //Формируем данные для строки таблицы    
    table.region = routes[i].split('_')[1];
    table.latency = latencies[i];
    table.number = num;
    if (latencies[i] <= 100) {
      table.rating = 5;
      table.video = "2K/2160p Ultra HD";
      table.download = Math.round(3 * latencies[i]);
    } else {
      if (latencies[i] <= 150) {
        table.video = "2K/2160p Ultra HD";
        table.rating = 4;
        table.download = Math.round(3.5 * latencies[i]);
      } else {
        if (latencies[i] <= 200) {
          table.video = "1080p Full HD";
          table.rating = 3;
          table.download = Math.round(4 * latencies[i]);
        } else {
          if (latencies[i] <= 250) {
            table.video = "720p HD Ready";
            table.rating = 2;
            table.download = Math.round(4.5 * latencies[i]);
          } else {
            table.video = "480p";
            table.rating = 1;
            table.download = Math.round(5 * latencies[i]);
          }
        }
      }
    }
    setTimeout(() => {
      description.innerHTML = `time: ${table.download} ms`;//Время загрузки
    }, latencies[i]*10)//Время показа задержки
    tables.push(table)
  }
}
//Модальное окно
function showModal () {
  startAgain.style.display = "flex";
  modal.style.display = "flex";
  drowTable(tableByteCloud);//Левая часть таблицы
  drowTable(tableStorage);//Правая часть таблицы
  container.firstElementChild.style.filter = "blur(2px)";//Размытие фона карты
  document.querySelectorAll('span').forEach(item => item.remove());//Очистка надписей
  document.querySelectorAll('.path').forEach(item => item.style.filter = "blur(2px)");//Размытие фона путей
  //Выключение гаджетов
  gajets.forEach(item => {
    item.style.display = "none";
    for (let node of item.children) {
      node.style.opacity = 0;
    }
  })
  //Выключение серверов
  circles.forEach(item => {
    item.nextElementSibling.style.display = 'none';
  })
}
//Установка заглавных букв в названиях регионов
function toUp (str) {
  let arr = str.split('-');
  let res = [];
  for (let i=0; i<arr.length; i++) {
    res.push(arr[i][0].toUpperCase() + arr[i].slice(1));
  }
  return res.join(" ")
}
//Рисование таблицы
function drowTable (table) {
  let tableSort = table.sort((a, b) => b.number - a.number);//Сортировка строк по количеству пользователей
  tableSort.forEach(item => {
    let tableItem = document.createElement('div');
    tableItem.className = "table__item";
    //Выбор столбца
    count === 1 ? modal.firstElementChild.append(tableItem) : modal.lastElementChild.append(tableItem);
    let header = document.createElement('div');
    header.className = "header";
    tableItem.append(header);
    let headerTitle = document.createElement('div');
    headerTitle.className = "header__title";
    header.append(headerTitle);
    let title = toUp(item.region)
    headerTitle.innerHTML = title;
    let rating = document.createElement('ul');
    rating.className = "rating";
    header.append(rating);
    for (let i=0; i<5; i++) {
      let star = document.createElement('li');
      item.rating > i ? star.className = "star_active" : star.className = "star";
      rating.append(star);
    }
    let data = document.createElement('div');
    data.className = "data";
    tableItem.append(data);
    let latency = document.createElement('div');
    latency.className = 'latency';
    data.append(latency);
    latency.innerHTML = `Latency<br>${Math.floor(item.latency)}`;
    let download = document.createElement('div');
    download.className = 'download';
    data.append(download);
    download.innerHTML = `Download time<br>${item.download} ms`;
    let video = document.createElement('div');
    video.className = 'video';
    data.append(video);
    video.innerHTML = `Video streaming<br>${item.video}`;
  })
  count = count + 1;
}
//Сброс параметров в исходное состояние
startAgain.addEventListener("click", reload);
function reload() {
  startAgain.style.display = "none";
  users.style.display = "flex";
  next.style.display = "none";
  container.firstElementChild.style.filter = "none";
  document.querySelectorAll('.table__item').forEach(item => item.remove());
  mans.forEach(item => item.style.display = "flex");
  document.querySelectorAll('.path').forEach(item => item.remove());
  modal.style.display = "none";
  circles.forEach(circle => {
    circle.parentElement.style.zIndex = 2;
  });
  start.style.color = "rgba(0, 0, 255, 0.37)";
  start.style.cursor = "auto";
  gajetActive = [];
  serverByteCloud = [];
  regions = [];
  tableByteCloud = [];
  tableStorage = [];
  serverStorage = "";
  count = 0;
  countCircle = 0;
  countServer = 0;
  routes = [];
  latencies = [];
}