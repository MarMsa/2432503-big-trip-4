//импорт библиотеки
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DURATION, SortOptions, SortTypes } from './const';

//расширения
dayjs.extend(duration);
dayjs.extend(relativeTime);

//константы для обозначения времени
const MSECOND_IN_SECOND = 1000;
const SECOND_IN_MINUTE = 60;
const MINUTE_IN_HOUR = 60;
const HOUR_IN_DAY = 24;
const MSECOND_IN_HOUR = MINUTE_IN_HOUR * SECOND_IN_MINUTE * MSECOND_IN_SECOND;
const MSECOND_IN_DAY = HOUR_IN_DAY * MSECOND_IN_HOUR;

//константа для проверки нажатия кнопки
const isEscape = (event) => event.key === 'Escape';

//форматирование строки в дату и время
function formatStringToDateToTime(date){
  return dayjs(date).format('YY/MM/DD HH:mm');
}

//фоматирование строки к сокращенной дате
function formatToShortDate(date){
  return dayjs(date).format('MMM DD');
}

//форматирование стоки ко времени
function formatToTime(date){
  return dayjs(date).format('HH:MM');
}

//продолжительность путешествия(с какого по какое число)
function getPointDuration(point){

  //разница во времени (diff- разница)
  const timeDifferense = dayjs(point.dateTo).diff(dayjs(point.dateFrom));

  //продолжительность (она и будет возвращаться)
  let pointDuration = 0;

  //контейнер для вычесления продолжительности(сколько дней, часов, минут)
  switch(true){

    //дни
    case(timeDifferense >= MSECOND_IN_DAY):
      pointDuration = dayjs.duration(timeDifferense).format('DD[D] HH[H] mm[M]');
      break;

    //часы
    case(timeDifferense >= MSECOND_IN_HOUR):
      pointDuration = dayjs.duration(timeDifferense).format('HH[H] mm[M]');
      break;

    //минуты
    case(timeDifferense < MSECOND_IN_HOUR):
      pointDuration = dayjs.duration(timeDifferense).format('mm[M]');
      break;
  }

  //возврашаем переменную отвечающую за продолжительность
  return pointDuration;
}

//формотирование ко дню и времени
function getSheduleDate(date){
  return dayjs(date).format('DD/MM/YY HH:mm');
}

//рандомное число
function getRandomInteger(a = 0, b = 1){
  const lower = Math.ceil(Math.min(a,b));
  const upper = Math.floor(Math.max(a,b));

  return Math.floor(lower + Math.random() * (upper - lower + 1));
}

//рандомное число в диапозоне
function getRandomValue(items){
  return items[getRandomInteger(0,items.length - 1)];
}

//формирует текущую дату и прибавляет к ней дату которая передается
function getDate({next}){
  const minutesGap = getRandomInteger(0,DURATION.MIN);
  const hoursGap = getRandomInteger(1,DURATION.HOUR);
  const daysGap = getRandomInteger(0,DURATION.DAY);

  //вычетает указаное кол-во времени
  let dateToGet = dayjs().subtract(getRandomInteger(0,DURATION.DAY),'day').toDate();

  if (next){
    dateToGet = dayjs(dateToGet).add(minutesGap,'minute').add(hoursGap,'hour').add(daysGap,'day').toDate();
  }
  return dateToGet;
}

// проверка точки в будущем
function isPointFuture(point){
  return dayjs().isBefore(point.dateFrom);
}

//проверка точки в настоящем
function isPointPresent(point){
  return dayjs().isBefore(point.dateTo) && dayjs().isAfter(point.dateFrom);
}

//проверка точки в прошлом
function isPointPast(point){
  return dayjs().isAfter(point.dateTo);
}

//обновляет значение точки
function updatePoint(points, update){
  return points.map((point) => point.id === update.id ? update : point);
}

//сортировка точек по дню
function sortPointsByDay(firstPoint, secondPoint) {
  return new Date(firstPoint.dateFrom) - new Date(secondPoint.dateFrom);
}

//сортировка точек по времени
function sortPointsByTime(firstPoint, secondPoint) {
  return dayjs(secondPoint.dateTo).diff(dayjs(secondPoint.dateFrom)) - dayjs(firstPoint.dateTo).diff(dayjs(firstPoint.dateFrom));
}

//для сортировки точек по цене
function sortPointsByPrice(firstPoint, secondPoint) {
  return secondPoint.price - firstPoint.price;
}

//проверка на разницу между точками
function isDifference(firstPoint, secondPoint) {
  return firstPoint.dateFrom !== secondPoint.dateFrom || firstPoint.price !== secondPoint.price || sortPointsByTime(firstPoint, secondPoint) !== 0;
}

//адаптирование для клиента точек
function adaptToClient(point){
  const adaptedPoint = {
    ...point,
    price: point['base_price'],
    dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'],
    dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'],
    isFavorite: point['is_favorite']
  };

  delete adaptedPoint['base_price'];
  delete adaptedPoint['date_from'];
  delete adaptedPoint['date_to'];
  delete adaptedPoint['is_favorite'];

  return adaptedPoint;
}

//адаптирование для сервера точек
function adaptToServer(point){
  const adaptedPoint = {
    ...point,
    ['base_price']: Number(point.price),
    ['date_from']: point.dateFrom instanceof Date ? point.dateFrom.toISOString() : null,
    ['date_to']: point.dateTo instanceof Date ? point.dateTo.toISOString() : null,
    ['is_favorite']: point.isFavorite
  };

  delete adaptedPoint.price;
  delete adaptedPoint.dateFrom;
  delete adaptedPoint.dateTo;
  delete adaptedPoint.isFavorite;

  return adaptedPoint;
}

//получение информации для заголовка
function getInfoTitle(points = [], destinations = []) {
  const tripDestinations = SortOptions[SortTypes.DAY]([...points]).map((point) => destinations.find((destination) => destination.id === point.destination).name);

  return tripDestinations.length <= 3 ? tripDestinations.join('&nbsp;&mdash;&nbsp;') : `${tripDestinations.at(0)}&nbsp;&mdash;&nbsp;...&nbsp;&mdash;&nbsp;${tripDestinations.at(-1)}`;
}

//получение информации для продолжительности поездки
function getInfoDuration(points = []) {
  const sortedPoints = SortOptions[SortTypes.DAY]([...points]);

  return (sortedPoints.length > 0) ? `${dayjs(sortedPoints.at(0).dateFrom).format('DD MMM')}&nbsp;&mdash;&nbsp;${dayjs(sortedPoints.at(-1).dateFrom).format('DD MMM')}` : '';
}

//стоимость предлодений
function getOffersCost(offerIds = [], offers = []) {
  return offerIds.reduce((cost, id) => cost + (offers.find((offer) => offer.id === id)?.price ?? 0), 0);
}

//получение информации для стоимости всех точек
function getInfoCost(points = [], offers = []) {
  return points.reduce((cost, point) => cost + point.price + getOffersCost(point.offers, offers.find((offer) => point.type === offer.type)?.offers), 0);
}

//эксопрт всех функций для использования в других файлах
export{
  formatStringToDateToTime,formatToShortDate,formatToTime,getPointDuration,
  getSheduleDate,getRandomInteger,getRandomValue,getDate,isEscape,
  isPointFuture, isPointPresent, isPointPast, updatePoint,sortPointsByDay,
  sortPointsByTime, sortPointsByPrice, isDifference, adaptToClient, adaptToServer, getInfoTitle, getInfoDuration, getInfoCost
};
