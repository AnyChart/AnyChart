if(!_.vml){_.vml=1;(function($){var CS=function(a){var b=Math.pow(10,6);return Math.round(a*b)/b},DS=function(a,b,c,d,e){$.Hg.call(this,a,b,c,d,e)},ES=function(a,b,c,d,e,f,h){$.Jj.call(this,a,b,c,b,b,f,h);this.b=d;this.f=e},Lfa=function(a,b,c,d,e,f,h){f=null!=f?$.Za(f,0,1):1;var k=[];(0,$.Re)(a,function(a){k.push(String(a.offset)+a.color+(a.opacity?a.opacity:null))});return k.join("")+f+b+c+d+e+(h?String(h.left)+h.top+h.width+h.height:"")},IS=function(){$.gh.call(this);var a=window.document;Mfa()||a.createStyleSheet().addRule("."+
FS,"behavior:url(#default#VML)");try{a.namespaces[GS]||a.namespaces.add(GS,Nfa),this.f=function(a){return $.Oe(GS+":"+a,{"class":FS})}}catch(b){this.f=function(a){return $.Oe(GS+":"+a,{"class":FS,xmlns:"urn:schemas-microsoft.com:vml"})}}HS&&(this.lc=this.jka)},JS=function(a){return $.z(a)&&$.hc(a,"%")?(0,window.parseFloat)(a)+"%":(0,window.parseFloat)(String(a))+"px"},KS=function(a){return 100*Math.round(a)},LS=function(a,b){a[b]&&(a.cssText=a.cssText.replace(new RegExp("(^|; )("+b+": [^;]*)(;|$)",
"ig"),";"))},MS=function(a,b){a.lc(b,"coordsize",KS(1)+" "+KS(1));$.rh(a,b.style,{position:"absolute",left:JS(0),top:JS(0),width:JS(1),height:JS(1)})},Mfa=function(){return!!$.ya($.hk(),function(a){return a.selectorText==="."+FS})},Ofa=function(a,b){var c=a%90,d=$.bb(a),e=1,f=b.left+b.width/2,h=b.top+b.height/2,k=0>Math.sin(d)||180==a||360==a;if(90==a||270==a)c+=1E-6;180!=a&&(0>Math.tan(d)||90==a||270==a)&&(e=-1,c=90-c);c=$.bb(c);d=Math.tan(c);d=Math.sin(c)*(b.height/2-d*b.width/2)+Math.sqrt(Math.pow(b.width/
2,2)*(1+Math.pow(d,2)));e*=Math.cos(c)*d;c=Math.sin(c)*d;k&&(e=-e,c=-c);return{fi:new $.gb(Math.round(f-e),Math.round(h+c)),dl:new $.gb(Math.round(f+e),Math.round(h-c))}},Pfa=function(a,b){if(b.fi.x==b.dl.x){var c=b.fi.x;var d=a.y}else b.fi.y==b.dl.y?(c=a.x,d=b.fi.y):(c=(b.fi.x*Math.pow(b.dl.y-b.fi.y,2)+a.x*Math.pow(b.dl.x-b.fi.x,2)+(b.dl.x-b.fi.x)*(b.dl.y-b.fi.y)*(a.y-b.fi.y))/(Math.pow(b.dl.y-b.fi.y,2)+Math.pow(b.dl.x-b.fi.x,2)),d=(b.dl.x-b.fi.x)*(a.x-c)/(b.dl.y-b.fi.y)+a.y);c=new $.gb(c,d);d=[$.Za(b.fi.x-
b.dl.x,-1,1),$.Za(b.fi.y-b.dl.y,-1,1)];var e=[$.Za(b.fi.x-c.x,-1,1),$.Za(b.fi.y-c.y,-1,1)],f=[$.Za(b.dl.x-c.x,-1,1),$.Za(b.dl.y-c.y,-1,1)];return 0>(0==d[0]?(e[1]+f[1])*d[1]:(e[0]+f[0])*d[0])?-$.jb(b.fi,c):$.jb(b.fi,c)},Qfa=function(a,b,c,d){var e=Ofa(c,d);d=$.jb(e.fi,e.dl);var f=Ofa(c,b);b=$.jb(f.fi,f.dl);c=Pfa(e.fi,f);e=Pfa(e.dl,f);f={offset:Math.round(c/b*100)/100,color:"",opacity:1};var h={offset:Math.round(e/b*100)/100,color:"",opacity:1},k=[];k.toString=function(){for(var a="\n",b=0,c=this.length;b<
c;b++)a+="offset: "+this[b].offset+"; color: "+this[b].color+"; opacity: "+this[b].opacity+"\n";return a};var l,m,p;k.push(f);for(p=0;p<a.length;p++){var q=a[p];q.color=$.Bl(q.color).uk;q.offset<=f.offset?l={offset:q.offset,color:q.color,opacity:q.opacity}:q.offset>f.offset&&q.offset<h.offset?k.push({offset:q.offset,color:q.color,opacity:q.opacity}):q.offset>=h.offset&&!m&&(m={offset:q.offset,color:q.color,opacity:q.opacity})}k.push(h);a=q=1;if(2<k.length){l||(l=k[1]);p=b*l.offset;var r=Math.abs(b*
k[1].offset-p);var t=$.Cl(String(l.color)),u=$.Cl(String(k[1].color));q-=0==r?0:Math.abs(c-p)/r;f.color=$.Wb($.Il(t,u,q));m||(m=k[k.length-2]);r=b*m.offset;p=b*k[k.length-2].offset;q=Math.abs(p-r);r=$.Cl(String(k[k.length-2].color));t=$.Cl(String(m.color));a-=0==q?0:Math.abs(e-p)/q;h.color=$.Wb($.Il(r,t,a))}else l||0!=m.offset||(l=m),m||1!=l.offset||(m=l),p=b*l.offset,r=b*m.offset,t=$.Cl(String(l.color)),u=$.Cl(String(m.color)),r=Math.abs(r-p),q-=0==r?0:Math.abs(c-p)/r,a-=0==r?0:Math.abs(e-p)/r,f.color=
$.Wb($.Il(t,u,q)),h.color=$.Wb($.Il(t,u,a));f.opacity=l.opacity;h.opacity=m.opacity;for(p=0;p<k.length;p++)k[p].offset=0==p?0:p==k.length-1?1:Math.abs(c-k[p].offset*b)/d;return k},Rfa=function(a,b){a=String(a);if(!a)return"none";var c=a.split(" ");0!=c.length%2&&c.push.apply(c,c);for(var d=[],e=0;e<c.length;e++)d.push(Math.ceil((0,window.parseFloat)(c[e])/b));return d.join(" ")},NS=function(a,b){$.nd.call(this);this.b=a;this.i=b},Sfa=function(a){delete a.b;$.Ye(a.nA);a.nA=null},OS=function(a){$.Lj.call(this,
a);this.f={};this.G={}},Tfa=function(a,b,c){var d="";d=$.z(b)?d+(b+"1"):$.J(b,$.Jj)?Lfa(b.keys,b.Dc,b.uc,b.b,b.f,b.opacity,b.Ua):$.J(b,$.Hj)?$.Ij(b.keys,b.opacity,b.angle,b.mode):d+(b.color+b.opacity);if($.z(c))var e=c;else if("keys"in c){var f=0!=c.keys.length?c.keys[0]:c;e=f.color||"black";e+="opacity"in f?f.opacity:1}else e=c.color,e+="opacity"in c?c.opacity:1;d+=String(c.thickness)+e+c.lineJoin+c.lineCap+c.dash;if($.Kc(a.f,d))return a.f[d];b=new NS(b,c);return a.f[d]=b},Ufa=function(a,b,c,d,e,
f,h,k){k=null!=k?k:null;var l=Lfa(b,c,d,e,f,h,k);return $.Kc(a.G,l)?a.G[l]:a.G[l]=new ES(b,c,d,e,f,h,k)},PS=function(a,b,c){$.Zj.call(this,a,b,c)},QS=function(a,b){$.Qh.call(this,a,b);this.Uc=null;this.Ia=!1;this.nf=null},RS=function(a){var b=a.nf;a=a.Ig();return null===b&&null===a?!1:null===b||null===a?!0:!(a.od==b.od&&a.hf==b.hf&&a.We==b.We&&a.Me==b.Me)},Vfa=function(a){var b=a.Ia;a.Ia=a.xr();var c=!b&&a.Ia;b=b&&!a.Ia;var d=!a.Ja()||a.Ja().xf();d||a.Ja().suspend();c?(a.Pb(1024),a.Pb(32),a.Pb(16384),
a.Pb(4),a.Ua=new $.I(a.x(),a.y(),a.Xf,a.If)):b&&(a.Pb(1024),a.Pb(32),a.Pb(16384),a.Pb(4),a.Ua=a.Vm(a.Uc,{}));d||a.Ja().resume()};$.H(DS,$.Hg);DS.prototype.Rd=function(){var a=this.o(),b=a&&!a.xf();b&&a.suspend();(0,$.Re)(this.elements,function(a){a.Pb(512)},this);b&&a.resume()};$.E("acgraph.vml.Clip",DS);$.H(ES,$.Jj);$.H(IS,$.gh);$.ja(IS);var Nfa="urn:schemas-microsoft-com:vml",GS="any_vml",FS="any_vml",HS=$.uh.document&&$.uh.document.documentMode&&8<=$.uh.document.documentMode;$.g=IS.prototype;$.g.Yn=null;$.g.mk=null;$.g.OJ=null;$.g.$A=null;$.g.Dr=null;$.g.vI=null;$.g.jka=function(a,b,c){a[b]=c};$.g.tS=function(){return $.Te(window.document,"div")};
$.g.Xp=function(){this.$A=this.AS();MS(this,this.$A);this.$A.style.display="none";$.rh(this,this.$A,{filled:"true",fillcolor:"black",stroked:"false",path:"m0,0 l1,0 e"});window.document.body.appendChild(this.$A);this.Yn=$.Oe("DIV");this.mk=$.Oe("SPAN");this.OJ=$.Oe("SPAN");window.document.body.appendChild(this.Yn);this.Yn.appendChild(this.OJ);this.Yn.appendChild(this.mk);$.yf(this.Yn,{position:"absolute",visibility:"hidden",left:0,top:0});$.yf(this.OJ,{"font-size":"0px",border:"0 solid"});this.OJ.innerHTML=
"a";this.b=$.Oe("SPAN");this.Yn.appendChild(this.b);$.yf(this.b,{"font-size":"0px",border:"0 solid"});this.b.innerHTML="a";this.vI=$.Oe("IMG");$.yf(this.vI,{position:"absolute",left:0,top:0});this.Yn.appendChild(this.vI);this.xp=$.Oe("DIV");this.Yn.appendChild(this.xp)};$.g.NN=function(a){this.Yn||this.Xp();this.lc(this.vI,"src",a);return $.Qf(this.vI)};
$.g.measure=function(a,b){if(""==a)return new $.I(0,0,0,0);this.Yn||this.Xp();$.Ye(this.Dr);this.Dr=this.rF("");this.$A.appendChild(this.Dr);var c=null,d=0;if(" "==a)return $.jh(this,b);$.gc(a," ")&&(d+=c=$.jh(this,b).width);$.hc(a," ")&&(d+=c||$.jh(this,b).width);LS(this.mk.style,"font-style");LS(this.mk.style,"font-variant");LS(this.mk.style,"font-family");LS(this.mk.style,"font-size");LS(this.mk.style,"font-weight");LS(this.mk.style,"letter-spacing");LS(this.mk.style,"text-decoration");this.mk.style.cssText=
"";b.fontStyle&&($.yf(this.mk,"font-style",b.fontStyle),$.yf(this.Dr,"font-style",b.fontStyle));b.fontVariant&&($.yf(this.mk,"font-variant",b.fontVariant),$.yf(this.Dr,"font-variant",b.fontVariant));b.fontFamily&&($.yf(this.mk,"font-family",b.fontFamily),$.yf(this.Dr,"font-family",b.fontFamily));b.fontSize&&($.yf(this.mk,"font-size",b.fontSize),$.yf(this.Dr,"font-size",b.fontSize));b.fontWeight?($.yf(this.mk,"font-weight",b.fontWeight),$.yf(this.Dr,"font-weight",b.fontWeight)):($.yf(this.mk,"font-weight",
"normal"),$.yf(this.Dr,"font-weight","normal"));b.letterSpacing&&($.yf(this.mk,"letter-spacing",b.letterSpacing),this.Dr.style["v-text-spacing"]="normal"==b.letterSpacing?"":b.letterSpacing);b.er&&($.yf(this.mk,"text-decoration",b.decoration),$.yf(this.Dr,"text-decoration",b.decoration));$.yf(this.mk,"border","0 solid");this.lc(this.Dr,"string",a);c=$.Qf(this.$A).width;$.yf(this.Yn,{left:0,top:0,width:"auto",height:"auto"});this.mk.innerHTML=a;var e=$.Qf(this.OJ);$.Ef(this.Yn,0,-(e.top+e.height));
e=$.Qf(this.mk);e.width=c+d;--e.left;this.mk.innerHTML="";return e};$.g.fW=function(a){this.Yn||this.Xp();$.z(a)?this.xp.innerHTML=a:(a=a.cloneNode(!0),this.xp.appendChild(a));a=$.Qf(this.xp);this.xp.innerHTML="";return a};$.g.z4={1:"m",2:"l",3:"c",4:"ae",5:"x"};$.g.S4=function(a,b){var c=b[2]+b[3];a.push(KS(b[4]-$.db(c,b[0])),KS(b[5]-$.eb(c,b[1])),KS(b[0]),KS(b[1]),Math.round(-65536*b[2]),Math.round(-65536*b[3]))};$.g.W4=function(a,b){$.jd(Array.prototype.push,(0,$.Wa)(b,KS),a)};
$.g.L0=function(){return $.Oe("div",{style:"overflow:hidden;position:relative;"})};$.g.bP=function(a,b,c){$.rh(this,a.style,{width:JS(b),height:JS(c)})};$.g.sS=IS.prototype.tS;$.g.Vo=IS.prototype.tS;$.g.F0=function(){return this.f("image")};$.g.z0=function(){return this.f("shape")};$.g.I0=function(){return this.f("shape")};$.g.D0=function(){return this.f("shape")};$.g.G0=function(){return this.f("fill")};$.g.E0=IS.prototype.tS;$.g.H5=$.ia;$.g.N5=$.ia;
$.g.K5=function(a){$.rh(this,a.ia().style,{position:"absolute",left:JS(0),top:JS(0),width:JS(1),height:JS(1)})};
$.g.I5=function(a){var b=a.ck(),c=a.ia(),d=a.src()||"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",e=a.align();if(e==$.$g){e=b.left;var f=b.top;var h=b.width;var k=b.height}else{k=this.NN(d);h=k.width/b.width;f=k.height/b.height;var l=a.gD()==$.ah;f=1/((1<h&&1<f||1>h&&1>f?l?h>f:h<f:l?1<h:1>h)?h:f);h=k.width*f;k=k.height*f;switch(e){case $.$g:e=b.width;f=b.height;break;case "x-min-y-min":e=b.left;f=b.top;break;case "x-mid-y-min":e=b.left+b.width/2-h/2;f=b.top;break;
case "x-max-y-min":e=b.left+b.width-h;f=b.top;break;case "x-min-y-mid":e=b.left;f=b.top+b.height/2-k/2;break;default:case "x-mid-y-mid":e=b.left+b.width/2-h/2;f=b.top+b.height/2-k/2;break;case "x-max-y-mid":e=b.left+b.width-h;f=b.top+b.height/2-k/2;break;case "x-min-y-max":e=b.left;f=b.top+b.height-k;break;case "x-mid-y-max":e=b.left+b.width/2-h/2;f=b.top+b.height-k;break;case "x-max-y-max":e=b.left+b.width-h,f=b.top+b.height-k}}$.rh(this,c.style,{position:"absolute",left:JS(e),top:JS(f),width:JS(h),
height:JS(k)});this.lc(c,"src",d);a.clip(b)};$.g.C5=function(a){this.DX(a)};$.g.DX=function(a){var b=a.ia();MS(this,b);var c=a.So(),d=a.To(),e=a.Wr(),f=a.yx(),h=a.Ig();h&&!$.yb(h)?(c=$.tb(c,d,e,f,0,360,!1),d=c.length,h.transform(c,0,c,0,d/2),h=["m",KS(c[d-2]),KS(c[d-1]),"c"],$.jd(Array.prototype.push,(0,$.Wa)(c,KS),h)):h=["ae",KS(c),KS(d),KS(e),KS(f),0,-23592960];h.push("x");$.lg(a,4);$.lg(a,256);this.lc(b,"path",h.join(" "))};
$.g.HX=function(a){var b=a.ia();MS(this,b);var c=$.th(this,a,!0);c?this.lc(b,"path",c):(this.lc(b,"path","M 0,0"),b.removeAttribute("path"));$.lg(a,4);$.lg(a,256)};$.g.AS=function(){var a=this.f("shape"),b=this.f("path");b.setAttribute("textpathok","t");a.appendChild(b);return a};$.g.Ux=function(){return $.Te(window.document,"span")};$.g.rF=function(a){var b=this.f("textpath");b.setAttribute("on","t");b.setAttribute("string",a);return b};$.g.D5=function(a,b){var c=a.ia();c&&(c.style.cursor=b||"")};
$.g.IX=function(a){var b=a.ia().style;if(a.xr()){if(!a.path()){var c=a.$a;a.b.length&&(c-=a.b[0].f);var d=a.aa;$.rh(this,b,{position:"absolute",overflow:"visible",left:JS(d),top:JS(c)})}}else d=a.x(),c=a.y(),a.vAlign()&&a.height()&&a.height()>a.D&&("middle"==a.vAlign()&&(c+=a.height()/2-a.D/2),"bottom"==a.vAlign()&&(c+=a.height()-a.D)),$.rh(this,b,{position:"absolute",overflow:"hidden",left:JS(d),top:JS(c)})};
$.g.JX=function(a){var b=a.ia(),c=b.style;b.style.cssText="";a.xr()?(a.path()||$.rh(this,c,{width:JS(1),height:JS(1)}),b.innerHTML=""):null!=a.Uc&&(a.fontSize()&&$.yf(b,"font-size",a.fontSize()),a.color()&&$.yf(b,"color",a.color()),a.fontFamily()&&$.yf(b,"font-family",a.fontFamily()),a.fontStyle()&&$.yf(b,"font-style",a.fontStyle()),a.fontVariant()&&$.yf(b,"font-variant",a.fontVariant()),a.fontWeight()&&$.yf(b,"font-weight",a.fontWeight()),a.letterSpacing()&&$.yf(b,"letter-spacing",a.letterSpacing()),
a.er()&&$.yf(b,"text-decoration",a.er()),a.opacity()&&(c.filter="alpha(opacity="+100*a.opacity()+")"),a.lineHeight()&&$.yf(b,"line-height",a.lineHeight()),a.textIndent()&&$.yf(b,"text-indent",a.textIndent()),"..."==a.textOverflow()&&$.yf(b,"text-overflow","ellipsis"),""==a.textOverflow()&&$.yf(b,"text-overflow","clip"),a.direction()&&$.yf(b,"direction",a.direction()),$.yf(b,"word-break",a.Wu()),$.yf(b,"word-wrap",a.wordWrap()),null!=a.width()?$.yf(this.b,"white-space","normal"):$.yf(this.b,"white-space",
"nowrap"),a.zm()&&(b.style["text-align"]=a.K?"end"==a.zm()||"left"==a.zm()?"left":a.zm()==$.Ph||"right"==a.zm()?"right":"center":"end"==a.zm()||"right"==a.zm()?"right":a.zm()==$.Ph||"left"==a.zm()?"left":"center"),$.Uf(b,!a.Fm()),b.innerHTML=a.Uc,this.lc(c,"width",String(a.width()?JS(a.width()):a.rb().width)),this.lc(c,"height",String(a.height()?JS(a.height()):a.rb().height)))};
$.g.EZ=function(a){var b=a.ia(),c=a.parent().path();if(c){var d=$.rk();d.oe($.Bg(c));a.i&&d.translate(a.lo,a.sm);a=c?$.th(this,d,!0):"m "+KS(a.x)+","+KS(a.y)+" l "+(KS(a.x)+1)+","+KS(a.y)+" e";b.setAttribute("path",a)}};
$.g.FZ=function(a){var b=a.parent(),c=b.style(),d=a.b,e=a.ia();c=$.Sc(c);$.Uc(c,d);a=this.rF(a.text);c.fontStyle&&$.yf(a,"font-style",c.fontStyle);c.fontVariant&&$.yf(a,"font-variant",c.fontVariant);c.fontFamily&&$.yf(a,"font-family",c.fontFamily);c.fontSize&&$.yf(a,"font-size",c.fontSize);c.fontWeight&&$.yf(a,"font-weight",c.fontWeight);c.letterSpacing&&(a.style["v-text-spacing"]="normal"==c.letterSpacing?"":c.letterSpacing);c.decoration&&$.yf(a,"text-decoration",c.decoration);c.hAlign&&(a.style["v-text-align"]=
b.K?"end"==c.hAlign||"left"==c.hAlign?"left":c.hAlign==$.Ph||"right"==c.hAlign?"right":"center":"end"==c.hAlign||"right"==c.hAlign?"right":c.hAlign==$.Ph||"left"==c.hAlign?"left":"center");c.opacity&&(d=this.f("fill"),this.lc(d,"opacity",c.opacity),e.appendChild(d));e.appendChild(a);b.Fm()?e.removeAttribute("unselectable"):this.lc(e,"unselectable","on");MS(this,e);e.setAttribute("filled","t");e.setAttribute("fillcolor",c.color);e.setAttribute("stroked","f");b.ia().appendChild(e)};$.g.h4=function(){return!0};
$.g.N_=function(a){var b=a.fill();$.J(b,$.Qb)&&(b="black");var c=a.stroke(),d;$.z(c)?d=c:d="keys"in c?0!=c.keys.length?c.keys[0].color:"#000":c.color;var e=!$.z(b)&&"keys"in b&&"cx"in b&&"cy"in b,f=!$.z(b)&&"keys"in b&&!e,h=!e&&!f,k="none"!=b&&"none"!=b.color,l="none"!=d&&0!=c.thickness,m=h&&k&&1!=b.opacity,p=!$.z(c)&&l&&(1!=c.opacity||"miter"!=c.lineJoin||"butt"!=c.lineCap||"none"!=c.dash);if(e||f||m||p){p=a.Ja();m=p.vn;var q=$.J(a,$.Cg)&&a.Tj()?new $.I(0,0,1,1):a.rb();if(f){var r=$.J(b.mode,$.I);
var t=$.Ja(b.keys,0);0!=t[0].offset&&t.unshift({offset:0,color:t[0].color,opacity:t[0].opacity});var u=t[t.length-1];1!=u.offset&&t.push({offset:1,color:u.color,opacity:u.opacity});var v=b.mode?$.qh(b.angle,q):b.angle;q=$.Ii(m,r?Qfa(t,b.mode,v,q):t,b.opacity,v,b.mode)}else if(e){if(b.mode){var w=b.mode;u=Math.min(w.width,w.height);v=(b.cx*w.width-(q.left-w.left))/q.width;t=(b.cy*w.height-(q.top-w.top))/q.height;w=u/q.width;q=u/q.height}else v=b.cx,t=b.cy,w=q=1;q=Ufa(m,b.keys,v,t,w,q,b.opacity,b.mode)}else q=
b;v=Tfa(m,q,c);if(!v.zo){w=this.f("shapetype");$.sh(this,w,$.fc($.dc.Hd(),v));$.Ue(m.ia(),w);v.zo=!0;var x=null;if(f){var y=q;y.zo&&(y=new $.Hj(y.keys,y.opacity,y.angle,y.mode),v.b=y);x=this.f("fill");t=y.keys;var C=[];(0,$.Re)(t,function(a){C.push(a.offset+" "+a.color)},this);p=$.ab(y.angle+270);u=t[t.length-1];h=t[0];$.rh(this,x,{type:"gradient",method:"none",colors:C.join(","),angle:p,color:h.color,opacity:r?y.opacity:(0,window.isNaN)(u.opacity)?y.opacity:u.opacity,color2:u.color,"o:opacity2":r?
y.opacity:(0,window.isNaN)(h.opacity)?y.opacity:h.opacity});w.appendChild(x);y.pF=m;y.zo=!0}else e?(r=q,r.zo&&(r=new ES(r.keys,r.Dc,r.uc,r.b,r.f,r.opacity,r.Ua),v.b=r),x=this.f("fill"),t=r.keys,h=t[t.length-1],u=t[0],$.rh(this,x,{src:p.pathToRadialGradientImage,size:r.b+","+r.f,origin:".5, .5",position:r.Dc+","+r.uc,type:"pattern",method:"linear sigma",colors:"0 "+h.color+";1 "+u.color,color:h.color,opacity:(0,window.isNaN)(h.opacity)?r.opacity:h.opacity,color2:u.color,"o:opacity2":(0,window.isNaN)(u.opacity)?
r.opacity:u.opacity}),w.appendChild(x),r.qF=m,r.zo=!0):h&&(x=v.nA?v.nA:v.nA=this.f("fill"),$.z(b)?($.rh(this,a.ia(),{fillcolor:b,filled:"none"!=b}),$.rh(this,x,{type:"solid",on:"none"!=b,color:b,opacity:1})):($.rh(this,a.ia(),{fillcolor:b.color,filled:"none"!=b.color}),$.rh(this,x,{type:"solid",on:"none"!=b.color,color:b.color,opacity:(0,window.isNaN)(b.opacity)?1:b.opacity})));w.appendChild(x);r=v.BJ?v.BJ:v.BJ=this.f("stroke");m=c.thickness?c.thickness:1;p=(h=Rfa(c.dash,m))?"flat":c.lineCap;$.rh(this,
r,{joinstyle:c.lineJoin||"miter",endcap:"butt"==p?"flat":p,dashstyle:h,on:l,color:d,opacity:$.B(c)&&"opacity"in c?c.opacity:1,weight:m+"px"});w.appendChild(r)}if(e||f)h=q.keys[q.keys.length-1],$.rh(this,a.ia(),{fillcolor:h.color,filled:"none"!=h.color});$.rh(this,a.ia(),{filled:k,fillcolor:b.color||b,stroked:l,strokecolor:d,strokeweight:c.thickness?c.thickness+"px":"1px"});$.rh(this,a.ia(),{type:"#"+$.fc($.dc.Hd(),v)})}else $.rh(this,a.ia(),{type:"",filled:k,fillcolor:b.color||b,stroked:l,strokecolor:d,
strokeweight:c.thickness?c.thickness+"px":"1px"})};$.g.Ji=function(a){var b=a.ia().style;this.lc(b,"visibility",a.visible()?"":"hidden")};$.g.zB=function(a){var b=a.ck(),c=a.Ig();if(c){var d;a.FB?d=a.FB:d=a.FB=this.f("skew");a.oJ||(a.ia().appendChild(d),a.oJ=!0);$.rh(this,d,{on:"true",origin:[-.5-b.left/b.width,-.5-b.top/b.height].join(),matrix:[CS(c.od),CS(c.hf),CS(c.We),CS(c.Me),0,0].join()});$.rh(this,a.ia().style,{left:JS(b.left+c.Nd),top:JS(b.top+c.Id)})}else a.oJ&&($.Ye(a.FB),a.oJ=!1)};
$.g.G5=function(a){var b=a.ia(),c=a.So(),d=a.To(),e=a.Wr(),f=a.yx();(a=a.Ig())&&!$.yb(a)?(c=$.tb(c,d,e,f,0,360,!1),d=c.length,a.transform(c,0,c,0,d/2),a=["m",KS(c[d-2]),KS(c[d-1]),"c"],$.jd(Array.prototype.push,(0,$.Wa)(c,KS),a)):a=["ae",KS(c),KS(d),KS(e),KS(f),0,-23592960];a.push("x");this.lc(b,"path",a.join(" "))};$.g.J5=function(a){var b=a.ia().style;(a=a.Ig())&&this.lc(b,"rotation",String($.Bb(a)))};$.g.M5=function(a){var b=a.ia();(a=$.th(this,a,!0))?this.lc(b,"path",a):b.removeAttribute("path")};
$.g.L5=$.ia;
$.g.P5=function(a){var b=a.Ig();if(b){var c=a.b,d=a.ia().style;if(a.xr()){if(!a.path()){var e=a.$a;a.b.length&&(e-=a.b[0].f);var f=a.aa;$.rh(this,d,{position:"absolute",overflow:"visible",left:JS(f+b.Nd),top:JS(e+b.Id)})}if(RS(a))for(a=0,d=c.length;a<d;a++){var h=c[a];if(h.FB){var k=h.FB;$.rh(this,k,{origin:[-.5-f,-.5-e].join(),matrix:[CS(b.od),CS(b.hf),CS(b.We),CS(b.Me),0,0].join()})}else k=h.FB=this.f("skew");!h.oJ&&h.ia()&&(h.ia().appendChild(k),h.oJ=!0);var l=[-.5-f,-.5-e].join();h.ia()&&(h.ia().rotation=
0);$.rh(this,k,{on:"true",origin:l,matrix:[CS(b.od),CS(b.hf),CS(b.We),CS(b.Me),0,0].join()})}}else f=a.x(),e=a.y(),a.vAlign()&&a.height()&&a.height()>a.D&&("middle"==a.vAlign()&&(e+=a.height()/2-a.D/2),"bottom"==a.vAlign()&&(e+=a.height()-a.D)),$.rh(this,d,{position:"absolute",overflow:"hidden",left:JS(f+b.Nd),top:JS(e+b.Id)})}};$.g.HI=function(){return!0};$.g.O5=$.ia;$.g.V0=$.ia;
$.g.AX=function(a){var b=$.J(a,$.Jg),c=a.clip();if(c){c=c.shape();c=c.Wt(c.Sd);c=c.clone();var d=a.ia().style;if($.n(b)&&b)a=a.Ig(),c=$.zb(c,a);else if(!$.J(a,QS)||a.xr())c.left-=a.Eh()||0,c.top-=a.zs()||0;a=c.left;b=c.top;this.lc(d,"clip",["rect(",b+"px",a+c.width+"px",b+c.height+"px",a+"px",")"].join(" "))}else c=a.ia().style,LS(c,"clip")};$.g.uW=function(){return!0};$.H(NS,$.nd);$.g=NS.prototype;$.g.Tm=function(){return this.b};$.g.nA=null;$.g.BJ=null;$.g.zo=!1;$.g.Sm=function(){return"shape-type"};$.g.R=function(){delete this.b;delete this.i;$.Ye(this.nA);this.nA=null;$.Ye(this.BJ);this.BJ=null};$.H(OS,$.Lj);OS.prototype.clear=function(){$.Oc(this.f);$.Oc(this.G);OS.u.clear.call(this)};OS.prototype.f5=function(a){for(var b=$.Kj(a.keys,a.Dc,a.uc,a.b,a.f,a.opacity,a.Ua),c=$.Hc(this.f),d=0,e=c.length;d<e;d++){var f=c[d];f.Tm()==a&&Sfa(f)}$.Kc(this.G,b)&&$.Pc(this.G,b)};OS.prototype.jX=function(a){for(var b=$.Ij(a.keys,a.opacity,a.angle,a.mode),c=$.Hc(this.f),d=0,e=c.length;d<e;d++){var f=c[d];f.Tm()==a&&Sfa(f)}a=this.qu;$.Kc(a,b)&&$.Pc(a,b)};
OS.prototype.R=function(){for(var a in this.f)$.pd(this.f[a]);this.f=null;OS.u.R.call(this)};$.H(PS,$.Zj);PS.prototype.B0=function(){return new OS(this)};PS.prototype.A0=function(a,b,c,d){return new DS(this,a,b,c,d)};$.E("acgraph.vml.Stage",PS);$.H(QS,$.Qh);$.g=QS.prototype;$.g.textOverflow=function(a){a&&(this.Ia=!0);return QS.u.textOverflow.call(this,a)};$.g.opacity=function(a){if(null!=a){if(a!==this.style().opacity){var b=!this.Ja()||this.Ja().xf();b||this.Ja().suspend();this.style().opacity=a;this.Pb(1024);this.Pb(32);this.Pb(16384);this.Pb(4);this.qx();b||this.Ja().resume()}return this}return this.style().opacity};
$.g.color=function(a){if(null!=a){if(a!==this.style().color){var b=!this.Ja()||this.Ja().xf();b||this.Ja().suspend();this.style().color=a;this.Pb(1024);this.Pb(32);this.Pb(16384);this.Pb(4);this.qx();b||this.Ja().resume()}return this}return this.style().color};$.g.qx=function(){if($.ng().HI()){var a=this.Ig();a&&!$.yb(a)&&(this.Pb(4),this.nf=null)}};$.g.xr=function(){var a=this.Ig();return!(!a||a&&1==a.od&&0==a.hf&&0==a.We&&1==a.Me)||!!this.textOverflow()};
$.g.Wt=function(a){this.Ia=this.xr();return QS.u.Wt.call(this,a)};$.g.Rd=function(){QS.u.Rd.call(this);if(RS(this)||this.textOverflow()){$.ng();var a=this.ia();HS&&this.ia()&&(a.innerHTML=a.innerHTML)}return this};$.g.kX=function(){$.lg(this,64)};$.g.IO=function(){this.Ia?QS.u.IO.call(this):($.ng().IX(this),$.lg(this,16384))};$.g.Ep=function(){this.Ia?QS.u.Ep.call(this):$.lg(this,32)};
$.g.JB=function(){if(this.Ia)QS.u.JB.call(this);else{null!=this.direction()&&(this.K="rtl"==this.direction());var a=this.text();this.Gd||null==this.text()?this.Uc=a:this.Uc=$.rc(a);this.Ua=this.Vm(this.Uc,{})}};
$.g.Vm=function(a,b){if(this.Ia)return QS.u.Vm.call(this,a,b);var c=$.ng(),d=this.style();c.Yn||c.Xp();c.b.style.cssText="";d.fontStyle&&$.yf(c.b,"font-style",d.fontStyle);d.fontVariant&&$.yf(c.b,"font-variant",d.fontVariant);d.fontFamily&&$.yf(c.b,"font-family",d.fontFamily);d.fontSize&&$.yf(c.b,"font-size",d.fontSize);d.fontWeight&&$.yf(c.b,"font-weight",d.fontWeight);d.letterSpacing&&$.yf(c.b,"letter-spacing",d.letterSpacing);d.decoration&&$.yf(c.b,"text-decoration",d.decoration);d.textIndent&&
$.yf(c.b,"text-indent",d.textIndent);$.yf(c.b,"word-break",d.wordBreak);$.yf(c.b,"word-wrap",d.wordWrap);null!=d.width||$.yf(c.b,"white-space","nowrap");d.width&&$.yf(c.b,"width",d.width);$.yf(c.Yn,{left:0,top:0,width:"1px",height:"1px"});$.yf(c.b,{border:"0 solid",position:"absolute",left:0,top:0});c.b.innerHTML=a;d=$.Qf(c.b);c.b.innerHTML="";d.left=this.x();d.top=this.y();this.D=d.height;this.height()&&(d.height=this.height());return d};
$.g.pv=function(){var a=this.Ig();!a||this.Uf(256)||this.Uf(4)||(this.nf=a.clone())};$.g.Sy=function(){QS.u.Sy.call(this);Vfa(this)};$.g.Lr=function(){QS.u.Lr.call(this);Vfa(this);if(HS&&RS(this)){var a=!this.Ja()||this.Ja().xf();a||this.Ja().suspend();this.ba=!1;this.Pb(1024);this.Pb(32);this.Pb(16384);this.Pb(4);this.qx();a||this.Ja().resume()}};$.g.R=function(){delete this.nf;QS.u.R.call(this)};var SS=QS.prototype;SS.color=SS.color;SS.opacity=SS.opacity;SS.textOverflow=SS.textOverflow;
$.E("acgraph.vml.Text",QS);$.E("acgraph.vml.getRenderer",function(){return IS.Hd()});}).call(this,$)}
