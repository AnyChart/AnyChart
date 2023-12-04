if(!_.gantt_base){_.gantt_base=1;(function($){var uI,vI,hea,wI;$.rI=function(){$.V.call(this);this.B(4294967295);$.T(this.ua,[["id"],["className"]])};$.sI=function(){$.V.call(this);this.Wa=new $.Iu;$.L(this.Wa,this.Ok,this);this.Xb=this.Y=null;this.I(4294967295);$.Hq(this.ua,0,0,9,1);$.T(this.ua,[["fill",0,1],["format",20,9]])};
$.tI=function(){$.Y.call(this);this.ab=this.b=null;this.G=new $.rI;$.L(this.G,this.Iaa,this);this.Ha=new $.zu;$.L(this.Ha,this.Gaa,this);this.Wa=new $.Iu;$.L(this.Wa,this.dm,this);this.D=new $.sI;this.D.parent(this);$.L(this.D,this.Fga,this);this.Xb=this.Y=this.eb=null;this.Da=[];this.K=[];$.Hq(this.ua,20,20,9,1);$.T(this.ua,[["format",20,9],["stroke",16,1],["fill",16,1],["levelHeight",16,1],["drawTopLine",256,1],["drawRightLine",256,1],["drawBottomLine",256,1],["drawLeftLine",256,1]])};
uI=function(a,b,c){var d=a.Da[b]||null;if(!d&&c){a.Jv();c=$.om("defaultLabelFactory.format");var e=$.om("defaultLabelFactory.positionFormatter");d=new $.Qu;d.format(c);d.positionFormatter(e);d.ef();d.enabled(!0);d.O(a.Kf);a.Da[b]=d}return d};vI=function(a,b,c){return(a=a.K[b])?a.nd(c):void 0};hea=function(a,b,c,d,e,f){for(var h=0,k=f.length;h<k;h++){var l=f[h];d.width=null;d.height=null;if(c.measure(a.ym(b,l),void 0,d).width<e.width)return h}return k-1};
wI=function(a,b){$.V.call(this);this.Xk=a;this.Ad=b;$.Hq(this.ua,20,20,9,1);$.T(this.ua,[["format",20,9],["enabled",512,1],["stroke",16,1],["fill",16,1],["height",16,1]])};$.H($.rI,$.V);$.rI.prototype.sa=23;$.rI.prototype.ra=$.V.prototype.ra|1;var xI={};$.uq(xI,0,"id",$.Cq);$.uq(xI,0,"className",$.Cq);$.U($.rI,xI);$.g=$.rI.prototype;$.g.enabled=function(a){return $.n(a)?(this.Pa.enabled!=a&&(a=this.Pa.enabled=a,this.B(1,1),a?this.da(!0):(0,window.isNaN)(this.Ko)&&this.ka()),this):this.g("enabled")};
$.g.target=function(a){return $.n(a)?(this.b!=a&&(this.b=a,this.B(2)),this):this.b};$.g.Ya=function(){return this.Ud};$.g.Pf=function(a){this.Bb=a;this.B(4)};$.g.ph=function(a){return null!=this.Pa[a]};$.g.wM=function(){return 16};$.g.xs=function(){return 1};$.g.zc=function(){if(this.pf()||this.md)return!1;if(!this.enabled())return this.J(1)&&(this.remove(),this.I(1),this.B(2)),!1;if(!this.target())return this.remove(),this.B(2),$.il(1),!1;this.I(1);return!0};
$.g.W=function(){if(!this.zc())return this;this.Ud||(this.Ud=$.Oe("DIV"),$.yf(this.Ud,{position:"absolute","pointer-events":"none"}));this.J(2)&&(this.b.appendChild(this.Ud),this.I(2));if(this.J(16)){var a=this.g("id");$.n(a)&&this.Ud.setAttribute("id",a);a=this.g("className");$.n(a)&&(this.Ud.className=a);this.I(16)}this.J(4)&&($.Ef(this.Ud,this.Bb.left,this.Bb.top),$.Kf(this.Ud,this.Bb.width,this.Bb.height),this.I(4));return this};$.g.remove=function(){this.Ud&&$.Ye(this.Ud)};
$.g.Je=function(a,b){return $.da(b)||null===b?(a?this.oa.enabled=!!b:this.enabled(!!b),!0):!1};$.g.F=function(){var a=$.rI.u.F.call(this);$.Wq(this,xI,a,"Overlay ui element");var b=$.V.prototype.g.call(this,"enabled");a.enabled=$.n(b)?b:null;return a};$.g.U=function(a,b){$.rI.u.U.call(this,a,b);b?($.Nq(this.oa,xI,a),"enabled"in a&&(this.oa.enabled=a.enabled)):($.Oq(this,xI,a),this.enabled(a.enabled))};$.g.R=function(){$.rI.u.R.call(this)};var yI=$.rI.prototype;yI.getElement=yI.Ya;yI.enabled=yI.enabled;$.H($.sI,$.V);$.g=$.sI.prototype;$.g.ra=$.V.prototype.ra|9;$.g.g=$.lr;$.g.jg=function(a){$.n(a)&&(this.Xb=a);return this.Xb};$.g.bh=$.kr;$.g.Xd=function(){var a=[this.oa];this.Y&&(a=$.Ga(a,this.Y.Xd()));return a};$.g.Wd=function(){var a=[this.Pa];this.Y&&(a=$.Ga(a,this.Y.Wd()));return a};$.g.parent=function(a){return $.n(a)?(this.Y!=a&&(this.Y&&$.nr(this.Y,this.Tc,this),(this.Y=a)&&$.L(this.Y,this.Tc,this),this.Wa.parent(this.Y.padding())),this):this.Y};
$.g.Tc=function(a){var b=0,c=0;$.X(a,1)&&(b|=16,c|=1);$.X(a,8)&&(c|=8);$.X(a,32768)&&(b|=1,c|=9);this.B(b,c)};var zI=$.yq();$.uq(zI,0,"format",$.dr);$.U($.sI,zI);var AI={};$.uq(AI,1,"fill",$.Tq);$.U($.sI,AI);$.g=$.sI.prototype;$.g.padding=function(a,b,c,d){return $.n(a)?(this.Wa.N.apply(this.Wa,arguments),this):this.Wa};$.g.Ok=function(a){$.X(a,2)&&this.B(4,9)};$.g.U=function(a,b){b?($.Nq(this.oa,AI,a),$.Nq(this.oa,zI,a)):($.Oq(this,zI,a),$.Oq(this,AI,a));this.padding().fa(!!b,a.padding)};
$.g.F=function(){var a={};a.padding=this.padding().F();$.Wq(this,zI,a,"Time line holidays settings text props");$.Wq(this,AI,a,"Time line holidays settings props");return a};$.g.R=function(){$.sI.u.R.call(this);$.pd(this.Wa);this.Wa=null};var BI=$.sI.prototype;BI.padding=BI.padding;$.H($.tI,$.xu);$.tI.prototype.sa=$.xu.prototype.sa|2E3;$.tI.prototype.ra=$.xu.prototype.ra;var CI=$.yq();$.uq(CI,0,"format",$.dr);$.U($.tI,CI);var DI={};$.vq(DI,[[1,"stroke",$.Sq],[1,"fill",$.Tq],[0,"levelHeight",$.er],[0,"drawTopLine",$.Gq],[0,"drawRightLine",$.Gq],[0,"drawBottomLine",$.Gq],[0,"drawLeftLine",$.Gq]]);$.U($.tI,DI);$.g=$.tI.prototype;$.g.Ra=function(a){return $.n(a)?(this.eb!=a&&(this.eb&&$.nr(this.eb,this.f_,this),(this.eb=a)&&$.L(this.eb,this.f_,this),this.B(128,1)),this):this.eb};
$.g.HX=function(a){this.f=a;this.B(512,1)};$.g.level=function(a,b){var c=$.N(a);if((0,window.isNaN)(c)){c=0;var d=a}else c=a,d=b;var e=this.K[c];e||(this.K[c]=e=new wI(this,c));return $.n(d)?(e.N(d),this):e};$.g.background=function(a){return $.n(a)?(this.Ha.N(a),this):this.Ha};$.g.padding=function(a,b,c,d){return $.n(a)?(this.Wa.N.apply(this.Wa,arguments),this):this.Wa};$.g.GA=function(a){return $.n(a)?(this.D.N(a),this):this.D};
$.g.Haa=function(a){return $.n(a)?(this.G.N(a),this.B(1024,1),this):this.G};$.g.ph=function(a){return null!=this.Pa[a]};$.g.jg=function(a){$.n(a)&&(this.Xb=a);return this.Xb};$.g.bh=$.kr;$.g.Xd=function(){var a=[this.oa];this.Y&&(a=$.Ga(a,this.Y.Xd()));return a};$.g.Wd=function(){var a=[this.Pa];this.Y&&(a=$.Ga(a,this.Y.Wd()));return a};$.g.parent=function(a){return $.n(a)?(this.Y!=a&&(this.Y&&$.nr(this.Y,this.Tc,this),(this.Y=a)&&$.L(this.Y,this.Tc,this)),this):this.Y};
$.g.Tc=function(a){var b=0,c=0;$.X(a,1)&&(b|=16,c|=1);$.X(a,8)&&(c|=8);$.X(a,32768)&&(b|=1,c|=9);this.B(b,c)};$.g.f_=function(a){var b=0;$.X(a,4)&&(b|=512);$.X(a,2)&&(b|=384);this.B(b,1)};$.g.Gaa=function(){this.B(64,1)};$.g.dm=function(a){$.X(a,2)&&this.B(4,9)};$.g.Fga=function(){this.B(16,1)};$.g.Iaa=function(){this.B(1024,1)};$.g.ym=function(a,b){var c=$.xs(a,b);return $.qv(new $.Gw({value:{value:c,type:"string"},tickValue:{value:a,type:"number"},scale:{value:this.eb,type:""}}))};
$.g.vi=function(a){var b=this.Da[a];a=this.ba[a]?this.ba[a]:this.ba[a]=this.na[a][this.Ca];for(var c=0,d=b.cI();c<d;c++){var e=b.ae(c),f=e.Gf().tickValue;e.Gf(this.ym(f,a));f=b.measure(e);var h=e.ic("hAlign");"left"==h||"start"==h?f.left=e.D.left:"right"==h||"end"==h?f.left=e.D.cb()-f.width:f.left=e.D.left+(e.D.width-f.width)/2;h=e.ic("vAlign");"top"==h?f.top=e.D.top:"bottom"==h?f.top=e.D.Va()-f.height:f.top=e.D.top+(e.D.height-f.height)/2;f.left=Math.max(e.K.left,Math.min(f.left,e.K.cb()-f.width));
f.top=Math.max(e.K.top,Math.min(f.top,e.K.Va()-f.height));e.jc({value:{x:f.left,y:f.top}})}$.Zu(b);b.W()};
$.g.W=function(){if(this.zc()){var a=!1,b=!1,c;this.Jv();this.J(2)&&(this.b.parent(this.O()),this.I(2));this.J(8)&&(this.b.zIndex(this.zIndex()),this.Ha.zIndex(0),this.j.zIndex(1),this.Kf.zIndex(2),this.I(8));this.J(4)&&(this.ab=this.pb(),$.ap(this.ab,0),this.gg.shape(this.ab),this.ba.length=0,this.B(1472),this.I(4));if(this.J(512)){var d=this.f.length;var e=this.aa.length;this.ba.length=0;this.na.length=0;this.fb.length=0;this.Za.length=0;var f=this.i.length=0,h=0;d=Math.max(d,e);for(c=0;c<d;c++){var k=
this.f[c];var l=this.aa[c];e=this.ea[c];var m=this.Ja[c];var p=this.Ia[c];var q=vI(this,c,"enabled");if(!k||!q&&$.n(q)){l&&l.clear().parent(null);e&&e.clear().parent(null);m&&m.clear().parent(null);p&&p.clear().parent(null);var r=uI(this,c,!1)}else{var t=$.cp(vI(this,c,"height"),k.height,this.g("levelHeight"),null);null===t?(this.i[c]=null,h++):(this.i[c]=$.M(t,this.ab.height),f+=this.i[c]);if("formats"in k)this.na[c]=k.formats;else{t=k.unit;var u=void 0;this.f[c+1]&&(u=this.f[c+1].unit,u!=t&&(u=
$.yp(u,-1)));this.na[c]=$.ws($.us(k.unit,u,"timeline"))}l?l.clear().parent(this.j):(l=this.j.path(),this.aa[c]=l);e?e.clear().parent(this.j):(e=this.j.path(),this.ea[c]=e);m?m.clear().parent(this.j):(m=this.j.path(),this.Ja[c]=m);p?p.clear().parent(this.j):(p=this.j.path(),this.Ia[c]=p);r=uI(this,c,!0)}r&&r.clear()}this.P=(this.ab.height-f)/h;this.B(400);this.I(512)}if(this.J(16)){f=$.om("defaultLabelFactory");h={};$.Wq(this,CI,h);h.format=this.g("format");h.padding=this.padding();t={};$.Wq(this.D,
CI,t);t.padding=this.D.padding();d=this.f.length;for(c=0;c<d;c++)if(k=this.f[c],q=vI(this,c,"enabled"),k&&(q||!$.n(q))){l=this.aa[c];e=this.ea[c];m=this.Ja[c];p=this.Ia[c];var v={};$.Uc(v,f);$.Uc(v,h);u={};$.Nq(u,CI,k);"padding"in k&&(u.padding=k.padding);$.Uc(v,u);this.K[c]&&$.Nq(v,CI,this.K[c].Pa);v.enabled=!0;v.width=null;v.height=null;this.fb[c]=v;v={};$.Uc(v,f);$.Uc(v,h);$.Uc(v,t);$.Uc(v,u);if(u=k.holiday)$.Nq(v,CI,u),"padding"in u&&(v.padding=u.padding);v.enabled=!0;v.width=null;v.height=null;
this.Za[c]=v;v=$.cp(vI(this,c,"stroke"),k.stroke,this.g("stroke"));q=$.cp(vI(this,c,"fill"),k.fill,this.g("fill"));m.fill(null).stroke(v);l.fill(q).stroke(null);(l=$.cp(vI(this,c,"fill"),u&&u.fill,this.D.nd("fill")))||(l=q);p.fill(null).stroke(v);e.fill(l).stroke(null)}this.B(256);this.I(16)}this.J(64)&&(this.Ha.ja(this.ab),this.Ha.O(this.b),this.Ha.W(),this.I(64));this.J(128)&&(a=!0,this.I(128));this.J(256)&&(b=!0,this.I(256));this.J(1024)&&(this.G.target(this.O().Ka().Rl()),this.G.Pf(this.pb()),
this.G.W(),this.I(1024));if(this.eb&&(a||b))for(d=this.f.length,a=d-1,c=this.ab.height+this.ab.top,f=!!this.g("drawTopLine"),h=!!this.g("drawRightLine"),t=!!this.g("drawBottomLine"),u=!!this.g("drawLeftLine"),v=0;v<d;v++)if(k=this.f[v],q=vI(this,v,"enabled"),k&&(q||!$.n(q))){q=v==a;var w=null===this.i[v]?this.i[v]=this.P:this.i[v];l=this.aa[v].clear();e=this.ea[v].clear();m=this.Ja[v].clear();p=this.Ia[v].clear();b&&(r=this.Da[v],r.clear());k=this.eb.Fn(0,this.ab.width,k.unit,k.count);r=k.length;
var x=r-1,y=$.cc(m.stroke());var B=!v&&t?y/2:v?Math.ceil(y/2):0;c=$.R(c-B,y);var G=q&&f?y/2:q?0:Math.floor(y/2);w-=(v?B/2:B)+(q?G:G/2);w=$.R(c-w,y,!0);for(B=this.Ca=0;B<r;B++){var D=B==x,K=k[B],O=K.holiday,Q=O?p:m;y=$.cc(Q.stroke());G=$.R(this.un(K.start),y);y=$.R(this.un(K.end),y);var S=Math.floor(G),wa=Math.ceil(y),sa=f||!q?Math.ceil(w):Math.floor(w),Qa=t&&!v?Math.floor(c):Math.ceil(c);u&&!B&&Q.moveTo(G,sa).lineTo(G,Qa);!h&&D||Q.moveTo(y,sa).lineTo(y,Qa);!f&&q||Q.moveTo(S,w).lineTo(wa,w);t&&!v&&
Q.moveTo(S,c).lineTo(wa,c);(O?e:l).moveTo(S,Qa).lineTo(wa,Qa).lineTo(wa,sa).lineTo(S,sa).close();b&&(D=v,O=O?this.Za[D]:this.fb[D],wa=this.i[D],Q=this.Da[D],S=$.nn(G,w,y-G,wa),G=Math.max(G,this.ab.left),G=$.nn(G,w,Math.min(y,this.ab.cb())-G,wa),y=Q.add({tickValue:K.start},null,B),(wa=O.padding)?($.J(wa,$.Iu)||(this.$a||(this.$a=new $.Iu),this.$a.N(O.padding),wa=this.$a),y.K=wa.Dj(G),y.D=wa.Dj(S)):(y.K=G,y.D=S),O.anchor="left-top",y.Rh().clip(y.K),y.td(O),y.padding(0),this.ba[D]||this.Ca==this.na[D].length-
1||(this.Ca=Math.max(this.Ca,hea(this,K.start,Q,O,y.D,this.na[D]))))}b&&this.vi(v);c=w}}};$.g.Jv=function(){this.b||(this.b=$.pk(),this.gg=$.uk(),this.b.clip(this.gg),this.j=this.b.Bd(),this.aa=[],this.ea=[],this.Ja=[],this.Ia=[],this.Kf=this.b.Bd(),this.i=[],this.fb=[],this.Za=[],this.na=[],this.ba=[])};$.g.un=function(a){return(this.eb.un?this.eb.un(a):this.eb.transform(a)*this.ab.width)+this.ab.left};$.g.remove=function(){this.b&&this.b.parent(null)};
$.g.F=function(){var a=$.tI.u.F.call(this);$.Wq(this,DI,a,"Resource Timeline");$.Wq(this,CI,a,"Resource Timeline text settings");a.background=this.Ha.F();a.padding=this.Wa.F();a.holidays=this.D.F();a.overlay=this.G.F();this.K.length&&(a.levels=(0,$.Wa)(this.K,function(a){return a?a.F():{}}));return a};
$.g.U=function(a,b){$.tI.u.U.call(this,a,b);b?($.Nq(this.oa,DI,a),$.Nq(this.oa,CI,a)):($.Oq(this,DI,a),$.Oq(this,CI,a));"background"in a&&this.Ha.fa(!!b,a.background);"padding"in a&&this.Wa.fa(!!b,a.padding);"holidays"in a&&this.D.U(a.holidays,b);"overlay"in a&&this.G.fa(!!b,a.overlay);var c=a.levels;if($.A(c))for(var d=0;d<c.length;d++)this.level(d,c[d])};
$.g.R=function(){$.pd(this.b);this.b=null;$.pd(this.Ha);this.Ha=null;$.pd(this.Wa);this.Wa=null;$.pd(this.gg);this.gg=null;$.pd(this.D);this.D=null;$.ud(this.aa);this.aa=null;$.ud(this.ea);this.ea=null;$.ud(this.Da);this.Da=null;$.pd(this.G);this.G=null;$.ud(this.K);this.Kf=this.j=this.K=null;$.tI.u.R.call(this)};$.H(wI,$.V);$.U(wI,CI);var EI={};$.vq(EI,[[0,"enabled",$.Gq],[1,"stroke",$.Sq],[1,"fill",$.Tq],[0,"height",$.er]]);$.U(wI,EI);$.g=wI.prototype;$.g.B=function(a,b){return this.Xk.B(a,b)};
$.g.vf=function(a){return"enabled"==a?!0:this.Xk.g("height"==a?"levelHeight":a)};$.g.F=function(){var a=wI.u.F.call(this);$.Wq(this,EI,a,"TimeLine Header Level",void 0,!0);$.Wq(this,CI,a,"TimeLine Header Level text settings",void 0,!0);return a};$.g.Je=function(a,b){return $.da(b)||null===b?(this.enabled(!!b),!0):!1};$.g.U=function(a){wI.u.U.call(this,a);$.Oq(this,EI,a);if($.C(a.labels)){var b=this.nd("enabled");$.Oq(this,CI,a.labels);this.ta("enabled",b)}$.Oq(this,CI,a)};
$.g.R=function(){this.Xk=null;wI.u.R.call(this)};var FI=$.tI.prototype;FI.background=FI.background;FI.padding=FI.padding;FI.holidays=FI.GA;FI.overlay=FI.Haa;FI.level=FI.level;FI=wI.prototype;}).call(this,$)}
