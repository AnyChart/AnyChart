if(!_.cartesian_3d){_.cartesian_3d=1;(function($){var O9=function(a,b,c){if(a=a.f[b])a.zIndex=c},Tta=function(a){return $.oa(a.sl())+"_"+$.oa(a.bb())},Uta=function(a,b){var c=0;(0,$.Re)(a,function(a,e,f){b.call(void 0,a,e,f)&&++c},void 0);return c},P9=function(){$.kz.call(this)},Q9=function(){$.kz.call(this)},R9=function(){$.cA.call(this)},S9=function(){$.fA.call(this)},T9=function(){$.iA.call(this)},U9=function(a){$.MA.call(this,a)},V9=function(a){$.MA.call(this,a)},Vta=function(a,b,c){if(!b.o("skipDrawing")){var d=b.o("x"),e=b.o("zero"),f=b.o("value");
a.xa||(d+=a.f,e-=a.b,f-=a.b);b=c.bottom;var h=c.back,k=c.left,l=c.right,m=c.front,p=c.top,q=c.rightHatch,r=c.frontHatch;c=c.topHatch;var t=a.i,u=a.D,v=m.stroke().thickness%2/2||0;if(a.xa){var w=a.j;var x=Math.min(e,f)+a.f;d=d-w/2-a.b;a=Math.abs(e-f);e=v;f=0}else a=a.j,x=d-a/2,d=Math.min(e,f),w=Math.abs(e-f),f=e=-v;b.moveTo(x+v,d+w).lineTo(x+a,d+w).lineTo(x+a+t-v,d+w-u+v).lineTo(x+t,d+w-u).close();h.moveTo(x+t,d-u).lineTo(x+t+a,d-u).lineTo(x+t+a,d-u+w).lineTo(x+t,d-u+w).close();k.moveTo(x,d).lineTo(x+
t+e,d-u+v).lineTo(x+t,d+w-u).lineTo(x,d+w-v).close();l.moveTo(x+a,d).lineTo(x+a+t+f,d-u+v).lineTo(x+a+t,d+w-u).lineTo(x+a,d+w-v).close();q.moveTo(x+a,d).lineTo(x+a+t+f,d-u+v).lineTo(x+a+t,d+w-u).lineTo(x+a,d+w-v).close();m.moveTo(x,d).lineTo(x+a,d).lineTo(x+a,d+w).lineTo(x,d+w).close();r.moveTo(x,d).lineTo(x+a,d).lineTo(x+a,d+w).lineTo(x,d+w).close();p.moveTo(x+v,d).lineTo(x+a,d).lineTo(x+a+t-v,d-u+v).lineTo(x+t,d-u).close();c.moveTo(x+v,d).lineTo(x+a,d).lineTo(x+a+t-v,d-u+v).lineTo(x+t,d-u).close()}},
W9=function(a){$.MA.call(this,a)},X9=function(){$.UB.call(this);this.Ga("cartesian","cartesian3dBase","cartesian3d");this.K=0;this.re="cartesian-3d"},Y9=function(a){var b=$.xo(a.domTarget);if(b&&b.X&&b.X.check(4)){var c=$.xo(a.relatedDomTarget);c&&c.X&&c.X==b.X&&c.index==b.index||(b=b.X)&&!b.md&&b.enabled()&&(c=b.Zi(),b.kb(null),b.oh(a.dE),b.kb(c))}},Wta=function(a,b,c){var d,e,f;var h=$.dm("fill",1,!0)(a,c);c=$.C(h)?h.opacity:1;var k=$.C(h)?h.color:h;h=$.Ml(k);if(null===h)a=k=d=e=f=h="none";else{k=
h.uk;var l=$.Fl(k);e=$.Jl(l,.2);h=$.Jl(l,.25);f=$.Il([255,255,255],l,.1);d=$.Wb($.Il(l,e,.7));f=$.Wb($.Il(e,f,.1));l=$.Wb($.Il(l,e,.1));a={angle:a.g("isVertical")?0:90,opacity:c,keys:[$.Ql(d,.2),$.Ql(k,.3)]};k=$.Ql(l,.2);d=$.Ql(d,.2);e=$.Wb(e);h=$.Wb(h)}b.bottom.fill({color:e,opacity:c});b.back.fill({color:f,opacity:c});b.left.fill({color:h,opacity:c});b.right.fill({color:k,opacity:c});b.top.fill({color:d,opacity:c});b.front.fill(a)},Xta=function(){var a=new X9;a.ta("defaultSeriesType","column");
a.$c();$.EA(a);a.Wg();return a},$9=function(a,b){var c=Z9(a),d=a.i,e=a.mi;!b&&a.g("zDistribution")&&(e=(e-d*(c-1))/c);return e},a$=function(a,b){var c=Z9(a),d=a.j,e=a.Mh;!b&&a.g("zDistribution")&&(e=(e-d*(c-1))/c);return e},Z9=function(a){return Uta(a.hb,function(a){return!!(a&&a.enabled()&&a.check($.rB))})},Yta=function(a,b){for(var c=0,d=0,e=Math.min(a.hb.length-1,b);d<=e;d++){var f=a.hb[d];f&&f.enabled()&&f.check($.rB)&&c++}return c-1},Zta=function(a){var b=new X9;b.Ga("area3d");b.re="area-3d";
b.ta("defaultSeriesType","area");b.$c();b.Wg();$.EA(b);arguments.length&&b.jl.apply(b,arguments);return b},$ta=function(a){var b=new X9;b.Ga("bar","bar3d");b.re="bar-3d";b.ta("defaultSeriesType","bar");b.$c();b.Wg();$.EA(b);arguments.length&&b.jl.apply(b,arguments);return b},aua=function(a){var b=new X9;b.Ga("column","column3d");b.re="column-3d";b.ta("defaultSeriesType","column");b.$c();b.Wg();$.EA(b);arguments.length&&b.jl.apply(b,arguments);return b},bua=function(a){var b=new X9;b.Ga("line3d");
b.re="line-3d";b.ta("defaultSeriesType","line");b.$c();b.Wg();$.EA(b);arguments.length&&b.jl.apply(b,arguments);return b},cua={ZB:"area",fF:"bar",gF:"column",st:"line",gpa:"line-2d"},dua={name:"top",Qb:"path",Yb:null,Zb:"stroke",ac:!0,Ib:!1,zIndex:3E-6},b$={name:"bottom",Qb:"path",Yb:null,Zb:"stroke",ac:!0,Ib:!1,zIndex:2E-6},c$={name:"left",Qb:"path",Yb:null,Zb:"stroke",ac:!0,Ib:!1,zIndex:1E-6},d$={name:"right",Qb:"path",Yb:null,Zb:"stroke",ac:!0,Ib:!1,zIndex:4E-6},e$={name:"back",Qb:"path",Yb:null,
Zb:"stroke",ac:!0,Ib:!1,zIndex:0},f$={name:"frontHatch",Qb:"path",Yb:"hatchFill",Zb:null,ac:!0,Ib:!0,zIndex:8E-6},eua={name:"rightHatch",Qb:"path",Yb:"hatchFill",Zb:null,ac:!0,Ib:!0,zIndex:7E-6},fua={name:"topHatch",Qb:"path",Yb:"hatchFill",Zb:null,ac:!0,Ib:!0,zIndex:6E-6};$.H(P9,$.kz);$.g=P9.prototype;$.g.yg=function(a){var b=0;$.X(a,4)&&(b|=4);$.X(a,2)&&(b|=1);this.B(20,b|8)};
$.g.DG=function(a){var b=this.ja()||$.nn(0,0,0,0);a=Math.round(b.Va()-a*b.height);var c=this.Th().stroke();c=$.ip(c);a=$.R(a,c);c=b.tb()+this.mi;var d=a-this.Mh;this.j.moveTo(b.tb(),a).lineTo(c,d).lineTo(b.cb()+this.mi,d)};$.g.EG=function(a){var b=this.ja()||$.nn(0,0,0,0);a=Math.round(b.tb()+a*b.width);var c=this.Th().stroke();c=$.ip(c);a=$.R(a,c);c=a+this.mi;var d=Math.ceil($.R(b.Va()-this.Mh,1));this.j.moveTo(a,Math.ceil($.R(b.Va(),1))).lineTo(c,d).lineTo(c,b.Vb()-this.Mh)};
$.g.AG=function(a,b,c,d){if(!(0,window.isNaN)(b)){var e=this.ja()||$.nn(0,0,0,0);var f=Math.round(e.Va()-b*e.height);var h=Math.round(e.Va()-a*e.height);1==a?h-=d:h+=d;1==b?f-=d:f+=d;c.moveTo(e.tb(),f).lineTo(e.tb()+this.mi,f-this.Mh).lineTo(e.cb()+this.mi,f-this.Mh).lineTo(e.cb()+this.mi,h-this.Mh).lineTo(e.tb()+this.mi,h-this.Mh).lineTo(e.tb(),h).close()}};
$.g.BG=function(a,b,c,d){if(!(0,window.isNaN)(b)){var e=this.ja()||$.nn(0,0,0,0);var f=Math.round(e.tb()+b*e.width);var h=Math.round(e.tb()+a*e.width);1==a?h+=d:h-=d;1==b?f+=d:f-=d;c.moveTo(f+this.mi,e.Vb()-this.Mh).lineTo(h+this.mi,e.Vb()-this.Mh).lineTo(h+this.mi,e.Va()-this.Mh).lineTo(h,e.Va()).lineTo(f,e.Va()).lineTo(f+this.mi,e.Va()-this.Mh).close()}};$.H(Q9,P9);$.yu(Q9,P9);var g$=P9.prototype;g$.isHorizontal=g$.Nb;g$.scale=g$.scale;g$.axis=g$.axis;g$=Q9.prototype;
$.F("anychart.standalones.grids.linear3d",function(){var a=new Q9;a.N($.om("standalones.linearGrid"));return a});g$.layout=g$.we;g$.draw=g$.W;g$.parentBounds=g$.ja;g$.container=g$.O;$.H(R9,$.cA);
R9.prototype.es=function(){var a=$.Za(this.scale().transform(this.value(),.5),0,1);if(!(0,window.isNaN)(a)){var b=0==$.Oy(this).fl()%2?0:-.5,c=this.ja(),d=this.Qp();$.Oy(this).clear();var e=this.xc().mi,f=this.xc().Mh;if("horizontal"==this.we()){var h=Math.round(c.Vb()+c.height-a*c.height);1==a?h-=b:h+=b;$.Oy(this).moveTo(c.tb(),h).lineTo(c.tb()+e,h-f).lineTo(c.cb()+e,h-f)}else"vertical"==this.we()&&(h=Math.round(c.tb()+a*c.width),1==a?h+=b:h-=b,$.Oy(this).moveTo(h+e,c.Vb()-f).lineTo(h+e,c.Va()-f).lineTo(h,
c.Va()));c.top-=f;c.height+=f;c.width+=e;$.Oy(this).clip(d.Dj(c))}};$.H(S9,$.fA);
S9.prototype.es=function(){var a=this.we(),b=this.g("from"),c=this.g("to");this.g("from")>this.g("to")&&(b=this.g("to"),c=this.g("from"));var d=$.Za(this.scale().transform(b,0),0,1),e=$.Za(this.scale().transform(c,1),0,1);if(!(0,window.isNaN)(d)&&!(0,window.isNaN)(e)){c=this.ja();b=this.Qp();$.Oy(this).clear();var f=this.xc().mi,h=this.xc().Mh;if("horizontal"==a){e=Math.floor(c.Va()-c.height*e);d=Math.ceil(c.Va()-c.height*d);a=c.tb();var k=c.cb();$.Oy(this).moveTo(a,e).lineTo(a+f,e-h).lineTo(k+f,
e-h).lineTo(k+f,d-h).lineTo(a+f,d-h).lineTo(a,d).close()}else"vertical"==a&&(a=c.Va(),k=c.Vb(),d=Math.floor(c.tb()+c.width*d),e=Math.ceil(c.tb()+c.width*e),$.Oy(this).moveTo(d,a).lineTo(d+f,a-h).lineTo(d+f,k-h).lineTo(e+f,k-h).lineTo(e+f,a-h).lineTo(e,a).close());c.top-=h;c.height+=h;c.width+=f;$.Oy(this).clip(b.Dj(c))}};$.H(T9,$.iA);T9.prototype.ja=function(a,b,c,d){b=T9.u.ja.call(this,a,b,c,d);$.n(a)||(a=this.xc().mi,c=this.xc().Mh,b.top-=c,b.height+=c,b.width+=a);return b};$.H(U9,$.MA);$.VG[2]=U9;$.g=U9.prototype;$.g.type=2;$.g.flags=$.rB|49;$.g.Ih={top:"path",bottom:"path",left:"path",right:"path",back:"path",front:"path",cap:"path",frontHatch:"path"};$.g.nK=function(){for(var a=this.X.bg();a.advance();){var b=a.o("shapes");if(b){var c=a.o("zIndex");this.bd.yt(c+1E-8*a.ma(),b)}}};
$.g.Fd=function(a){U9.u.Fd.call(this,a);this.ea=!0;a=this.X.ya;var b=this.X.ma(),c=this.X.gh(),d=Tta(this.X);this.Za=!c||b==a.v3[d];this.Ja=a.KM(b,c);this.P=a.LM(b,c);this.b=$9(a,c);this.i=a$(a,c);a.Ra().Oe()?(O9(this.bd,"left",4E-6),O9(this.bd,"right",1E-6)):(O9(this.bd,"left",1E-6),O9(this.bd,"right",4E-6));a.bb().Oe()?(O9(this.bd,"top",2E-6),O9(this.bd,"bottom",3E-6)):(O9(this.bd,"top",3E-6),O9(this.bd,"bottom",2E-6))};
$.g.Po=function(a){var b=this.bd.ed(this.Gc,null,this.X.zIndex()),c=a.o("x")+this.Ja,d=a.o("zero")-this.P,e=a.o("zeroMissing");a=a.o("value")-this.P;b.front.moveTo(c,d).lineTo(c,a);b.frontHatch.moveTo(c,d).lineTo(c,a);this.X.gh()?this.f=[c,d,e]:(b.back.moveTo(c+this.b,d-this.i).lineTo(c+this.b,a-this.i),b.bottom.moveTo(c,d).lineTo(c+this.b,d-this.i),"none"==this.X.bb().jn()&&a>=d&&b.cap.moveTo(c,d).lineTo(c+this.b,d-this.i),b.left.moveTo(c,d).lineTo(c,a).lineTo(c+this.b,a-this.i).lineTo(c+this.b,
d-this.i).close());this.D=c;this.K=a;this.Mi=this.na=d};
$.g.ug=function(a){var b=this.bd.ed(this.Gc),c=a.o("x")+this.Ja,d=a.o("zero")-this.P,e=a.o("zeroMissing");a=a.o("value")-this.P;this.X.gh()?this.f.push(c,d,e):(b.bottom.lineTo(c+this.b,d-this.i),b.back.lineTo(c+this.b,a-this.i));e=b.front.FZ();this.Za&&(this.ea?b.top.moveTo(e.x,e.y).lineTo(e.x+this.b,e.y-this.i).lineTo(c+this.b,a-this.i).lineTo(c,a).close():b.top.moveTo(e.x,e.y).lineTo(c,a).lineTo(c+this.b,a-this.i).lineTo(e.x+this.b,e.y-this.i).close(),this.ea=!this.ea);if("none"==this.X.bb().jn()){var f=
(d-e.y)*(c-e.x)/(a-e.y)+e.x;0<a-e.y&&e.y<=d&&a>d?b.cap.moveTo(f,d).lineTo(f+this.b,d-this.i):0>a-e.y&&e.y>d&&a<=d&&b.cap.lineTo(f+this.b,d-this.i).lineTo(f,d).close()}b.front.lineTo(c,a);b.frontHatch.lineTo(c,a);this.D=c;this.K=a;this.na=d};
$.g.Jm=function(){if(this.G){var a=this.bd.ed(this.Gc),b=a.front,c=a.frontHatch;if(this.f){for(var d=window.NaN,e=window.NaN,f=!1,h=this.f.length-1;0<=h;h-=3){var k=this.f[h-2],l=this.f[h-1],m=this.f[h];m&&!(0,window.isNaN)(d)?(b.lineTo(d,l),c.lineTo(d,l)):f&&!(0,window.isNaN)(e)&&(b.lineTo(k,e),c.lineTo(k,e));b.lineTo(k,l);c.lineTo(k,l);d=k;e=l;f=m}b.close();c.close();this.f=null}else(0,window.isNaN)(this.D)||(b.lineTo(this.D,this.Mi).close(),c.lineTo(this.D,this.Mi).close(),a.back.lineTo(this.D+
this.b,this.Mi-this.i).close(),a.bottom.lineTo(this.D,this.Mi).close(),"none"==this.X.bb().jn()&&this.K>=this.X.Mi&&a.cap.lineTo(this.D+this.b,this.Mi-this.i).lineTo(this.D,this.Mi).close());(0,window.isNaN)(this.D)||a.right.moveTo(this.D,this.na).lineTo(this.D,this.K).lineTo(this.D+this.b,this.K-this.i).lineTo(this.D+this.b,this.na-this.i).close()}};$.H(V9,$.MA);$.VG[7]=V9;$.g=V9.prototype;$.g.type=7;$.g.flags=$.rB|263717;$.g.Ih={top:"path",bottom:"path",left:"path",right:"path",back:"path",front:"path",frontHatch:"path",rightHatch:"path",topHatch:"path"};$.g.Fd=function(a){V9.u.Fd.call(this,a);a=this.X.ya;var b=this.X.ma(),c=this.X.gh();this.f=a.KM(b,c);this.b=a.LM(b,c);this.i=$9(a,c);this.D=a$(a,c)};$.g.nK=function(a){for(var b=this.X.bg();b.advance();){var c=b.o("shapes");c&&(a=b.o("zIndex"),this.bd.yt(a+1E-8*b.ma(),c))}};
$.g.ug=function(a,b){var c=a.o("zIndex")+1E-8*(a.o("directIndex")+a.ma());c=this.bd.ed(b,null,c);Vta(this,a,c)};$.g.xt=function(a){var b=a.o("shapes"),c;for(c in b)b[c].clear();Vta(this,a,b)};$.H(W9,$.MA);$.VG[33]=W9;$.g=W9.prototype;$.g.type=33;$.g.flags=$.rB|32848;$.g.Ih={path:"path"};$.g.nK=function(){for(var a=this.X.bg();a.advance();){var b=a.o("shapes");if(b){var c=a.o("zIndex");this.bd.yt(c+1E-8*a.ma(),b)}}};$.g.Fd=function(a){W9.u.Fd.call(this,a);this.K=!0;a=this.X.ya;var b=this.X.ma();this.P=a.KM(b,!1);this.ea=a.LM(b,!1);this.i=$9(a,!1);this.D=a$(a,!1)};$.g.Po=function(a){this.b=a.o("x")+this.P;this.f=a.o("value")-this.ea};
$.g.ug=function(a){var b=this.bd.ed(this.Gc),c=a.o("x")+this.P;a=a.o("value")-this.ea;this.K?b.path.moveTo(this.b,this.f).lineTo(this.b+this.i,this.f-this.D).lineTo(c+this.i,a-this.D).lineTo(c,a).close():b.path.moveTo(this.b,this.f).lineTo(c,a).lineTo(c+this.i,a-this.D).lineTo(this.b+this.i,this.f-this.D).close();this.K=!this.K;this.b=c;this.f=a};$.H(X9,$.UB);X9.prototype.Hf=function(a){Y9(a);X9.u.Hf.call(this,a)};X9.prototype.hg=function(a){Y9(a);X9.u.hg.call(this,a)};X9.prototype.Rj=function(a){Y9(a);X9.u.Rj.call(this,a)};X9.prototype.Gh=function(a){Y9(a);X9.u.Gh.call(this,a)};var h$={},i$=$.WG|5767168;
h$.area={Fb:2,Kb:1,Lb:[{name:"top",Qb:"path",Yb:null,Zb:null,ac:!1,Ib:!1,zIndex:3E-6},b$,c$,d$,e$,$.XH,{name:"cap",Qb:"path",Yb:null,Zb:null,ac:!1,Ib:!1,zIndex:3.5E-6},f$],Ob:null,Jb:function(a,b,c){var d,e,f,h;c=$.dm("fill",1,!0)(a,c);a=$.C(c)?c.opacity:1;var k=$.C(c)?c.color:c;c=$.Ml(k);if(null===c)k=d=e=f=h=c="none";else{k=c.uk;f=$.Fl(k);var l=$.Jl(f,.2);e=$.Jl(f,.3);c=$.Jl(f,.25);h=$.Il([255,255,255],f,.1);d=$.Wb($.Il(f,l,.7));e=$.Wb($.Il(f,e,.7));h=$.Wb($.Il(l,h,.1));f=$.Wb($.Il(f,l,.1));k={angle:90,
opacity:a,keys:[$.Ql(d,.2),$.Ql(k,.3)]};d=$.Ql(e,.2);e=f=$.Ql(f,.2);c=$.Wb(c)}b.bottom.fill({color:f,opacity:a});b.back.fill({color:h,opacity:a});b.left.fill({color:c,opacity:a});b.right.fill({color:e,opacity:a});b.top.fill({color:d,opacity:a});b.cap.fill({color:f,opacity:a});b.front.fill(k);b.top.stroke({color:d,thickness:.8})},Cb:i$,Ab:"value",zb:"zero"};h$.bar={Fb:7,Kb:2,Lb:[dua,b$,c$,d$,e$,$.XH,f$,eua,fua],Ob:null,Jb:Wta,Cb:i$,Ab:"value",zb:"zero"};
h$.column={Fb:7,Kb:2,Lb:[dua,b$,c$,d$,e$,$.XH,f$,eua,fua],Ob:null,Jb:Wta,Cb:i$,Ab:"value",zb:"zero"};h$.line={Fb:33,Kb:1,Lb:[{name:"path",Qb:"path",Yb:null,Zb:null,ac:!1,Ib:!1,zIndex:0}],Ob:null,Jb:function(a,b,c){c=$.dm("fill",1,!0)(a,c);a=$.C(c)?c.opacity:1;c=$.C(c)?c.color:c;c=$.Ml(c);null===c?c="none":(c=c.uk,c=$.Fl(c),c=$.Wb($.Il(c,$.Jl(c,.3),.7)),c=$.Ql(c,.2));b.path.fill({color:c,opacity:a}).stroke({color:c,thickness:.8})},Cb:i$,Ab:"value",zb:"value"};
h$["line-2d"]={Fb:8,Kb:1,Lb:[{name:"stroke",Qb:"path",Yb:null,Zb:"stroke",ac:!0,Ib:!1,zIndex:9E-6}],Ob:null,Jb:null,Cb:i$|2097152,Ab:"value",zb:"value"};X9.prototype.fj=h$;$.Nz(X9,X9.prototype.fj);$.Wp["cartesian-3d"]=Xta;$.g=X9.prototype;$.g.Rs=function(a){return $.Ak(cua,a,"column")};$.g.oN=function(){return!0};$.g.KM=function(a,b){if(b||!this.g("zDistribution"))var c=0;else c=Z9(this),a=Yta(this,a),c=c-a-1,c*=$9(this,b)+this.i;return c};
$.g.LM=function(a,b){if(b||!this.g("zDistribution"))var c=0;else c=Z9(this),a=Yta(this,a),c=c-a-1,c*=a$(this,b)+this.j;return c};$.g.yF=function(){return new P9};$.g.ZZ=function(){var a=new R9;a.pa=this;return a};$.g.$Z=function(){var a=new S9;a.pa=this;return a};$.g.a_=function(){var a=new T9;a.pa=this;return a};
$.g.WW=function(){this.v3={};for(var a=this.Ue(),b,c="none"!=this.bb().jn(),d="direct"==this.bb().jx(),e=[30],f=!0,h=1;h<a.length;h++)a[h].Ma()==a[h-1].Ma()?e.push(e[h-1]):(e.push(30+(1-1/(h+1))),f=!1);for(h=0;h<a.length;h++){var k=30+(1-1/(h+1));b=a.length-h-1;var l=c&&d?b:h;if((b=a[l])&&b.enabled())if(b.check($.rB)){if(b.eh())for(l=b.Ec();l.advance();){var m=b,p=h;var q=a.length;var r=e[h],t=f,u=m.$(),v=$.N(u.get("value")),w=u.ma();p+=1;var x=.01,y="none"!=this.bb().jn(),B=this.Ra().Oe();w=B?u.Gb()-
w:w+1;r=this.g("zDistribution")?30+(1-1/p):t?30:r;this.bb().Oe()^0>v&&(p=-p);m.g("isVertical")?y||this.g("zDistribution")?(m=w,w=p,p=m,m=1-1/Math.abs(w),r=0<w?r+x*(p+m):r-x*(q-p+m)):(B&&(p=q-Math.abs(p)+1),w=w*q-q+Math.abs(p),x*=w,r+=x,this.bb().Oe()&&(v=-v),0>v&&(x=-x),r+=x):(y||this.g("zDistribution")||(B&&(p=q-Math.abs(p)+1),w=w*q-q+Math.abs(p)),x*=w,r+=x);u.o("zIndex",r);u.o("directIndex",w*p);q=r;k<q&&(k=q)}else b.zIndex()!=b.yh&&b.zIndex()!=k&&(k=b.zIndex()),b.xP()&&(this.v3[Tta(b)]=l);b.zIndex(k)}else k=
1E-5*b.xh()+32,b.yh=k}};
$.g.K1=function(a){a=a.clone().round();var b=this.jD(a),c=Z9(this),d=this.g("zAngle"),e=this.g("zAspect"),f=this.g("zPadding"),h=this.g("zDistribution"),k=$.bb(d);d=$.bb(90-d);if($.zo(e)){var l=(0,window.parseFloat)(e)/100;e=l*Math.sin(d);for(var m=l*Math.sin(k),p=l=0,q=this.Ue(),r,t=0;t<q.length;t++)if((r=q[t])&&r.enabled()&&r.check($.rB)){var u=r.Ra();u=1/("ordinal"==u.Ma()?u.values().length:r.$().Gb());var v=this.g("barsPadding");var w=this.g("barGroupsPadding");v=r.gh()||h?1/(1+w):1/(c+(c-1)*
v+w);u*=v;!r.gh()&&h?(l+=u*e,p+=u*m):l||(l=u*e,p=u*m)}this.i=Math.round(f*Math.sin(d));this.j=Math.round(f*Math.sin(k));f=this.Js?b.height/(1+l):b.width/(1+l);this.mi=f*l;this.Mh=f*p;!this.CD&&h&&(this.mi+=this.i*(c-1),this.Mh+=this.j*(c-1));this.mi=Math.round(this.mi);this.Mh=Math.round(this.Mh)}else this.K=!this.CD&&h?e*c+f*(c-1):$.N(e),this.mi=Math.round(this.K*Math.sin(d)),this.Mh=Math.round(this.K*Math.sin(k)),h=c-1,f*h>=this.K&&(f=(this.K-c)/h),this.i=Math.round(f*Math.sin(d)),this.j=Math.round(f*
Math.sin(k));this.mi=Math.max(this.mi,0)||0;this.Mh=Math.max(this.Mh,0)||0;this.i=Math.max(this.i,0)||0;this.j=Math.max(this.j,0)||0;a.top+=this.Mh;a.height-=this.Mh;a.width-=this.mi;return a};$.g.LL=function(a,b,c){if(!this.CD&&this.g("zDistribution")){if(0<a){a=1+this.g("barGroupsPadding");for(var d=1/a,e=0;e<b.length;e++)a=b[e].X,a.check(262144)&&c^a.g("isVertical")&&($.jB(a,.5),$.iB(a,d))}}else X9.u.LL.call(this,a,b,c)};
$.g.ig=function(a){var b=$.xo(a.target);return(b=b&&b.X)&&!b.md&&b.enabled()?b.ig(a):X9.u.ig.call(this,a)};$.g.U=function(a,b){X9.u.U.call(this,a,b)};var j$=X9.prototype;$.F("anychart.cartesian3d",Xta);j$.xScale=j$.Ra;j$.yScale=j$.bb;j$.crosshair=j$.mh;j$.xGrid=j$.jm;j$.yGrid=j$.lm;j$.xMinorGrid=j$.Pr;j$.yMinorGrid=j$.Sr;j$.xAxis=j$.Zh;j$.getXAxesCount=j$.tD;j$.yAxis=j$.ij;j$.getYAxesCount=j$.vD;j$.getSeries=j$.ff;j$.zIndex=j$.zIndex;j$.lineMarker=j$.Ym;j$.rangeMarker=j$.gn;j$.textMarker=j$.mn;
j$.palette=j$.cc;j$.markerPalette=j$.Mf;j$.hatchFillPalette=j$.ve;j$.getType=j$.Ma;j$.addSeries=j$.jl;j$.getSeriesAt=j$.zi;j$.getSeriesCount=j$.tj;j$.removeSeries=j$.yo;j$.removeSeriesAt=j$.Rn;j$.removeAllSeries=j$.Dp;j$.getPlotBounds=j$.cg;j$.xZoom=j$.Tq;j$.yZoom=j$.Uq;j$.xScroller=j$.Mp;j$.yScroller=j$.Tr;j$.getStat=j$.Rg;j$.getXScales=j$.uy;j$.getYScales=j$.wy;$.Wp["area-3d"]=Zta;$.Wp["bar-3d"]=$ta;$.Wp["column-3d"]=aua;$.Wp["line-3d"]=bua;$.F("anychart.area3d",Zta);$.F("anychart.bar3d",$ta);$.F("anychart.column3d",aua);$.F("anychart.line3d",bua);}).call(this,$)}
