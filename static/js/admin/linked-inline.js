(function ($) {
    var activity_indicator;
    function activity_switch(state) {
        var indicator_size = 48;
        if (!activity_indicator) {
            if (!state) {
                return;
            };
            activity_indicator = {
                indicator: $("<div/>").
                    attr("id", "activity-indicator").
                    css({
                        position: "fixed",
                        width: indicator_size,
                        height: indicator_size
                    }).
                    appendTo("body"),
                overlay: $("<div/>").
                    addClass("ui-widget-overlay").
                    css({
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 1000
                    }).
                    appendTo("body")
            };
        };
        activity_indicator.indicator.css({
            left: ($(window).width() - indicator_size) / 2,
            top: ($(window).height() - indicator_size) / 2
        }).activity(state ? {zIndex: 1001} : false);
        activity_indicator.overlay.css({
            width: $(document).width(),
            height: $(document).height()
        }).toggle(state);
    }
    $.fn.sortableInline = function(inline_params) {
        var container = $(this).find("tbody, .grp-table");
        var row_selector = "> .has_original";
        var error_dialog;
        container.sortable({
            items: row_selector,
            axis: "y",
            placeholder: "grp-module ui-sortable-placeholder",
            forceHelperSize: true,
            forcePlaceholderSize: true,
            stop: function() {
                var rows = container.find(row_selector);
                rows.removeClass("row1 row2");
                rows.filter(":even").addClass("row1");
                rows.filter(":odd").addClass("row2");
                var order = $.map(rows, function(elem) {
                    return $(elem).find("input[type=hidden][name$=-id]").val();
                }).join(",");
                activity_switch(true);
                $.ajax({
                    url: "/ajax/admin/set_model_order", 
                    type: "POST",
                    data: $.extend({}, inline_params, {order: order}),
                    dataType: "json",
                    error: function(xhr, textStatus, errorThrown) {
                        if (!error_dialog) {
                            error_dialog = $("<div/>").
                                appendTo("body").
                                dialog({
                                    autoOpen: false,
                                    resizable: false,
                                    title: "Error"
                                });
                        }
                        error_dialog.text("Unable to reorder the objects, status: " + textStatus + ", error: " + errorThrown);
                        error_dialog.dialog("open")
                    },
                    complete: function() { activity_switch(false); }
                });
            }
        });
    };
})(jQuery);

