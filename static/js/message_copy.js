exports.mouse_is_down = false;
exports.set_mouse_is_down = function (value) {
    exports.mouse_is_down = value;
};

exports.copy_selected_messages = function (message_id) {
    const selected_messages = $(".copy_selected_message");
    const messages = [];

    selected_messages.each(function () {
        const row = $(this);
        messages.push(rows.id(row));
    });

    return channel.get({
        url: '/json/messages/markdown',
        idempotent: true,
        data: {
            messages: JSON.stringify(messages),
        },
        success: function (data) {
            $('#copy_message_markdown_' + message_id).val(data.raw_content);
            const clipboard = new ClipboardJS('#btn_copy_message_markdown_' + message_id);
            clipboard.on('success', function () {
                exports.show_copied_alert(message_id);
                exports.clean_copied_messages(message_id);
            });
            clipboard.on('error', function () {
                exports.clean_copied_messages(message_id);
            });
        },
    });
};

exports.show_copied_alert = function (message_id) {
    const row = $(".selected_message[zid='" + message_id + "']");
    row.find(".alert-msg")
        .text(i18n.t("Copied!"))
        .css("display", "block")
        .delay(1000)
        .fadeOut(300);
};

exports.clean_copied_messages = function (message_id) {
    popovers.hide_actions_popover();
    $(".copy_selected_message").removeClass("copy_selected_message");
    $("#messages_markdown_" + message_id).hide();
    $('#copy_message_markdown_' + message_id).val("");
};


exports.select_message = function (message_box) {
    const row = $(message_box).closest(".message_row");
    if (row.hasClass("copy_selected_message")) {
        row.removeClass("copy_selected_message");
    } else {
        row.addClass("copy_selected_message");
    }
};

exports.select_until_message = function (first_row, final_row) {
    if (rows.id(first_row) > rows.id(final_row)) {
        return;
    }
    let current = first_row;
    while (current.length > 0) {
        current.addClass("copy_selected_message");
        current = rows.next_visible(current);
        if (rows.id(current) === rows.id(final_row)) {
            current.addClass("copy_selected_message");
            break;
        }
    }
};

window.message_copy = exports;
