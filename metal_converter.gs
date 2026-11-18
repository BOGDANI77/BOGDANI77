/**
 * Скрипт для конвертации погонных метров металлопроката в тоннаж
 * 
 * Формула расчёта:
 * Тоннаж = (Погонные метры × Вес 1 п.м. в кг) / 1000
 * 
 * Использование:
 * 1. Откройте Google Таблицу
 * 2. Расширения → Apps Script
 * 3. Вставьте этот код
 * 4. Сохраните проект
 * 
 * Функции можно вызывать из ячеек как обычные формулы:
 * =METERS_TO_TONS(A2; B2) где A2 - погонные метры, B2 - вес 1 п.м. в кг
 */

/**
 * Конвертирует погонные метры в тоннаж
 * @param {number} meters - количество погонных метров
 * @param {number} weightPerMeter - вес одного погонного метра в килограммах
 * @return {number} вес в тоннах
 * @customfunction
 */
function METERS_TO_TONS(meters, weightPerMeter) {
  if (meters === null || meters === '' || weightPerMeter === null || weightPerMeter === '') {
    return null;
  }
  
  var metersNum = parseFloat(meters);
  var weightNum = parseFloat(weightPerMeter);
  
  if (isNaN(metersNum) || isNaN(weightNum)) {
    return 'Ошибка: введите числовые значения';
  }
  
  if (metersNum < 0 || weightNum < 0) {
    return 'Ошибка: значения не могут быть отрицательными';
  }
  
  // Формула: (метры × кг/м) / 1000 = тонны
  var tons = (metersNum * weightNum) / 1000;
  
  return tons;
}

/**
 * Конвертирует погонные метры в тоннаж для арматуры
 * @param {number} meters - количество погонных метров
 * @param {number} diameter - диаметр арматуры в мм
 * @return {number} вес в тоннах
 * @customfunction
 */
function ARMATURE_METERS_TO_TONS(meters, diameter) {
  if (meters === null || meters === '' || diameter === null || diameter === '') {
    return null;
  }
  
  var metersNum = parseFloat(meters);
  var diameterNum = parseFloat(diameter);
  
  if (isNaN(metersNum) || isNaN(diameterNum)) {
    return 'Ошибка: введите числовые значения';
  }
  
  // Таблица веса арматуры (кг/м) по диаметрам
  var armatureWeights = {
    6: 0.222,
    8: 0.395,
    10: 0.617,
    12: 0.888,
    14: 1.21,
    16: 1.58,
    18: 2.0,
    20: 2.47,
    22: 2.98,
    25: 3.85,
    28: 4.83,
    32: 6.31,
    36: 7.99,
    40: 9.87
  };
  
  var weightPerMeter = armatureWeights[diameterNum];
  
  if (!weightPerMeter) {
    return 'Ошибка: диаметр не найден в таблице (доступны: 6,8,10,12,14,16,18,20,22,25,28,32,36,40 мм)';
  }
  
  var tons = (metersNum * weightPerMeter) / 1000;
  
  return tons;
}

/**
 * Конвертирует погонные метры в тоннаж для стальных труб
 * @param {number} meters - количество погонных метров
 * @param {number} outerDiameter - наружный диаметр в мм
 * @param {number} wallThickness - толщина стенки в мм
 * @return {number} вес в тоннах
 * @customfunction
 */
function PIPE_METERS_TO_TONS(meters, outerDiameter, wallThickness) {
  if (meters === null || meters === '' || outerDiameter === null || outerDiameter === '' || wallThickness === null || wallThickness === '') {
    return null;
  }
  
  var metersNum = parseFloat(meters);
  var odNum = parseFloat(outerDiameter);
  var wtNum = parseFloat(wallThickness);
  
  if (isNaN(metersNum) || isNaN(odNum) || isNaN(wtNum)) {
    return 'Ошибка: введите числовые значения';
  }
  
  // Расчёт веса 1 п.м. трубы: π × (D - S) × S × ρ
  // где D - наружный диаметр (м), S - толщина стенки (м), ρ - плотность стали (7850 кг/м³)
  var d_m = odNum / 1000;  // перевод в метры
  var s_m = wtNum / 1000;  // перевод в метры
  var density = 7850;      // плотность стали кг/м³
  
  var weightPerMeter = Math.PI * (d_m - s_m) * s_m * density;
  
  if (weightPerMeter <= 0) {
    return 'Ошибка: некорректные размеры трубы';
  }
  
  var tons = (metersNum * weightPerMeter) / 1000;
  
  return tons;
}

/**
 * Массовый расчёт: конвертация диапазона погонных метров в тоннаж
 * @param {range} data - диапазон данных [метры, вес 1 п.м. в кг]
 * @return {range} массив значений в тоннах
 * @customfunction
 */
function BATCH_METERS_TO_TONS(data) {
  if (!data || !Array.isArray(data)) {
    return 'Ошибка: выберите диапазон данных';
  }
  
  var result = [];
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (row.length >= 2) {
      var meters = row[0];
      var weightPerMeter = row[1];
      
      if (meters === null || meters === '' || weightPerMeter === null || weightPerMeter === '') {
        result.push([null]);
        continue;
      }
      
      var metersNum = parseFloat(meters);
      var weightNum = parseFloat(weightPerMeter);
      
      if (isNaN(metersNum) || isNaN(weightNum)) {
        result.push(['Ошибка']);
        continue;
      }
      
      var tons = (metersNum * weightNum) / 1000;
      result.push([tons]);
    } else {
      result.push(['Недостаточно данных']);
    }
  }
  
  return result;
}

/**
 * Получить справочник весов арматуры
 * @return {range} таблица диаметров и весов
 * @customfunction
 */
function GET_ARMATURE_WEIGHTS() {
  var weights = [
    ['Диаметр (мм)', 'Вес 1 п.м. (кг)'],
    [6, 0.222],
    [8, 0.395],
    [10, 0.617],
    [12, 0.888],
    [14, 1.21],
    [16, 1.58],
    [18, 2.0],
    [20, 2.47],
    [22, 2.98],
    [25, 3.85],
    [28, 4.83],
    [32, 6.31],
    [36, 7.99],
    [40, 9.87]
  ];
  
  return weights;
}

/**
 * Меню для быстрого доступа к функциям
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Металлокалькулятор')
    .addItem('📊 Конвертировать метры в тонны', 'convertMetersToTons')
    .addItem('📐 Расчёт арматуры', 'calculateArmature')
    .addItem('🔩 Расчёт труб', 'calculatePipes')
    .addItem('ℹ️ Справка', 'showHelp')
    .addToUi();
}

/**
 * Конвертация выделенных данных (метры → тонны)
 */
function convertMetersToTons() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var selection = sheet.getSelection();
  var range = selection.getActiveRange();
  var values = range.getValues();
  
  var result = [];
  
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var newRow = [];
    
    for (var j = 0; j < row.length; j++) {
      var cell = row[j];
      
      if (typeof cell === 'number' && cell > 0) {
        // Предполагаем, что это погонные метры
        // Для расчёта нужен вес 1 п.м. - запрашиваем у пользователя
        var ui = SpreadsheetApp.getUi();
        var response = ui.prompt('Введите вес 1 п.м. (кг) для ячейки строка ' + (i+1) + ':', ui.ButtonSet.OK_CANCEL);
        
        if (response.getSelectedButton() == ui.Button.OK) {
          var weight = parseFloat(response.getResponseText());
          if (!isNaN(weight)) {
            var tons = (cell * weight) / 1000;
            newRow.push(tons);
          } else {
            newRow.push('Ошибка');
          }
        } else {
          newRow.push(cell);
        }
      } else {
        newRow.push(cell);
      }
    }
    
    result.push(newRow);
  }
  
  range.setValues(result);
}

/**
 * Показать справку
 */
function showHelp() {
  var helpText = '🔧 МЕТАЛЛОКАЛЬКУЛЯТОР\n\n' +
    'Функции для использования в ячейках:\n\n' +
    '1. =METERS_TO_TONS(A1; B1)\n' +
    '   A1 - погонные метры, B1 - вес 1 п.м. в кг\n\n' +
    '2. =ARMATURE_METERS_TO_TONS(A1; B1)\n' +
    '   A1 - погонные метры, B1 - диаметр арматуры (мм)\n\n' +
    '3. =PIPE_METERS_TO_TONS(A1; B1; C1)\n' +
    '   A1 - метры, B1 - наружный диаметр (мм), C1 - толщина стенки (мм)\n\n' +
    '4. =BATCH_METERS_TO_TONS(A1:B10)\n' +
    '   Массовый расчёт для диапазона\n\n' +
    '5. =GET_ARMATURE_WEIGHTS()\n' +
    '   Показать таблицу весов арматуры';
  
  var ui = SpreadsheetApp.getUi();
  ui.alert('Справка', helpText, ui.ButtonSet.OK);
}

/**
 * Заглушки для пунктов меню (можно расширить)
 */
function calculateArmature() {
  showHelp();
}

function calculatePipes() {
  showHelp();
}
