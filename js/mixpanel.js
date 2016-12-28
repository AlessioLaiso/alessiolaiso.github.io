(function(e,a){if(!a.__SV){var b=window;try{var c,l,i,j=b.location,g=j.hash;c=function(a,b){return(l=a.match(RegExp(b+"=([^&]*)")))?l[1]:null};g&&c(g,"state")&&(i=JSON.parse(decodeURIComponent(c(g,"state"))),"mpeditor"===i.action&&(b.sessionStorage.setItem("_mpcehash",g),history.replaceState(i.desiredHash||"",e.title,j.pathname+j.search)))}catch(m){}var k,h;window.mixpanel=a;a._i=[];a.init=function(b,c,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,
0)))}}var d=a;"undefined"!==typeof f?d=a[f]=[]:f="mixpanel";d.people=d.people||[];d.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};d.people.toString=function(){return d.toString(1)+".people (stub)"};k="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
for(h=0;h<k.length;h++)e(d,k[h]);a._i.push([b,c,f])};a.__SV=1.2;b=e.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";c=e.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}})(document,window.mixpanel||[]);

(function(){
  var productionHost = "alessiolaiso.com";
  if (window.location.hostname.toLowerCase().indexOf(productionHost) === -1) {
    mixpanel.init("881a6c5ec50692b9f2d964675cc54893");
  } else {
    mixpanel.init("cf84101d09727884f4b3cf33dd6522ac");
  }
})();

$(function(){
  var trackCb = function(event){
    return function(){
      mixpanel.track(event);
    }
  };
  $(".linkedin-icon").click(trackCb("link:click:linkedin"));
  $(".twitter-icon").click(trackCb("link:click:twitter"));
});

var ProjectTracker = function($, opts){
  var project = opts.project;
  delete opts.project;
  var started = false;
  var done = false;
  var sectionTiming = 0;
  var startTime = 0;
  var currentSection = null;
  opts.elements = [".project-main"].concat(opts.elements || []).concat([".project-nav"]);
  var elements = opts.elements;
  var track = $(window).scrollTop() == 0;

  var hasRead = function(){
    return localStorage.getItem("project:" + project) === "done";
  };

  var trackEvent = function(event, props){
    if(!hasRead()){
      props["project"] = project;
      mixpanel.track("project:reading:" + event, props);
    };
  };


  var time = function(){
    return new Date().getTime();
  };

  var elapsedTime = function(){
    return (time() - startTime) / 1000;
  };

  $(window).on("beforeunload", function(){
    if(started && !done){
      trackEvent("abort", { percent: percent, duration: elapsedTime() });
    }
  });

  mixpanel.track("project:page_loaded", { project: project, read: hasRead() });
  if(!track){
    mixpanel.track("project:not_tracked", { project: project });
  }

  return ScrollTracker($, opts, function(data){
    if(!track ||
       data.event !== "ScrollTiming" ||
       data.eventAction !== "Elements" ||
       localStorage.getItem("project:" + project) === "done"){
      return;
    }
    var label = data.eventLabel;

    if(label === ".project-main"){
      started = true;
      startTime = time();
      return trackEvent("started", { project: project });
    }
    if(currentSection != null){
      var duration = (data.eventTiming - sectionTiming) / 1000;
      trackEvent("section_read", { project: project, name: currentSection, duration: duration });
    }
    if(label === ".project-nav"){
      done = true;
      trackEvent("finished", { project: project, duration: elapsedTime() });
      return localStorage.setItem("project:" + project, "done");
    }
    if(opts.elements.indexOf(label) > -1){
      sectionTiming = data.eventTiming;
      currentSection = label.substring(1);
    }
  });
}

var ScrollTracker = function($, opts, cb) {
  if(typeof opts === "function"){
    cb = opts;
    opts = {};
  }

  var track = function() {
    $(function(){
      $.scrollDepth({
        elements: opts.elements || [],
        pixelDepth: false,
        eventHandler: function(data){
          cb(data);
        }
      });
    });
  };

  return { track: track };
};
