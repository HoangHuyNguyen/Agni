var CWebGLUtils = ( function() {
    
   var GetWebGLContext = function( canvas )
   {
       var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
       var context = null;
       
       for(var i = 0; i < names.length; i++ )
       {
           try
           {
               context = canvas.getContext(names[i]);      
           }
           catch (e){}
           
           if ( context )
           {
               break;
           }
           
       }
       
       return context;
   };
    
   return { GetWebGLContext : GetWebGLContext };
}() );


/**
 * Provides requestAnimationFrame in a cross browser
 * way.
 */
window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
             window.setTimeout(callback, 1000/60);
           };
})();