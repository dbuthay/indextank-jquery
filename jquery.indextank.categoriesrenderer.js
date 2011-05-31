(function($){
    if(!$.Indextank){
        $.Indextank = new Object();
    };
    
    $.Indextank.CategoriesRenderer = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("Indextank.CategoriesRenderer", base);
        
        base.init = function(){
            base.options = $.extend({},$.Indextank.CategoriesRenderer.defaultOptions, options);


            base.$el.bind( "Indextank.AjaxSearch.success", function (event, data) {
                base.$el.show();
                base.$el.html("");

                var stats = base.options.format(data);
                stats.appendTo(base.$el);
            });
        };
        
        
        // Run initializer
        base.init();
    };
    
    $.Indextank.CategoriesRenderer.defaultOptions = {
        format: function (data) {
            
            var queriedCategories = $.parseJSON(data.queryData.category_filters || "{}");

            var r = $("<div></div>");

            $.each( data.facets, function (catName, values){
                $cat = $("<div/>").text(catName);
                $list = $("<ul/>");
                $cat.append($list);
                r.append($cat);
                
                $.each(values, function (catValue, count) {
                    var li = $("<li/>").text(catValue + " (" + count + ")");
                    li.data("Indextank.CategoriesRenderer.queryData", data.queryData) ; 
                    
                    // check if the category should be marked as selected 
                    if (queriedCategories[catName] == catValue) {
                        var selected = true;
                        li.addClass("selected");
                    }


                    li.click(function(event){
                        // TODO toggle base on selected 


                        // ensure query data has something on it
                        var queryData = $.extend({"category_filters": {}}, data.queryData);
                        queryData.category_filters[catName] = [catValue];
                        queryData.category_filters = JSON.stringify(queryData.category_filters);
                        data.provider.trigger("Indextank.AjaxSearch.runQuery", [queryData]);
                    });

                    $list.append(li);
                });

            });

            return r;
        }
    };
    
    $.fn.indextank_CategoriesRenderer = function(options){
        return this.each(function(){
            (new $.Indextank.CategoriesRenderer(this, options));
        });
    };
    
})(jQuery);
