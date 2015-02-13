var labels;
var count = 1;
var index;

anychart.onDocumentLoad(function() {
  var start = new Date().getTime();
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  var labelsArr = [];

  labels = new anychart.core.ui.LabelsFactory();
  labels.container('container');
  labels.clear();

  var label;

  for (index = 0; index < count; index++) {
    //var formatProvider = {value: 'Label: ' + index};
    var formatProvider = {value: '       ABCDEFGHI JKL      MNOPQ     RSTUVWXY <br> Zabcde  fghijklmn   opqrstuvwx   yz0123456  789'};
    //var formatProvider = {value: 'iiiiiiiiiiiWWWWWWWWWiWiWiWiWiWiWiWiWiWiWiWWWWWWWWWiiiiiiiiiiiiiiiWWWWWWWWWiiiiiiiiiiWWWiiiiWWWiiiWWWiii'};
    //var formatProvider = {value: 'Текст (от лат. textus — «ткань; сплетение, связь, сочетание») — зафиксированная на каком-либо материальном носителе человеческая мысль; в общем плане связная и полная последовательность символов. Существуют две основных трактовки понятия «текст»: «имманентная» (расширенная, философски нагруженная) и «репрезентативная» (более частная). Имманентный подход подразумевает отношение к тексту как к автономной реальности, нацеленность на выявление его внутренней структуры. Репрезентативный — рассмотрение текста как особой формы представления знаний о внешней тексту действительности. В лингвистике термин текст используется в широком значении, включая и образцы устной речи. Восприятие текста изучается в рамках лингвистики текста и психолингвистики. Так, например, И. Р. Гальперин определяет текст следующим образом: «это письменное сообщение, объективированное в виде письменного документа, состоящее из ряда высказываний, объединённых разными типами лексической, грамматической и логической связи, имеющее определённый моральный характер, прагматическую установку и соответственно литературно обработанное»[1].'};
    //var formatProvider = {value: 'Текст (от лат. textus — «ткань; сплетение, связь, сочетание») — зафиксированная на каком-либо материальном носителе человеческая мысль; в общем плане связная и полная последовательность символов. Существуют две основных трактовки понятия «текст»: «имманентная» (расширенная, философски нагруженная) и «репрезентативная» (более частная). '};
    var positionProvider = {value: {x: 0, y: 40 * index}};

    label = labels.add(formatProvider, positionProvider);
    //label.padding('40%', 10, '20%', 20);

    //label.textFormatter(function() {
    //  var text = '';
    //
    //  for( var i=0; i < 30; i++ )
    //    text += possible.charAt(Math.floor(Math.random() * possible.length));
    //
    //  return text;
    //});

    //label.textFormatter(function() {
    //  return 'Label'
    //});

    labelsArr.push(label);
  }
  //labels.width(200);
  //labels.height(40);
  labels.useHtml(true);
  labels.anchor(anychart.enums.Anchor.LEFT_TOP);
  labels.fontColor('red');
  labels.fontSize(15);
  //labels.textOverflow('ellipsis');
  labels.textWrap(acgraph.vector.Text.TextWrap.BY_LETTER);
  //labels.textIndent(20);
  //labels.rotation(90);
  //labels.textFormatter(function() {
  //  return 'Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  //});
  //labels.background().enabled(true);
  //labels.background().fill('green 0.3');
  labels.draw();

  //labels.container().rect().setBounds(labels.measure(labelsArr[0]));
  //labels.container().rect().setBounds(labels.measure(labelsArr[1]));


  console.log((new Date().getTime() - start) + 'ms');


  labels.container().rect().setBounds(labels.measure(label));
  var renderer = acgraph.getRenderer();
  console.log(goog.object.getKeys(renderer.textBoundsCache['-2069841799']).length);
  console.log(renderer.textBoundsCache);
});
