if(!_.theme_tag_cloud){_.theme_tag_cloud=1;(function($){$.ra($.fa.anychart.themes.defaultTheme,{tagCloud:{anglesCount:7,fromAngle:-90,toAngle:90,mode:"spiral",textSpacing:1,scale:{type:"linear"},colorRange:{},colorScale:null,normal:{fontFamily:"Verdana, Helvetica, Arial, sans-serif",fontOpacity:1,fontDecoration:"none",fontStyle:"normal",fontVariant:"normal",fontWeight:"normal",fill:function(){return $.Vl(this.scaledColor||this.sourceColor,.85,!0)},stroke:"none"},hovered:{fill:$.HN,stroke:"none"},selected:{fill:"#333 0.85",stroke:"none"},tooltip:{enabled:!0,
title:{enabled:!0},separator:{enabled:!0},titleFormat:function(){return this.name||this.x},format:function(){return"Frequency: "+$.BN(this.value)+"\nPercent of total: "+(100*this.value/this.getStat("sum")).toFixed(1)+"%"}},legend:{enabled:!1,itemsSourceMode:"categories",tooltip:{contentInternal:{background:{disablePointerEvents:!1}}}}}});}).call(this,$)}
