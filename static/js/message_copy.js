exports.copy_selected_messages = function (group) {
    selected_messages = $(".copy_selected_message");
    var messages = [];

    selected_messages.each( function() {
        var row = $(this);
        if (group == rows.get_closest_group(row).attr("id")) {
            messages.push(rows.id(row));
        }
    });

    return channel.get({
         url: '/json/messages/markdown',
         idempotent: true,
         data: {
             messages: JSON.stringify(messages),
         },
         success: function (data) {
             console.log(data.raw_content);
             $('#copy_message_markdown_' + group).val(data.raw_content);
             new ClipboardJS('#btn_copy_message_markdown_' + group)
         },
    });
};

exports.select_message = function(message_box) {
    const row = $(message_box).closest(".message_row")
    if (row.hasClass("copy_selected_message")) {
        row.removeClass("copy_selected_message");
    } else {
        row.addClass("copy_selected_message");
    }
}

window.message_copy = exports;