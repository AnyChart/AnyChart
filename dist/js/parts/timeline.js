if(!_.timeline){_.timeline=1;(function($){var h4=function(){$.Y.call(this);this.path=$.rk();$.T(this.ua,[["stroke",0,1]])},i4=function(){$.Y.call(this);this.G=0;this.ye=[];this.o=0;this.i=new $.Iw;$.T(this.ua,[["stroke",16,1],["fill",16,1],["height",276,5]])},j4=function(){this.jd=[]},k4=function(){$.V.call(this);$.T(this.ua,[["length",0,1],["stroke",0,1]])},l4=function(a){$.LA.call(this,a)},m4=function(a,b,c,d,e){$.xB.call(this,a,b,c,d,e);this.f="up";$.T(this.ua,[["direction",2048,1,4294967295]])},n4=function(a,b){return $.n(b)?(a.f=b,a):
a.f},o4=function(a){var b=a.g("direction");return"auto"==b||"odd-even"==b?a.f:b},p4=function(a,b,c,d,e){m4.call(this,a,b,c,d,e)},q4=function(a){$.LA.call(this,a)},r4=function(a,b,c,d,e){m4.call(this,a,b,c,d,e);$.T(this.ua,[["height",0,0]])},s4=function(){$.Oz.call(this);this.Ga("timeline");this.eb=new $.ut;$.W(this,"scale",this.eb);this.eb.uz([[{unit:"minute",count:10},{unit:"hour",count:1},{unit:"day",count:1}],[{unit:"hour",count:4},{unit:"hour",count:12},{unit:"day",count:1}],[{unit:"day",count:1},
{unit:"day",count:2},{unit:"week",count:1}],[{unit:"day",count:2},{unit:"week",count:1},{unit:"month",count:1}],[{unit:"month",count:1},{unit:"quarter",count:1},{unit:"year",count:1}],[{unit:"quarter",count:1},{unit:"year",count:1},{unit:"year",count:10}],[{unit:"year",count:1},{unit:"year",count:10},{unit:"year",count:50}],[{unit:"year",count:10},{unit:"year",count:50},{unit:"year",count:200}]]);this.axis().scale(this.eb);$.K(this.eb,this.hi,this);this.og=[];this.tg=[];this.rg=[];this.wj=this.D=
0;this.P={AC:0,EE:0};this.Za=this.$a=0;this.ea=[];this.fb=[]},dqa=function(a){a.scale().reset();a.Ia=window.Infinity;a.Ka=-window.Infinity;a.f={dj:0,Lj:a.ec.width,sg:-a.ec.height/2,mg:a.ec.height/2};a.axis().B(400);t4(a,0,0)},u4=function(a){for(var b=a.length-1;0<=b;b--){var c=a[b];$.n(c)&&c.md&&$.Ca(a,b,1)}},v4=function(a){return a.axis().enabled()?a.axis().g("height"):0},t4=function(a,b,c){!$.n(b)||b==a.$a&&c==a.Za||(a.$a=b,a.Za=c,$.rr(a,"timelinechart","scroll",1))},eqa=function(a,b){var c=a.dj-
b.dj;return 0==c?b.Lj-a.Lj:c},fqa=function(a,b){var c=a.dj-b.dj;return 0==c?a.Lj-b.Lj:c},w4=function(a,b){a.f.dj=Math.min(a.f.dj,b.dj);a.f.Lj=Math.max(a.f.Lj,b.Lj);a.f.sg=Math.min(a.f.sg,b.sg);a.f.mg=Math.max(a.f.mg,b.mg)},gqa=function(a){var b=new s4;b.Ga("timeline");b.ta("defaultSeriesType","moment");for(var c=0,d=arguments.length;c<d;c++)b.moment(arguments[c]);return b};$.H(h4,$.Y);var hqa={};$.wq(hqa,[$.Z.Xn]);$.U(h4,hqa);
h4.prototype.W=function(){this.path.clear();this.path.stroke(this.g("stroke"));if(!this.zc())return this;this.J(8)&&(this.path.zIndex(this.zIndex()),this.I(8));this.J(2)&&(this.path.parent(this.O()),this.I(2));return this};h4.prototype.hq=function(a,b){if(0!=b.height){var c=$.jp(this.g("stroke"));c=$.R(b.left+a*b.width,c);var d=Math.floor($.R(b.top,1));this.path.moveTo(c,Math.ceil($.R(b.Va(),1))).lineTo(c,d)}};h4.prototype.remove=function(){this.path&&this.path.parent(null)};
h4.prototype.R=function(){$.rd(this.path);this.path=null;h4.u.R.call(this)};$.H(i4,$.Y);var iqa={};$.wq(iqa,[$.Z.Xn,$.Z.xz,[0,"height",$.Fq]]);$.U(i4,iqa);$.g=i4.prototype;$.g.sa=$.Y.prototype.sa|464;$.g.ra=$.Y.prototype.ra|4;$.g.offset=function(a){return $.n(a)?(this.o!=a&&(this.o=a,this.B(400)),this):this.o};$.g.scale=function(a){return $.n(a)?(a!=this.qa&&(this.qa&&$.or(this.qa,this.hi,this),this.qa=a,$.K(this.qa,this.hi,this)),this):this.qa};$.g.hi=function(){this.B(400,0)};
$.g.Xa=function(a){this.mb||(this.mb=new h4,$.W(this,"ticks",this.mb),$.K(this.mb,this.ki,this));return $.n(a)?(this.mb.N(a),this):this.mb};$.g.ki=function(){this.B(256,1)};$.g.labels=function(a){this.zj||(this.zj=new $.Kx,$.K(this.zj,this.fI,this),$.W(this,"labels",this.zj));return $.n(a)?(this.zj.N(a),this):this.zj};$.g.fI=function(){this.B(128,1)};
$.g.W=function(){var a=this.scale();this.Rw();if(!a)return $.il(2),this;if(!this.zc())return this;this.Oa||(this.Oa=this.O().Bd(),this.f||(this.f=this.Oa.path(),this.D=this.Oa.path(),this.D.zIndex(37)),this.Oa.hc(this.ZT()));this.b||(this.b=new $.dz,this.b.labels(this.labels()),$.fz(this.b),$.wl(this.b),this.b.wa($.QE|$.RE));this.J(2)&&(this.Oa.parent(this.O()),this.I(2));this.J(8)&&(this.Oa.zIndex(this.zIndex()),this.I(8));if(this.J(4)){var b=this.ja();this.G=b.top+b.height/2;b=this.ja();var c=b.left,
d=this.g("height");this.K=new $.I(c,this.G-d/2,b.width,d);this.B(400);this.I(4)}if(this.J(16)){var e=this.ja(),f=this.G;b=this.g("height");var h=b/2;this.f.clear();this.D.clear();c=this.g("stroke");d=this.g("fill");var k=$.jp(c),l=this.scale().uj(),m=this.scale().transform(l.min);l=this.scale().transform(l.max+this.o);m*=e.width;l*=e.width;m+=e.left;e=l+e.left;m=$.R(m,k);e=$.R(e,k);l=$.R(f-h,k);f=$.R(f+h,k);this.Oa.clip(new $.I(Math.floor(m),Math.floor(l),Math.ceil(e)-Math.floor(m),Math.ceil(f)-Math.floor(l)));
0!=b&&(this.f.moveTo(m,l).lineTo(e,l).lineTo(e,f).lineTo(m,f).close(),this.D.moveTo(m,l).lineTo(e,l).lineTo(e,f).lineTo(m,f).close(),this.D.stroke(c),this.f.fill(d),this.f.stroke("none"));this.I(16)}if(this.J(256)){if(b=$.Ar(this,"ticks"))for(b.O(this.Oa),b.W(),c=this.Fn(),d=this.scale().uj(),a.Tj()&&(c.length=1),a=0;a<c.length;a++)f=c[a],h=this.scale().transform(f.start),f.start>=d.min&&b.hq(h,this.K);this.I(256)}this.J(64)&&this.I(64);this.J(128)&&(this.labels().enabled()?(this.Kf.parent(this.Oa),
this.vi()):this.Kf.parent(null),this.I(128));return this};$.g.Fn=function(){var a,b=this.scale(),c=$.Jt(b),d=b.sj();for(a=0;a<c.length;a++){var e=b.Fn(void 0,void 0,c[a].unit,c[a].count,d);if(10>=e.length){4>e.length&&0<a&&(b.Fn(void 0,void 0,c[a-1].unit,c[a-1].count,d),a--);break}}a==c.length&&a--;e=c[a].unit;a=c[a].count;this.P={unit:e,count:a};d.min+=this.o;d.max+=this.o;return e=b.Fn(void 0,void 0,e,a,d)};$.g.ZT=function(){this.Kf||(this.wl=$.ng().Vo(),this.Kf=$.vk(this.wl));return this.Kf};
$.g.vi=function(){var a=this.Fn(),b=this.scale(),c=this.ja(),d=this.g("height"),e=b.uj(),f=this.labels(),h=this.P.unit,k=b.Tj();k&&(a.length=1);$.vl.measure();$.gz(this.b);for(var l=0;l<a.length;l++){var m=this.ye[l];m.text(F);m.style(f.flatten());m.Hj();l<a.length-1&&$.Ux(this.ye[l+1]);var p=a[l];if(p.start<e.min)$.Sx(m,null);else{switch(h){case "minute":var q="hour";break;case "hour":q="day";break;case "day":q="month";break;default:q="year"}k&&(h="day",q="year");F=$.xs($.vs(h,q,"timeline"));q=c.left+
c.width*b.transform(p.start);for(var r=k?c.left+c.width:c.left+c.width*b.transform(p.end),t=this.labels().padding().Ng(r-q),u,v=!1,w=window.Infinity,x="yyyy/MM/dd'T'HH:mm:ss.SSS",y=0;y<F.length;y++){var C=F[y],G=this.b.pA;if(C in G){G=Math.ceil(G[C].width);if(G<=t){u=C;v=!0;break}G<=w&&(w=G,x=C)}}v||(u=x);t={autoFormat:{value:u,type:"string"},value:{value:$.ys(p.start,u),type:"string"},tickValue:{value:p.start,type:"number"}};t=$.rv(this.i,t);var F=this.labels().sk(t);m.text(F);m.style(f.flatten());
$.Px(m);m.Hj();t=b.transform(p.start);b.transform(Math.min(p.end,e.max+this.o));0!=d?$.Sx(m,this.wl):$.Sx(m,null);p=this.labels().padding();v=$.R(c.left+c.width*t,1);w=Math.floor(this.G-d/2);x=d;t=r-q;q=p.Dj(new $.I(v,w,t,x));$.Zx(m,q,this.Oa.Ja());$.Tx(m)}}for(l=a.length;l<this.ye.length;l++)$.Sx(this.ye[l],null)};$.g.zc=function(){if(this.pf())return!1;if(!this.enabled())return this.J(1)&&(this.remove(),this.I(1),this.B(450)),!1;this.I(1);return!0};$.g.remove=function(){this.Oa&&this.Oa.parent(null)};
$.g.Rw=function(){var a=this.Fn();if(!this.ye.length)for(var b=0;b<a.length;b++){var c=new $.Lx;this.ye.push(c)}if(this.ye.length<a.length)for(b=this.ye.length;b<a.length;b++)this.ye.push(new $.Lx);return this.ye};$.g.R=function(){$.rd(this.mb,this.f,this.D,this.zj,this.ye);this.zj=this.D=this.f=this.mb=null;this.ye.length=0;i4.u.R.call(this)};var x4=i4.prototype;x4.ticks=x4.Xa;x4.labels=x4.labels;j4.prototype.b=function(a,b){var c=a.dj-b.dj;return 0==c?(c=a.Lj-b.Lj,0==c?-1:c):a.dj-b.dj};j4.prototype.f=function(a,b){return 0==a.sg-b.sg?a.mg-b.mg:a.sg-b.sg};
j4.prototype.add=function(a,b){var c=a.mg-a.sg;a.sg=0;a.mg=c;$.Ua(this.jd,a,this.b);var d=[],e=[],f=!0,h;for(h=0;h<this.jd.length;h++){var k=this.jd[h];if(k!=a){if(k.Lj>a.dj&&f||k.dj<a.Lj&&!f)d.push(k),$.Ua(e,k,this.f)}else f=!1}for(h=0;h<e.length;h++)if(k=e[h],a.sg<=k.mg&&a.sg>=k.sg||a.mg<=k.mg&&a.mg>=k.sg||k.sg<=a.mg&&k.sg>=a.sg||k.mg<=a.mg&&k.mg>=a.sg)b?a.mg=k.mg+c:(a.sg=k.mg,a.mg=a.sg+c)};$.H(k4,$.V);k4.prototype.ra=$.V.prototype.ra|1;var jqa={};$.wq(jqa,[$.Z.Xn,$.Z.dK]);$.U(k4,jqa);$.H(l4,$.LA);$.XG[34]=l4;l4.prototype.type=34;l4.prototype.flags=521;l4.prototype.ug=function(a,b){var c=this.bd,d=a.get(this.X.Be()[0]);d=this.nh(d,this.prevValue);var e={};e[d.stroke]=!0;a.j("names",d);c=c.ed(b,e)[d.stroke];d=a.j("x");e=a.j("zero");var f=a.j("minLength"),h=$.jp(c.stroke()),k=a.j("axisHeight"),l="up"==(a.get("direction")||a.j("direction"));e+=l?-k/2:k/2;d=$.R(d,h);$.JA(c,this.xa,d,e);$.KA(c,this.xa,d,l?e-f:e+f)};$.H(m4,$.xB);m4.prototype.sa=$.xB.prototype.sa;var y4={};$.wq(y4,[$.Z.$Y]);$.U(m4,y4);$.g=m4.prototype;$.g.ly=function(){return 0};$.g.VN=function(){return!1};$.g.PD=function(a){a=$.Xk(a.Eh());var b=this.ya.Ra().sj();return a>=b.min||a<=b.max?!0:!1};$.g.gh=function(){return!1};$.g.cX=$.ia;
$.g.UT=function(a,b,c){var d=this.data();d.$();this.cX(a,b,c);this.B(512);return this.pd={data:a,X:this,XN:0,J2:this.check($.YG)&&(d.hd("normal")||d.hd("hovered")||d.hd("selected")||d.hd("label")||d.hd("hoverLabel")||d.hd("selectLabel")||d.hd("minLabel")||d.hd("hoverMinLabel")||d.hd("selectMinLabel")||d.hd("maxLabel")||d.hd("hoverMaxLabel")||d.hd("selectMaxLabel")),K2:this.check(4194304)&&(d.hd("normal")||d.hd("hovered")||d.hd("selected")||d.hd("marker")||d.hd("hoverMarker")||d.hd("selectMarker")),
L2:this.check(256)&&(d.hd("outliers")||d.hd("normal")||d.hd("hovered")||d.hd("selected")||d.hd("outlierMarker")||d.hd("hoverOutlierMarker")||d.hd("selectOutlierMarker")),PU:!1,M2:!1,I2:!1}};$.g.pI=function(a){var b=this.g("direction");if("auto"==b||"odd-even"==b)b=n4(this);a.j("direction",b);b=this.ja();a.j("zero",b.top+b.height/2)};$.g.WI=function(){this.Uj.push(this.pI)};$.g.F=function(){var a=m4.u.F.call(this);$.Xq(this,y4,a);return a};$.g.U=function(a,b){m4.u.U.call(this,a,b);$.Pq(this,y4,a,b)};$.H(p4,m4);$.g=p4.prototype;$.g.pI=function(a,b,c,d,e){p4.u.pI.call(this,a,b,c,d,e);b=this.ja();c=this.Yf().g("length");a.j("length",$.L(c,b.height));a.j("x",b.left+b.width*e)};$.g.WA=function(a,b,c){var d=this.sl().transform(a.Eh());a.j("xRatio",d);for(var e=0;e<this.Uj.length;e++)this.Uj[e].call(this,a,b,c,0,d)};$.g.Yf=function(a){this.b||(this.b=new k4,this.b.kb(this),$.K(this.b,this.NC,this),$.W(this,"connector",this.b));return $.n(a)?(this.b.N(a),this):this.b};$.g.NC=function(){this.B(2048,1)};
$.g.cX=function(a,b,c){for(var d=this.data().$();d.advance();){var e=c(d.get("x")),f={},h={};f.x=e;h.rawIndex=d.ma();b(a,{data:f,j:h})}};$.g.Jp=function(){var a=this.$(),b=a.j("minLength"),c=this.ja();c=c.top+c.height/2;var d="up"==(a.get("direction")||o4(this));a=a.j("axisHeight")/2;return d?c-b-a:c+b+a};$.g.yE=function(){return"up"==(this.$().get("direction")||o4(this))?"center-bottom":"center-top"};
$.g.wm=function(a,b){var c=p4.u.wm.call(this,a,b);c.date={value:$.ts(b.get("x")),type:"date-time"};return c};$.g.R=function(){this.b&&($.or(this.b,this.NC,this),$.rd(this.b),this.b=null);p4.u.R.call(this)};$.H(q4,$.LA);$.XG[35]=q4;q4.prototype.type=35;q4.prototype.flags=1537;
q4.prototype.ug=function(a,b){var c=this.bd,d=a.get(this.X.Be()[0]);d=this.nh(d,this.prevValue);var e={};e[d.path]=!0;a.j("names",d);c=c.ed(b,e)[d.path];d=a.j("startX");e=a.j("endX");var f=a.j("zero"),h=a.j("axisHeight");a.j("stackLevel");var k=a.get("direction")||a.j("direction"),l=a.j("startY"),m=a.j("endY");"up"==k?(f-=h/2,h=f-l-m):(f+=h/2,h=f+l+m);k=$.jp(c.stroke());d=$.R(d,k);e=$.R(e,k);c.moveTo(d,f).lineTo(d,h).lineTo(e,h).lineTo(e,f).close()};$.H(r4,m4);var kqa={};$.wq(kqa,[$.Z.cK]);$.U(r4,kqa);$.g=r4.prototype;$.g.WA=function(a,b,c){var d=this.sl(),e=d.transform(a.get("start"));d=d.transform(a.get("end"));a.j("startXRatio",e);a.j("endXRatio",d);for(e=0;e<this.Uj.length;e++)this.Uj[e].call(this,a,b,c,0)};
$.g.pI=function(a,b,c,d,e){r4.u.pI.call(this,a,b,c,d,e);b=this.ja();c=a.j("startXRatio");c=b.left+b.width*c;d=a.j("endXRatio");if(!$.ea(d)||(0,window.isNaN)(d))d=this.sl(),e=d.uj().max,d=d.transform(e);d=b.left+b.width*d;a.j("startX",c);a.j("endX",d);b=$.L(this.g("height"),b.height);a.j("height",b)};$.g.cX=function(a,b,c){for(var d=this.data().$();d.advance();){var e=c(d.get("start")),f=c(d.get("end")),h={},k={};h.start=e;h.end=f;k.rawIndex=d.ma();b(a,{data:h,j:k})}};
$.g.ai=function(){var a=this.$(),b=a.j("height");var c=a.j("zero");var d=a.j("axisHeight");var e=a.j("startX");var f=a.j("endY");a="up"==(a.get("direction")||o4(this));d/=2;b=f-b/2;c=c+(a?-d:d)+(a?-b:b);a=this.ya.ec.clone().left+this.ya.wj;a>e&&(e=a);return{value:{x:e||0,y:c||0}}};$.g.wm=function(a,b){var c=r4.u.wm.call(this,a,b);c.start={value:$.ts(b.get("start")),type:"date-time"};c.end={value:$.ts(b.get("end")),type:"date-time"};return c};
$.g.K_=function(a,b){var c=this.bg();c.select(b);var d=c.j("startX"),e=this.ya.ec.clone().left+this.ya.wj;e>d&&(d=e);e=c.j("endX");c=c.j("height");a.width(e-d);a.height(c)};$.H(s4,$.Oz);var z4={},lqa=$.YG|1572864;z4.moment={Fb:34,Kb:2,Lb:[$.wH],Ob:null,Jb:null,Cb:lqa|4194304,zb:"zero"};z4.range={Fb:35,Kb:2,Lb:[$.ZH],Ob:null,Jb:null,Cb:lqa,zb:"zero"};s4.prototype.fj=z4;$.Pz(s4,s4.prototype.fj);s4.prototype.sa=$.Oz.prototype.sa|543227904;s4.prototype.ra=$.Ex.prototype.ra;$.Lz(s4,"timelinechart",["scroll"]);$.g=s4.prototype;
$.g.gn=function(a,b){var c=$.N(a);if((0,window.isNaN)(c)){c=0;var d=a}else c=a,d=b;var e=this.rg[c];if(!e){e=new $.eA;$.n(!0)&&(e.i=!0);var f=$.xr($.wr(this),"defaultRangeMarkerSettings");e.Ga(f);e.pa=this;$.fA(e,"vertical");this.rg[c]=e;e.kb(this);$.K(e,this.IK,this);$.od(e,this.KN,this);this.B(4194304,1)}return $.n(d)?(e.N(d),this):e};
$.g.mn=function(a,b){var c=$.N(a);if((0,window.isNaN)(c)){c=0;var d=a}else c=a,d=b;var e=this.tg[c];if(!e){e=new $.hA;var f=e;$.n(!0)&&(f.G=!0);f=$.xr($.wr(this),"defaultTextMarkerSettings");e.Ga(f);e.pa=this;$.bz(e,"vertical");this.tg[c]=e;e.kb(this);$.K(e,this.IK,this);$.od(e,this.KN,this);this.B(4194304,1)}return $.n(d)?(e.N(d),this):e};
$.g.Ym=function(a,b){var c=$.N(a);if((0,window.isNaN)(c)){c=0;var d=a}else c=a,d=b;var e=this.og[c];if(!e){e=new $.bA;$.n(!0)&&(e.i=!0);var f=$.xr($.wr(this),"defaultLineMarkerSettings");e.Ga(f);e.pa=this;$.cA(e,"vertical");this.og[c]=e;e.kb(this);$.K(e,this.IK,this);$.od(e,this.KN,this);this.B(4194304,1)}return $.n(d)?(e.N(d),this):e};$.g.IK=function(a){var b=4194304;$.X(a,4)&&(b|=65536);this.B(b,1)};$.g.KN=function(){this.B(65536,1)};
$.g.E6=function(a){if(!this.o){this.o=new $.bA;$.n(!0)&&(this.o.i=!0);var b=$.xr($.wr(this),"defaultLineMarkerSettings");this.o.Ga(b);$.W(this,"todayMarker",this.o);this.o.pa=this;$.cA(this.o,"vertical");this.o.kb(this);$.K(this.o,this.IK,this);$.od(this.o,this.KN,this);b=new Date;this.o.value(Date.UTC(b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDay()));this.B(4259840,1)}return $.n(a)?(this.o.N(a),this):this.o};
$.g.Ph=function(a){if(!this.pf()){this.G||(this.G=this.Oa.Bd(),this.G.zIndex(1),this.wc.Ce(this,"chartdraw",this.Nga));this.K||(this.K=this.Oa.Bd(),this.K.zIndex(.5));this.ba||(this.ba=this.Oa.Bd(),this.ba.zIndex(1));this.J(4)&&(this.ec=a.clone(),this.B(543195136),$.rr(this,"timelinechart","scroll"),this.I(4));this.Re=[];this.Ub=[];this.sb=[];var b=v4(this);if(0==this.tj())dqa(this),this.fb.length=0,this.ea.length=0;else if(this.J(98304)){this.fb=[];this.ea=[];for(var c=window.Infinity,d=-window.Infinity,
e=0,f=0,h=["up","down"],k=0;k<this.hb.length;k++){var l=this.hb[k],m=l.kk();switch(l.g("direction")){case "odd-even":"range"==m?(n4(l,h[e&1]),e++):"moment"==m&&(n4(l,h[f&1]),f++);break;case "auto":"range"==m?n4(l,"up"):"moment"==m&&n4(l,"up")}switch(m){case "moment":this.fb.push(l);break;case "range":this.ea.push(l)}var p=$.yB(l,!1,!0),q=l,r=window.Infinity,t=-window.Infinity,u=q.Ec(),v=q.kk();if("moment"==v)for(;u.advance();){var w=$.Xk(u.get("x"));r=Math.min(r,w);t=Math.max(t,w)}else if("range"==
v)for(;u.advance();){var x=$.Xk(u.get("start")),y=$.Xk(u.get("end"));(0,window.isNaN)(x)||((0,window.isNaN)(y)||(r=Math.min(r,y),t=Math.max(t,y)),r=Math.min(r,x),t=Math.max(t,x))}var C=r;var G=t;c=Math.min(c,C);d=Math.max(d,G);this.Re.push(p);"range"==m?this.Ub.push(p):this.sb.push(p)}var F=c;var M=d;var O=F;var Q=M;if(-window.Infinity===Q&&window.Infinity===O)dqa(this);else{u4(this.og);u4(this.rg);u4(this.tg);this.o&&this.o.md&&(this.o=void 0);for(var S=$.Ga(this.og,this.rg,this.tg,[this.o]),wa=
[],sa=0;sa<S.length;sa++){var Qa=S[sa];if(Qa&&Qa.enabled()&&"consider"==Qa.g("scaleRangeMode"))for(var wb=Qa.ws(),oc=0;oc<wb.length;oc++)wa.push($.ts(wb[oc]).getTime())}var hb=Math.min.apply(null,wa),Rb=Math.max.apply(null,wa);O=Math.min(O,hb);Q=Math.max(Q,Rb);if(O==Q){var Kb=$.xp("day",1);O-=Kb/2;Q+=Kb/2}if(this.Ka!=O||this.Ia!=Q)this.Ka=O,this.Ia=Q,$.wt(this.scale(),this.Ka,this.Ia),this.eb.JI?(this.eb.kj.apply(this.eb,this.eb.GI),this.eb.JI=!1,this.eb.GI=null):(this.scale().ka(),this.scale().Qm(),
this.scale().da(!1));for(var Sb=this.Re,xe,Tb,pc,Eb,sd,rf=[],Nd=[],lc=[],zg=[],gf=[],$h=[],kh=[],$i=0;$i<Sb.length;$i++){sd=Sb[$i];Eb=sd.X;var Gd=Eb.kk();if("range"==Gd){for(var Od,Jc,mc,Dd=sd,Ag=Dd.X,wc=Dd.data,gg=[],Le=[],zh=[],Pd=v4(this),Qd=this.scale().uj().max,ye=Ag.Ec(),Lf=0;Lf<wc.length;Lf++){ye.select(Lf);var Ik=wc[Lf],um=ye.get("start"),td=ye.get("name")||ye.get("x");if(null==um||(0,window.isNaN)(um)||null==td)ye.j("missing",!0);else{mc=this.scale().transform(Ik.data.start)*this.ec.width;
Jc=(0,window.isNaN)(Ik.data.end)?this.scale().transform(Qd)*this.ec.width:this.scale().transform(Ik.data.end)*this.ec.width;Od=$.L(Ag.g("height"),this.ec.height);var bj=ye.get("direction")||o4(Ag),zi={dj:mc,Lj:Jc,sg:0,mg:Od,direction:bj,X:Ag,TI:Lf,pd:Dd};gg.push(zi);"up"==bj?Le.push(zi):zh.push(zi);Ik.j.axisHeight=Pd}}xe=gg;Tb=Le;pc=zh;rf=$.Ga(rf,xe);Nd=$.Ga(Nd,xe);lc=$.Ga(lc,Tb);zg=$.Ga(zg,pc)}else if("moment"==Gd){var Qg=sd,cj=Qg.X,Me=Qg.data,lh=[],Oj=[],mh=[],Ai=v4(this),Mf=cj.labels();$.$u(Mf);
for(var Hn=cj.Db(),Jk=Hn.enabled()?Hn.g("size"):0,dj=cj.$(),nh=0;nh<Me.length;nh++)if(dj.select(nh),null!=dj.get("value")&&null!=dj.get("x")){var Bi=Mf.be(nh),Pj=$.vB(cj,new $.Iw);null===Bi?Bi=Mf.add(Pj,{value:{x:0,y:0}},nh):Bi.Gf(Pj);Bi.b=null;var Kk=Mf.measure(Bi),Ah=Mf.g("offsetX")||0,ej=Me[nh];var Rg=this.scale().transform(ej.data.x)*this.ec.width-Jk;var jf=Rg+Kk.width+Ah+Jk;var fj=50-Kk.height/2;var bi=50+Kk.height/2;var wf=dj.get("direction")||o4(cj),$d={dj:Rg,Lj:jf,sg:fj,mg:bi,direction:wf,
X:cj,TI:nh,pd:Qg};lh.push($d);"up"==wf?Oj.push($d):mh.push($d);ej.j.axisHeight=Ai}else dj.j("missing",!0);xe=lh;Tb=Oj;pc=mh;rf=$.Ga(rf,xe);gf=$.Ga(gf,xe);$h=$.Ga($h,Tb);kh=$.Ga(kh,pc)}}var Rd=lc;var ud=zg;var Sg=$h;var Nf=kh;$.Pa(Rd,eqa);$.Pa(ud,eqa);$.Pa(Sg,fqa);$.Pa(Nf,fqa);var Dl=this.scale().uj();this.f={dj:window.Infinity,Lj:-window.Infinity,sg:window.Infinity,mg:-window.Infinity};this.f.dj=Math.min(this.f.dj,this.scale().transform(Dl.min)*this.ec.width);this.f.Lj=Math.max(this.f.Lj,this.scale().transform(Dl.max)*
this.ec.width);var Ub,ze,ci=[],Ci=new j4;for(ze=0;ze<Rd.length;ze++){(Ub=Rd[ze])&&-1==ci.indexOf(Ub.X)&&(Ub.X.zIndex(34-ci.length/100),ci.push(Ub.X));var Sd=Ub.TI;var ae=Ub.pd.data[Sd];Ci.add(Ub,!0);w4(this,Ub);ae.j.startY=Ub.sg;ae.j.endY=Ub.mg;ae.j.stateZIndex=1-Ub.mg/1E6}for(ze=Sg.length-1;0<=ze;ze--)Ub=Sg[ze],Sd=Ub.TI,Ci.add(Ub),w4(this,Ub),ae=Ub.pd.data[Sd],ae.j.minLength=Ub.sg+(Ub.mg-Ub.sg)/2;var gj=new j4;ci=[];for(ze=0;ze<ud.length;ze++)(Ub=ud[ze])&&-1==ci.indexOf(Ub.X)&&(Ub.X.zIndex(34-ci.length/
100),ci.push(Ub.X)),Sd=Ub.TI,ae=Ub.pd.data[Sd],gj.add(Ub,!0),ae.j.startY=Ub.sg,ae.j.endY=Ub.mg,ae.j.stateZIndex=1-Ub.mg/1E6,w4(this,{dj:Ub.dj,Lj:Ub.Lj,sg:-Ub.mg,mg:-Ub.sg});for(ze=Nf.length-1;0<=ze;ze--)Ub=Nf[ze],Sd=Ub.TI,gj.add(Ub),ae=Ub.pd.data[Sd],ae.j.minLength=Ub.sg+(Ub.mg-Ub.sg)/2,w4(this,{dj:Ub.dj,Lj:Ub.Lj,sg:-Ub.mg,mg:-Ub.sg});var Di=b/2;this.f.sg-=Di;this.f.mg+=Di;var Eg=$.Ar(this,"scroller"),di=0,Fg=0;if(Eg&&Eg.enabled()){var xf=Eg.g("orientation");var hj=Eg.g("height");switch(xf){case "top":di=
hj;break;case "bottom":Fg=hj}}var El=this.ec.height/2,hv=El-Math.abs(this.f.sg)-Fg,vm=this.f.mg-El-di;if(this.f.mg-this.f.sg<=this.ec.height){var Js=Sg.length+Rd.length,Lq=Nf.length+ud.length;Js&&!Lq?t4(this,hv,hv):!Js&&Lq?t4(this,vm,vm):Js&&Lq&&t4(this,0,0)}else t4(this,hv,vm)}}var In=$.Ar(this,"scroller"),wm=$.Ar(this,"axis");this.J(536870912)&&(In&&(In.O(this.Oa),In.ja(this.ec),In.W()),this.I(536870912));if($.vr(this,"timelinechart","scroll")){var xm=this.G.jp(),cy=this.P,Qj=cy.AC,aC=cy.EE,oh=
Qj*(this.ec.height-this.axis().height());.5==Math.abs(Qj)&&(oh+=aC);this.D=oh;this.f&&this.wj+this.ec.cb()>this.f.Lj+this.ec.left?this.wj=this.f.Lj-this.ec.cb()+this.ec.left:this.f&&this.wj+this.ec.tb()<this.f.dj+this.ec.left&&(this.wj=this.f.dj-this.ec.tb()+this.ec.left);this.D=$.Za(this.D,this.$a,this.Za);xm[4]=-this.wj;xm[5]=this.D;this.G.oc.apply(this.G,xm);var Ae=this.ec.clone();Ae.left+=this.wj;Ae.top-=this.D;this.G.clip(Ae);xm[5]=0;this.K.oc.apply(this.K,xm);Ae.top=this.ec.top;this.K.clip(Ae);
var iv=this.D,Mq=0;wm&&(Mq=wm.g("height")/2);var Jn=0,jv=0;if(In&&In.enabled()){var Nq=In.g("height");var bC=In.g("orientation");"top"==bC?Jn=Nq:"bottom"==bC&&(jv=Nq)}Ae=this.ec.clone();Ae.left+=this.wj;this.D>this.ec.height/2-Mq-jv?iv=this.ec.height/2-Mq-jv:this.D<-(this.ec.height/2)+Mq+Jn&&(iv=-(this.ec.height/2)+Mq+Jn);xm[5]=iv;this.ba.oc.apply(this.ba,xm);this.ba.clip(Ae);for(var ij=0;ij<this.ea.length;ij++){var Fl=this.ea[ij];Fl.B(256);Fl.ja(this.ec);Fl.O(this.G);Fl.W()}$.tr(this,"timelinechart",
"scroll")}this.J(65536)&&(this.B(6324224),this.I(65536));if(this.J(32768)){for(ij=0;ij<this.hb.length;ij++)Fl=this.hb[ij],Fl.ja(this.ec),Fl.O(this.G),Fl.W();this.I(32768)}this.J(2097152)&&(wm&&(wm.ja(this.ec),wm.O(this.ba),wm.W()),this.I(2097152));if(this.J(4194304)){var nG=$.Ga(this.og,this.rg,this.tg,[this.o]);for(ij=0;ij<nG.length;ij++){var Kn=nG[ij];Kn&&(Kn.B(4),Kn.ka(),Kn.scale()||Kn.RK(this.eb),Kn.ja(this.ec),Kn.O(this.K),Kn.W(),Kn.da(!1))}this.I(4194304)}}};
$.g.F_=function(a){var b=this.scale().sj(),c=this.scale().uj(),d=a.deltaY;$.XC&&(d*=15);if(!a.shiftKey&&this.gd().g("zoomOnMouseWheel")){a.preventDefault();var e=0>a.deltaY;if(b.min<=c.min&&b.max>=c.max&&!e)return;b=a.clientX;this.scale().Lc((b+this.wj)/this.ec.width);this.scale().Lc(this.wj/this.ec.width);this.scale().Lc((this.wj+this.ec.width)/this.ec.width);this.ka();c=$.ak(this.O().Ja());b=(b-this.ec.left-c.x)/this.ec.width;e?this.Ur(1.2,b):this.Vr(1.2,b);this.da(!0)}this.gd().g("scrollOnMouseWheel")&&
(a.preventDefault(),this.move(0,d))};$.g.move=function(a,b){this.moveTo(this.wj+a,this.D-b)};
$.g.moveTo=function(a,b){var c=this.scale().sj(),d=this.scale().uj(),e=a-this.wj,f=b-this.D;if(this.G){this.wj=a;this.D=b;0!=e&&(this.wj+this.ec.cb()>this.f.Lj+this.ec.left?this.wj=this.f.Lj-this.ec.cb()+this.ec.left:this.wj+this.ec.tb()<this.f.dj+this.ec.left&&(this.wj=this.f.dj-this.ec.tb()+this.ec.left));0!=f&&(this.D=$.Za(b,this.$a,this.Za));e=this.ec.height-v4(this);f=this.D/e;var h=$.Za(f,-.5,.5);this.P.AC=h;this.P.EE=(f-h)*e;e=this.scale().Lc(this.wj/this.ec.width);f=this.scale().Lc((this.wj+
this.ec.width)/this.ec.width);c=e-c.min;h=d.max-d.min;$.IB(this.G_(),(e-d.min)/h,(f-d.min)/h);this.ka();this.B(2097152);this.axis().offset(c);$.rr(this,"timelinechart","scroll",1);this.da(!0)}};$.g.Nga=function(){this.aa||(this.aa=new $.Hx(this.O().Ja().Rl(),!1),this.aa.va("mousewheel",this.F_,!1,this));this.Oa.va("mousedown",this.Y3,!0,this)};
$.g.Y3=function(a){var b=this.ec,c=$.Ar(this,"scroller");c&&c.enabled()&&(b=c.yd());c=$.ak(this.O().Ja());b&&a.clientX>=b.left+c.x&&a.clientX<=b.left+c.x+b.width&&a.clientY>=b.top+c.y&&a.clientY<=b.top+c.y+b.height&&(this.na=a.clientX,this.Ca=a.clientY,this.Oa.va("mousemove",this.aB,!0,this),$.Ld($.Pp,"mouseup",this.bB,!0,this))};$.g.aB=function(a){this.move(this.na-a.clientX,this.Ca-a.clientY);this.na=a.clientX;this.Ca=a.clientY};
$.g.bB=function(){this.Oa.fc("mousemove",this.aB,!0,this);$.Zd(window.document,"mouseup",this.bB,!0,this)};$.g.axis=function(a){this.b||(this.b=new i4,$.K(this.b,this.E_,this),$.wl(this.b),$.W(this,"axis",this.b));return $.n(a)?(this.b.N(a),this):this.b};$.g.Ra=function(){return this.scale()};$.g.E_=function(a){var b=2097152;$.X(a,32772)&&(b|=32772);this.B(b,1)};$.g.scale=function(a){return $.n(a)?(this.eb.N(a),this):this.eb};
$.g.hi=function(a){$.X(a,4)&&(a=this.scale(),a.uj(),a.sj(),this.moveTo(0,this.D),this.B(2162688,1))};$.g.Ft=function(a,b){return"moment"==a?new p4(this,this,a,b,!0):new r4(this,this,a,b,!0)};$.g.vy=function(){return null};$.g.ty=function(){return null};$.g.bb=function(){this.Fc||(this.Fc=new $.Ot);return this.Fc};$.g.xa=function(){return!1};
$.g.kj=function(a,b){this.ka();var c=$.Xk(a),d=$.Xk(b);this.scale().kj(c,d);var e=$.Ar(this,"scroller");if(e){var f=this.scale().uj(),h=f.max-f.min;$.IB(e,(c-f.min)/h,(d-f.min)/h)}this.da(!0);return this};$.g.Qm=function(){this.ka();this.scroll(0);this.scale().Qm();this.B(65536,1);this.da(!0);return this};$.g.scroll=function(a){return $.n(a)&&(a=+a,this.D!=a)?(this.moveTo(this.wj,a),this):this.D};
$.g.DY=function(a){if($.n(a)){var b=$.n(a.AC)?$.Za(a.AC,-.5,.5):0;a=$.n(a.EE)&&.5==Math.abs(b)?a.EE:0;if(this.P.AC!==b||this.P.EE!==a)this.P={AC:b,EE:a},$.rr(this,"timelinechart","scroll");return this}return this.P};$.g.Ma=function(){return"timeline"};
$.g.G_=function(a){this.i||(this.i=new $.TB,this.i.kb(this),$.K(this.i,this.Pca,this),this.wc.va(this.i,"scrollerchange",this.H_),this.wc.va(this.i,"scrollerchangefinish",this.H_),$.W(this,"scroller",this.i),this.B(536870916,1));return $.n(a)?(this.i.N(a),this):this.i};$.g.Pca=function(a){var b=536870912,c=1;$.X(a,8)&&(b|=4,c|=8);this.B(b,c)};$.g.H_=function(a){var b=this.scale().uj(),c=b.max-b.min;this.kj(b.min+a.startRatio*c,b.min+a.endRatio*c)};$.g.Dh=function(){return this};
$.g.Ur=function(a,b){var c=this.scale(),d=c.sj(),e=$.n(b)?b:.5,f=c.uj().max-c.uj().min,h=c.Lc(this.wj/this.ec.width);d={min:h,max:h+(d.max-d.min)};h=d.max-d.min;if(2E-4>h/f)return this;h=Math.round(h*((a?1/a:.625)-1));f=d.min-h*e;h=d.max+h*(1-e);6E4>=Math.abs(f-h)&&(d=(d.min+d.max)/2,f=d-6E4*e,h=d+6E4*(1-e));c.kj(f,h);return this};
$.g.Vr=function(a,b){a=a||1.6;var c=this.scale(),d=c.sj(),e=$.n(b)?b:.5,f=c.Lc(this.wj/this.ec.width);d={min:f,max:f+(d.max-d.min)};f=Math.round((d.max-d.min)*(a-1));c.kj(d.min-f*e,d.max+f*(1-e));return this};
$.g.U=function(a,b){s4.u.U.call(this,a,b);a.scale&&(this.scale(a.scale),this.Ka=a.scale.dataMinimum,this.Ia=a.scale.dataMaximum);a.axis&&this.axis(a.axis);this.DY(a.verticalRelativeOffset);this.Kg(a.lineAxesMarkers,this.Ym);this.Kg(a.textAxesMarkers,this.mn);this.Kg(a.rangeAxesMarkers,this.gn);a.todayMarker&&this.E6(a.todayMarker);this.eP(a)};$.g.eP=function(a){var b=a.series;if($.A(b))for(var c=0;c<b.length;c++){a=b[c];var d=a.seriesType||this.g("defaultSeriesType");(d=this.Ae(d,a))&&d.N(a)}};
$.g.Kg=function(a,b){for(var c=0;c<a.length;c++)b.call(this,c).N(a[c])};
$.g.F=function(){var a=s4.u.F.call(this);a.scale=this.scale().F();a.axis=this.axis().F();var b;a.lineAxesMarkers=[];for(b=0;b<this.og.length;b++)a.lineAxesMarkers.push(this.og[b].F());a.textAxesMarkers=[];for(b=0;b<this.tg.length;b++)a.textAxesMarkers.push(this.tg[b].F());a.rangeAxesMarkers=[];for(b=0;b<this.rg.length;b++)a.rangeAxesMarkers.push(this.rg[b].F());$.n(this.o)&&(a.todayMarker=this.o.F());this.ZO(a);a.type=this.Ma();a.verticalRelativeOffset=this.DY();return{chart:a}};
$.g.ZO=function(a){var b,c=[];for(b=0;b<this.hb.length;b++){var d=this.hb[b].F();c.push(d)}c.length&&(a.series=c)};$.g.efa=function(){var a=this.k2();this.scale().Ir(a.min,a.max);return this};$.g.k2=function(){var a=this.scale(),b=a.sj();a=a.Lc(this.wj/this.ec.width);return{min:a,max:a+(b.max-b.min)}};
$.g.R=function(){$.or(this.eb,this.hi,this);$.or(this.b,this.E_,this);this.Oa.fc("mousedown",this.Y3,!0,this);this.Oa.fc("mousemove",this.aB,!0,this);$.Zd($.Pp,"mouseup",this.bB,!0,this);this.aa.fc("mousewheel",this.F_,!1,this);$.rd(this.b,this.eb,this.Fc,this.og,this.tg,this.rg,this.G,this.o,this.K);this.Fc=this.eb=this.b=null;this.og.length=0;this.tg.length=0;this.rg.length=0;this.K=this.G=this.o=null;s4.u.R.call(this)};var A4=s4.prototype;A4.axis=A4.axis;A4.scale=A4.scale;A4.fitAll=A4.Qm;
A4.fit=A4.Qm;A4.zoomTo=A4.kj;A4.getType=A4.Ma;A4.getCurrentScene=A4.Dh;A4.zoomIn=A4.Ur;A4.zoomOut=A4.Vr;A4.getSeries=A4.ef;A4.addSeries=A4.jl;A4.getSeriesAt=A4.zi;A4.getSeriesCount=A4.tj;A4.removeSeries=A4.yo;A4.removeSeriesAt=A4.Rn;A4.removeAllSeries=A4.Dp;A4.scroll=A4.scroll;A4.lineMarker=A4.Ym;A4.textMarker=A4.mn;A4.rangeMarker=A4.gn;A4.todayMarker=A4.E6;A4.scroller=A4.G_;A4.forceScaleUpdate=A4.efa;A4.getVisibleRange=A4.k2;A4.verticalRelativeOffset=A4.DY;$.Xp.timeline=gqa;$.E("anychart.timeline",gqa);}).call(this,$)}
