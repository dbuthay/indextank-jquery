(function($){
    if(!$.Indextank){
        $.Indextank = new Object();
    };
    
    $.Indextank.Live = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("Indextank.Live", base);
        
        base.init = function(){
            base.options = $.extend({},$.Indextank.Live.defaultOptions, options);

            // create the timer. it will re run queries for us
            base.timer = $.timer(
                function(){
                    base.$el.trigger( "Indextank.AjaxSearch.reRunQuery" );
                },
                base.options.interval,
                false
            );


            // be a man in the middle between AjaxSearch and its listeners
            base.listeners = base.$el.data("Indextank.AjaxSearch").options.listeners;
            base.$el.data("Indextank.AjaxSearch").options.listeners = base;


            // make the timer stop when a query runs

            // this does not listen to Indextank.AjaxSearch.searching on purpose.
            // we want to know when a NEW query is taking place.
            base.$el.bind("Indextank.AjaxSearch.runQuery", function() {
                base.stopTimer();
            });

            // make the timer start after a successfull query.
            // we want it to keep polling.
            base.$el.bind("Indextank.AjaxSearch.success", function(event, data) {
                base.startTimer();

                // check if this is a live update, or just a new query
                if (data.query == base.data.query &&
                    data.start == base.data.start &&
                    data.rsLength == base.data.rsLength ) {
                
                    // do something about the update

                } else {
                    // ok, man in the middle doing nothing
                    base.$el.trigger("Indextank.AjaxSearch.success", [event, data]);
                    base.listeners.trigger("Indextank.AjaxSearch.success", [event, data]);
                }

            });


            // make autocomplete trigger a query when suggestions appear
            base.$el.bind( "Indextank.Autocomplete.success", function (event, suggestions ) {
                base.$el.trigger( "Indextank.AjaxSearch.runQuery", suggestions );
            });

           
            
        };
        
        // Sample Function, Uncomment to use
        // base.functionName = function(paramaters){
        // 
        // };

        base.stopTimer = function() {
            base.timer.stop();
        };

        base.startTimer = function() {
            base.timer.play(); 
        };
        
        // Run initializer
        base.init();
    };
    
    $.Indextank.Live.defaultOptions = {
    };
    
    $.fn.indextank_Live = function(options){
        return this.each(function(){
            (new $.Indextank.Live(this, options));
        });
    };
    
})(jQuery);
