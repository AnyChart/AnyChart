if(!_.bullet){_.bullet=1;(function($){var zsa=function(a,b){return $.Ak($.Pk,a,b||"bar")},F7=function(){$.Y.call(this);this.Ga("defaultRangeMarkerSettings");this.b=null;$.T(this.ua,[["type",4,9],["value",4,9],["layout",4,9],["fill",16,1],["stroke",16,1]])},Asa=function(a,b){$.n(b)&&(b=zsa(b,a.vf("type")),a.vf("type")!=b&&(a.oa.type=b,$.n(a.nd("type"))||a.B(4,9)))},Bsa=function(a,b){if("horizontal"==a)switch(b){default:case "bar":return function(a,b){var c=this.scale().transform(0);c=(0,window.isNaN)(c)?0:$.Za(c,0,1);var d=this.ja(),h=
this.mq(),k=$.zo(h)?$.L(h,d.height):d.height*h;h=d.left+c*d.width;var l=d.top+k/2;c=(b-c)*d.width;d=d.height-k;a.clear().moveTo(h,l).lineTo(h+c,l).lineTo(h+c,l+d).lineTo(h,l+d).close()};case "line":return function(a,b){var c=this.ja(),d=this.mq(),h=Math.round(c.left+c.width*b),k=Math.round(c.top+c.height/2);c=c.height-($.zo(d)?$.L(d,c.height):c.height*d);a.clear().moveTo(h-1,k-c/2).lineTo(h-1,k+c/2).lineTo(h+1,k+c/2).lineTo(h+1,k-c/2).close()};case "ellipse":return function(a,b){var c=this.ja(),d=
this.mq(),h=c.left+c.width*b,k=c.top+c.height/2;c=(c.height-($.zo(d)?$.L(d,c.height):c.height*d))/2;d=c/4;a.clear();a.Fe(h,k,d,c,0,360).close()};case "x":return function(a,b){var c=this.ja(),d=this.mq(),h=Math.round(c.left+c.width*b),k=Math.round(c.top+c.height/2);c=(c.height-($.zo(d)?$.L(d,c.height):c.height*d))/2;d=c/1.5;a.clear().moveTo(h-d-1,k-c).lineTo(h+d-1,k+c).lineTo(h+d+1,k+c).lineTo(h-d+1,k-c).moveTo(h+d-1,k-c).lineTo(h-d-1,k+c).lineTo(h-d+1,k+c).lineTo(h+d+1,k-c).close()}}else switch(b){default:case "bar":return function(a,
b){var c=this.scale().transform(0);c=(0,window.isNaN)(c)?0:$.Za(c,0,1);var d=this.ja(),h=this.mq(),k=$.zo(h)?$.L(h,d.width):d.width*h;h=d.left+k/2;var l=d.Va()-d.height*b;k=d.width-k;c=(b-c)*d.height;a.clear().moveTo(h-.25,l-.5).lineTo(h+k+.25,l-.5).lineTo(h+k+.25,l+c-.5).lineTo(h-.25,l+c-.5).close()};case "line":return function(a,b){var c=this.ja(),d=this.mq(),h=Math.round(c.left+c.width/2),k=Math.round(c.Va()-c.height*b);c=c.width-($.zo(d)?$.L(d,c.width):c.width*d);a.clear().moveTo(h-c/2,k-1).lineTo(h+
c/2,k-1).lineTo(h+c/2,k+1).lineTo(h-c/2,k+1).close()};case "ellipse":return function(a,b){var c=this.ja(),d=this.mq(),h=Math.round(c.left+c.width/2),k=Math.round(c.Va()-c.height*b);c=(c.width-($.zo(d)?$.L(d,c.width):c.width*d))/2;d=c/4;a.clear();a.Fe(h,k,c,d,0,360).close()};case "x":return function(a,b){var c=this.ja(),d=this.mq(),h=Math.round(c.left+c.width/2),k=Math.round(c.Va()-c.height*b);c=(c.width-($.zo(d)?$.L(d,c.width):c.width*d))/2;d=c/1.5;a.clear().moveTo(h-c-1,k-d).lineTo(h+c-1,k+d).lineTo(h+
c+1,k+d).lineTo(h-c+1,k-d).moveTo(h+c-1,k-d).lineTo(h-c-1,k+d).lineTo(h-c+1,k+d).lineTo(h+c+1,k-d).close()}}},G7=function(a,b){$.xx.call(this);this.Ga("bullet");this.jd=[];this.Bc=[];this.zx=!0;this.data(a||null,b);$.xq(this.ua,"layout",114820,9)},Dsa=function(a){(0,$.Re)(a.Bc,function(a){$.pd(a)});a.Bc.length=0;var b=a.la.$().reset();for(b.Gb();b.advance();)Csa(a,b)},Csa=function(a,b){var c=b.ma(),d=new F7;d.Ga(a.vf("defaultMarkerSettings"));d.ka();a.Bc[c]=d;d.scale(a.scale());d.O(a.Oa);Asa(d,a.Mf().nc(c));
d.value(b.get("value"));d.type(b.get("type"));d.mq(b.get("gap"));d.fill(b.get("fill"));d.stroke(b.get("stroke"));d.da(!1);$.K(d,a.faa,a)},Esa=function(a,b){return new G7(a,b)};$.H(F7,$.Y);var Fsa={};$.wq(Fsa,[[0,"type",zsa],[0,"value",$.N],[0,"layout",$.Hk],[1,"fill",$.Uq],[1,"stroke",$.Tq]]);$.U(F7,Fsa);var Gsa={x:"30%",line:"30%",ellipse:"30%",bar:"50%"};$.g=F7.prototype;$.g.ra=$.Y.prototype.ra;$.g.sa=$.Y.prototype.sa|20;
$.g.mq=function(a){return $.n(a)?(this.b!=a&&(this.b=a,this.B(4,9)),this):null===this.b?Gsa[this.g("type")]:this.b};$.g.Nb=function(){return"horizontal"==this.g("layout")};$.g.scale=function(a){if($.n(a)){if(a=$.mt(this.qa,a,null,3,null,this.Via,this)){var b=this.qa==a;this.qa=a;a.da(b);b||this.B(4,9)}return this}return this.qa};$.g.Via=function(a){var b=0;$.X(a,4)&&(b|=4);$.X(a,2)&&(b|=1);this.B(4,b|8)};
$.g.W=function(){if(!this.scale())return $.il(2),this;if(!this.zc())return this;var a=this.O()?this.O().Ja():null,b=a&&!a.xf();b&&a.suspend();this.Sc||(this.Sc=$.rk());if(this.J(8)){var c=this.zIndex();this.Sc.zIndex(c);this.I(8)}this.J(2)&&(c=this.O(),this.Sc.parent(c),this.I(2));this.J(16)&&(this.Sc.stroke(this.g("stroke")),this.Sc.fill(this.g("fill")),this.I(16));this.J(4)&&(c=this.g("value"),c=this.scale().transform(c,0),this.Sc.clear(),(0,window.isNaN)(c)||(c=$.Za(c,0,1),Bsa(this.g("layout"),
this.g("type")).call(this,this.Sc,c)),this.I(4));b&&a.resume();return this};$.g.remove=function(){this.Sc&&this.Sc.parent(null)};$.g.R=function(){$.pd(this.Sc);this.Sc=null;F7.u.R.call(this)};$.H(G7,$.xx);G7.prototype.sa=$.xx.prototype.sa|126976;G7.prototype.Ma=function(){return"bullet"};G7.prototype.data=function(a,b){return $.n(a)?(this.Wf!==a&&(this.Wf=a,$.J(a,$.Gr)?this.la=a.Ui():$.J(a,$.Qr)?this.la=a.Yd():(a=$.A(a)||$.z(a)?a:null,this.la=(new $.Qr(a,b)).Yd()),$.K(this.la,this.dd,this),this.B(127232,1)),this):this.la};G7.prototype.dd=function(a){$.X(a,16)&&this.B(127232,1)};var H7={};$.vq(H7,0,"layout",$.Hk);$.U(G7,H7);$.g=G7.prototype;$.g.Nb=function(){return"horizontal"==this.g("layout")};
$.g.scale=function(a){if(!this.qa&&!$.n(a)){var b=this.vf("scale");this.qa=$.mt(this.qa,b,"linear",3);this.qa.da(!1)}if($.n(a)){if(a=$.mt(this.qa,a,"linear",3))this.qa=a,a.da(!1),this.B(122880,1);return this}return this.qa};$.g.axis=function(a){this.b||(this.b=new $.Uy,this.b.kb(this),$.K(this.b,this.wo,this),$.W(this,"axis",this.b),this.B(114692,9));return $.n(a)?(this.b.N(a),this):this.b};$.g.wo=function(a){var b=0,c=0;$.X(a,1)&&(b|=16384,c|=1);$.X(a,8)&&(b|=4);this.B(b,c)};
$.g.xe=function(a,b){var c=$.N(a);if((0,window.isNaN)(c)){c=0;var d=a}else c=a,d=b;var e=this.jd[c];e||(e=new $.eA,e.Ga(this.vf("defaultRangeMarkerSettings")),this.jd[c]=e,$.K(e,this.Sia,this),this.B(32768,1));return $.n(d)?(e.N(d),this):e};$.g.Sia=function(){this.B(32768,1)};$.g.CO=function(a){this.f||(this.f=new $.Ms,$.K(this.f,this.Ria,this),$.W(this,"rangePalette",this.f),this.f.Gp(!1));return $.n(a)?(this.f.N(a),this):this.f};$.g.Ria=function(a){$.X(a,2)&&this.B(32768,1)};
$.g.Mf=function(a){this.He||(this.He=new $.Os,$.K(this.He,this.Qia,this),$.W(this,"markerPalette",this.He));return $.n(a)?(this.He.N(a),this):this.He};$.g.Qia=function(a){$.X(a,2)&&this.B(65536,1)};$.g.ob=function(){var a,b=this.scale();b.Nf()&&b.Ag();var c=0;for(a=this.Bc.length;c<a;c++){var d=this.Bc[c];null!=d&&(d.scale(b),"bar"==d.g("type")&&b.Xc(0),b.Xc(d.g("value")))}c=0;for(a=this.jd.length;c<a;c++)d=this.jd[c],null!=d&&(d.scale(b),b.Xc(d.g("from")),b.Xc(d.g("to"))),b.Nf()&&b.Hg();this.axis().scale(this.scale())};
$.g.Kj=function(){var a=this.Nb(),b=this.title(),c=this.axis();a?($.Vy(c,"bottom"),$.gw(b,"left")):($.Vy(c,"left"),$.gw(b,"bottom"));return G7.u.Kj.call(this)};
$.g.Ph=function(a){if(this.zc()){this.J(4096)&&(Dsa(this),this.I(4096));this.J(8192)&&(this.ob(),this.I(8192));var b=this.axis();this.J(16388)&&(b.ka(),!b.O()&&b.enabled()&&b.O(this.Oa),b.ja(a),b.padding(0),b.da(!1),b.W(),this.I(16384));var c=b.enabled()?b.yd():a;if(this.J(32772)){a=0;for(b=this.jd.length;a<b;a++){var d=this.jd[a];if(d){d.ka();$.fA(d,this.Nb()?"vertical":"horizontal");var e=d,f=this.CO().nc(a);f=$.Xb(f);f!=e.vf("fill")&&($.Oq(e.oa,$.gH,{fill:f}),e.B(16,1));d.ja(c);d.O(this.Oa);d.Qp(0);
d.W();d.da(!1)}}this.I(32768)}if(this.J(65540)){a=0;for(b=this.Bc.length;a<b;a++)d=this.Bc[a],d.ka(),d.ja(c),Asa(d,this.Mf().nc(a)),e=d,f=this.g("layout"),$.n(f)&&(f=$.Hk(f,e.vf("layout")),e.vf("layout")!=f&&(e.oa.layout=f,$.n(e.nd("layout"))||e.B(4,9))),d.W(),d.da(!1);this.I(65536)}}};$.g.faa=function(){this.B(65536,1)};
$.g.Tg=function(a){var b;"pointIndex"in a?b=a.pointIndex:"labelIndex"in a?b=a.labelIndex:"markerIndex"in a&&(b=a.markerIndex);b=$.N(b);a.pointIndex=b;var c=a.type;switch(c){case "mouseout":c="pointmouseout";break;case "mouseover":c="pointmouseover";break;case "mousemove":c="pointmousemove";break;case "mousedown":c="pointmousedown";break;case "mouseup":c="pointmouseup";break;case "click":c="pointclick";break;case "dblclick":c="pointdblclick";break;default:return null}var d=this.data().$();d.select(b)||
d.reset();return{type:c,actualTarget:a.target,pie:this,iterator:d,sliceIndex:b,pointIndex:b,target:this,originalEvent:a}};$.g.Ii=function(){return this};$.g.$i=function(){return this};$.g.Ue=function(){return[this]};$.g.Vl=function(a){return $.n(a)?(a=$.Bk(a),a!=this.K&&(this.K=a),this):this.K};$.g.yj=function(){for(var a=this.la?this.la.$().Gb():0,b=0,c=this.Bc.length,d=0;d<c;d++){var e=this.Bc[d];if(e&&!e.enabled())b++;else break}return!a||!c||b==c};
$.g.F=function(){var a=G7.u.F.call(this);$.Xq(this,H7,a);a.data=this.data().F();a.rangePalette=this.CO().F();a.markerPalette=this.Mf().F();a.scale=this.scale().F();a.axis=this.axis().F();for(var b=[],c=0;c<this.jd.length;c++)b.push(this.jd[c].F());a.ranges=b;return{chart:a}};
$.g.U=function(a,b){G7.u.U.call(this,a,b);this.data(a.data);$.Pq(this,H7,a);this.CO().fa(!!b,a.rangePalette);this.Mf().fa(!!b,a.markerPalette);var c=a.scale;if($.z(c))var d=$.gt(c,null);else $.B(c)?(d=$.gt(c.type,!1),d.N(c)):d=null;d&&this.scale(d);this.axis(a.axis);c=a.ranges;if($.A(c))for(d=0;d<c.length;d++)this.xe(d,c[d])};$.g.R=function(){$.rd(this.jd,this.Bc,this.b,this.f,this.He);this.jd.length=0;this.Bc.length=0;this.He=this.f=this.b=null;G7.u.R.call(this)};var I7=G7.prototype;I7.data=I7.data;
I7.rangePalette=I7.CO;I7.markerPalette=I7.Mf;I7.scale=I7.scale;I7.axis=I7.axis;I7.range=I7.xe;I7.isHorizontal=I7.Nb;I7.getType=I7.Ma;I7.noData=I7.Em;$.Xp.bullet=Esa;$.E("anychart.bullet",Esa);}).call(this,$)}
