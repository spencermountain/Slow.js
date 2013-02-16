var arr=[1,2,3,4,5,6,7,8,9,10];

exports.pace=function(arr, doit, options, done){
  this.aliases=["rate","speed"]
  this.doc="explicitly decide the speed, with an optional maximum limit for safety"
  if(typeof options=="function"){//(be flexible)
    done=options;
    options={};
  }
  done=done||console.log;
  options=options||{}
  options.rate=options.rate||options.speed||options.pace||options.bpm||60;
  options.max=options.max||5;
  options.debug=options.debug||false;
  options.verbose=options.verbose||false;
  if(typeof options.monitor!="function"){
    options.monitor=false;
  }
  if(typeof options.rate=="string"){
    //convert bpm
    if(options.rate.match(/bpm$/i)){
      options.rate=parseInt(options.rate.replace(/bpm/i,''))||60;
    }
    //convert hertz
    else if(options.rate.match(/he?rtz$/i)){
      options.rate=parseInt(options.rate.replace(/he?r?t?z$/i,''));
      options.rate=Math.abs(options.rate*60)||60;
    }
    //convert ms
    else if(options.rate.match(/ms$/i)){
      options.rate=parseInt(options.rate.replace(/ms$/i,''));
      options.rate=Math.abs(options.rate/60) || 60;
    }
    options.rate=parseInt(options.rate);
  }
  //show.on.the.road..
  var i=-1;
  var all=[]
  var current=0;
  var dangling=0;
  var timeout=arr.length/2;
  if(timeout<5){timeout=10;}

  function iterate(){
    //done?
    if(i>=(arr.length-1)){
      //ignore danglers after a while, to avoid inf loop
      if(current!=0 && dangling<timeout){
        if(options.debug){console.log('waiting for danglers');}
        dangling++;
        return
      }
      //done.
      clearInterval(loop);
      if(options.verbose){
        all=make_verbose(all);
      }
      return done(all)
    }
    //don't blow the stack
    if(current>=options.max){
      if(options.debug){console.log('whoa fella');}
      return
    }
    i+=1;
    current+=1;
    //send the next one
     (function(){ //wrap it for scope
        var spot=i;
        if(options.debug){console.log('sending# '+spot+', '+current+' going at once');}
        doit(arr[i],function(r){
          current-=1;
          all[spot]=r;
        })
     })()
  }
  options.rate=bpm_to_ms(options.rate);
  var loop = setInterval(iterate, options.rate);
}
//exports.pace(arr,my_function,{rate:"250bpm"})

exports.heartbeat=function(arr, doit, options, done){
  options=options||{}
  options.rate=options.rate||"72bpm";
  exports.pace(arr, doit, options, done);
}
exports.walk=function(arr, doit, options, done){
  options=options||{}
  options.rate=options.rate||"120bpm";
  exports.pace(arr, doit, options, done);
}
exports.run=function(arr, doit, options, done){
  options=options||{}
  options.rate=options.rate||"180bpm";
  exports.pace(arr, doit, options, done);
}
exports.jog=function(arr, doit, options, done){
  options=options||{}
  options.rate=options.rate||"150bpm";
  exports.pace(arr, doit, options, done);
}
//exports.walk(arr,my_function)

function bpm_to_ms(bpm){
  var bps=Math.abs(bpm/60)||1
  return parseInt(1000/bps)
}


///////////////////////////////
/////maplimit functions
//////////////////////////

exports.steady=function(arr,fn,options,done){
  this.doc="keep a steady amount of things going at once"
  this.aliases=["flow","waterfall","steadfast"]
  var i =-1;
  var all=[];
  var at_once=0;
  if(typeof options=="function"){//flexible paramaters
    done=options;
    options={};
  }
  options=options||{};
  options.max=Math.abs(options.max)||5;
  options.verbose=options.verbose||false;
  options.debug=options.debug||false;
  if(typeof options.monitor!="function"){
    options.monitor=false;
  }
  function iterate(){
    (function(){//wrap scope
      i++;
      var spot=i;
      at_once++;
      if(options.debug){
        console.log("sending #"+i+", "+at_once+" going at once");
      }
      fn(arr[i],function(result){
        if(options.monitor){
          options.monitor(result);
        }
        at_once-=1;
        all[spot]=result;
        if(i<arr.length-1){
          iterate();
          return;
        }
        //think about ending
        if(at_once<=0){
          if(options.verbose){
            all=make_verbose(arr,all);
          }
          done(all);
        }
      })
    })()
  }
    //get initial functions going
  for(var x=0; (x<options.max && x<arr.length); x++){
    iterate();
  }
}
//exports.steady(arr,my_function,{debug:false, verbose:false, monitor:false, max:3},console.log)



exports.patient=function(arr, doit, options, done){
  options=options||{}
  options.max=options.max||1;
  exports.steady(arr,doit,options,done)
}
exports.handful=function(arr, doit, options, done){
  options=options||{}
  options.max=options.max||3;
  exports.steady(arr,doit,options,done)
}
exports.pocket=function(arr, doit, options, done){
  options=options||{}
  options.max=options.max||7;
  exports.steady(arr,doit,options,done)
}
exports.backpack=function(arr, doit, options, done){
  options=options||{}
  options.max=options.max||15;
  exports.steady(arr,doit,options,done)
}
exports.shovel=function(arr, doit, options, done){
  options=options||{}
  options.max=options.max||35;
  exports.steady(arr,doit,options,done)
}
//exports.handful(arr,my_function)


function make_verbose(arr, result){
  return result.map(function(r,i){
    return {
      input:arr[i],
      result:r
    }
  })
}

function my_function(q, callback){
  var x=Math.floor(Math.random()*4000)
  setTimeout(function(){callback("finished "+q+" in "+x+"ms")}, x)
}
