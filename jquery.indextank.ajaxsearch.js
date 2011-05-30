(function($){
    if(!$.Indextank){
        $.Indextank = new Object();
    };
    
    $.Indextank.AjaxSearch = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("Indextank.AjaxSearch", base);
        
        base.init = function(){
            
            base.options = $.extend({},$.Indextank.AjaxSearch.defaultOptions, options);
            base.xhr = undefined;
            base.queryData = {};
            
            
            // TODO: make sure ize is an Indextank.Ize element somehow
            base.ize = $(base.el.form).data("Indextank.Ize");
            base.ize.$el.submit(function(e){
                // make sure the form is not submitted
                e.preventDefault();
                base.runQuery();
            });


            // make it possible for other to trigger an ajax search
            base.$el.bind( "Indextank.AjaxSearch.runQuery", function (event, term, start, rsLength ) {
                base.runQuery(term, start, rsLength);
            });
        };
        
        // Sample Function, Uncomment to use
        // base.functionName = function(paramaters){
        // 
        // };

            base.runQuery = function( options ) {

                // calculate options, using baes.options as default.
                options = $.extend({}, base.options, options);


                // don't run a query twice
                options.query = options.rewriteQuery( options.query || base.el.value );
                

                if (base.areEqual(options, base.queryData)) { 
                    return;
                } 
                
                // if we are running a query, an old one makes no sense.
                if (base.xhr != undefined ) {
                    base.xhr.abort();
                }
               

                // remember the current running query
                base.queryData = options;

                base.options.listeners.trigger("Indextank.AjaxSearch.searching");
                base.$el.trigger("Indextank.AjaxSearch.searching");


                // run the query, with ajax
                base.xhr = $.ajax( {
                    url: base.ize.apiurl + "/v1/indexes/" + base.ize.indexName + "/search",
                    dataType: "jsonp",
                    data: { 
                            "q": options.query, 
                            "fetch": options.fields, 
                            "snippet": options.snippets, 
                            "function": options.scoringFunction,
                            "start": options.start,
                            "len": options.rsLength
                          },
                    success: function( data ) { 
                                // Indextank API does not send the query, nor start or rsLength
                                // I'll save the current query inside 'data',
                                // so our listeners can use it.
                                data.queryData = options;
                                base.options.listeners.trigger("Indextank.AjaxSearch.success", data);
                                }
                } );
            } 
    

        // hacky way to tell if 2 queries look the same.
        // it does not even check if everything on b is in a
        base.areEqual = function( a, b) {

            for (p in a) {
                if (typeof(p) == "string" || typeof(p) == "number")
                    if ( b[p] != a[p] ) return false;
            }

            return true; 

        }
    
        // Run initializer
        base.init();
    };
    
    $.Indextank.AjaxSearch.defaultOptions = {
        // first result to fetch .. it can be overrided at query-time,
        // but we need a default. 99.95% of the times you'll want to keep the default
        start : 0,
        // how many results to fetch on every query? 
        // it can be overriden at query-time.
        rsLength : 10, 
        // default fields to fetch .. 
        fields : "name,title,image,url,link",
        // fields to make snippets for
        snippets : "text",
        // no one listening .. sad
        listeners: [],
        // scoring function to use
        scoringFunction: 0,
        // the default query re-writer is identity
        rewriteQuery: function(q) {return q}
    };
    
    $.fn.indextank_AjaxSearch = function(options){
        return this.each(function(){
            (new $.Indextank.AjaxSearch(this, options));
        });
    };
    
})(jQuery);
