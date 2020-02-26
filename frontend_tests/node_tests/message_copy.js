const noop = function () {};

set_global('$', global.make_zjquery());

zrequire('rows');
zrequire('message_copy');

const copy_selected_messages = message_copy.copy_selected_messages;
const push_message = message_copy.push_message;
const select_message = message_copy.select_message;
const select_until_message = message_copy.select_until_message;
const show_copied_alert = message_copy.show_copied_alert;
const clean_copied_messages = message_copy.clean_copied_messages;
const clipboard_error_handler = message_copy.clipboard_error_handler;
const clipboard_success_handler = message_copy.clipboard_success_handler;
const messages = message_copy.messages;

const message_box_id = 85;
const raw_content_get = '2020-02-19 20:41:59 @_**aaron**: first message';
const messages_list = [
    {
        id: 85,
    },
    {
        id: 86,
    },
    {
        id: 89,
    },
    {
        id: 90,
    },
];

function stub_channel_get(success_value) {
    set_global('channel', {
        get: function (opts) {
            opts.success(success_value);
        },
    });
}

set_global('rows', {
    id: function (row) {
        return row.id;
    },
});

set_global('i18n', {
    t: function (text) {
        return text;
    },
});

set_global('popovers', {
    hide_actions_popover: noop,
});

set_global('ClipboardJS', function (sel) {
    assert.equal(sel, '#btn_copy_message_markdown_' + message_box_id);
    this.on = function (name, callback) {
        console.log(name);
    };
});

run_test('copy selected messages', () => {
    const message_row_1 = $('#zhome' + messages_list[0].id);
    message_row_1.id = messages_list[0].id;
    message_row_1.length = 1;
    const message_row_2 = $('#zhome' + messages_list[1].id);
    message_row_2.id = messages_list[1].id;
    message_row_2.length = 1;
    const message_row_3 = $('#zhome' + messages_list[2].id);
    message_row_3.id = messages_list[2].id;
    message_row_3.length = 1;
    const message_row_4 = $('#zhome' + messages_list[3].id);
    message_row_4.id = messages_list[3].id;
    message_row_4.length = 1;

    const selected_messages = $(".copy_selected_message");
    selected_messages.data = [message_row_1, message_row_2, message_row_3, message_row_4];
    selected_messages.eq = function (index) {
        return selected_messages.data[index];
    }
    set_global('message_copy', {
        push_message: noop,
    });
    stub_channel_get({
        raw_content: raw_content_get,
    });
    copy_selected_messages(message_box_id);
    assert.equal($('#copy_message_markdown_' + message_box_id).val(), raw_content_get);

});

run_test('push a message', () => {
    const message_row_1 = $('#zhome' + messages_list[0].id);
    message_row_1.id = messages_list[0].id;
    const message_row_2 = $('#zhome' + messages_list[1].id);
    message_row_2.id = messages_list[1].id;
    push_message(message_row_1);
    push_message(message_row_2);
    console.log(messages);
    assert.equal(messages[0], messages_list[0].id);
});

run_test('select a message', () => {
    const message_box = $('<div class="message_box">');
    const message_row = $('#zhome' + messages_list[0].id);
    message_box.closest = function () {
        return message_row;
    };

    select_message(message_box);
    assert.equal($('#zhome' + messages_list[0].id).hasClass("copy_selected_message"), true);
    select_message(message_box);
    assert.equal($('#zhome' + messages_list[0].id).hasClass("copy_selected_message"), false);
});

run_test('select a message range and clean copied', () => {
    const message_row_1 = $('#zhome' + messages_list[0].id);
    message_row_1.id = messages_list[0].id;
    message_row_1.length = 1;
    const message_row_2 = $('#zhome' + messages_list[1].id);
    message_row_2.id = messages_list[1].id;
    message_row_2.length = 1;
    const message_row_3 = $('#zhome' + messages_list[2].id);
    message_row_3.id = messages_list[2].id;
    message_row_3.length = 1;
    const message_row_4 = $('#zhome' + messages_list[3].id);
    message_row_4.id = messages_list[3].id;
    message_row_4.length = 1;

    set_global('rows', {
        next_visible: function (row) {
            switch (row.id) {
            case messages_list[0].id:
                return message_row_2;
            case messages_list[1].id:
                return message_row_3;
            case messages_list[2].id:
                return message_row_4;
            case messages_list[3].id:
                return { length: 0 };
            }
        },
        id: function (row) {
            return row.id;
        },
    });

    //Selecting a range of messages
    select_until_message(message_row_1, message_row_4);

    assert.equal(message_row_1.hasClass("copy_selected_message"), true);
    assert.equal(message_row_2.hasClass("copy_selected_message"), true);
    assert.equal(message_row_3.hasClass("copy_selected_message"), true);
    assert.equal(message_row_4.hasClass("copy_selected_message"), true);


    const selected_messages = $(".copy_selected_message");
    selected_messages.data = [message_row_1, message_row_2, message_row_3, message_row_4];
    selected_messages.removeClass = function () {
        for (const msg of selected_messages.data) {
            msg.removeClass("copy_selected_message");
        }
    };

    //Cleaning the selected messages

    $('#messages_markdown_' + messages_list[0].id).show();
    assert($('#messages_markdown_' + messages_list[0].id).visible());
    $('#copy_message_markdown_' + messages_list[0].id).val(raw_content_get);
    clean_copied_messages(messages_list[0].id);

    assert.equal(message_row_1.hasClass("copy_selected_message"), false);
    assert.equal(message_row_2.hasClass("copy_selected_message"), false);
    assert.equal(message_row_3.hasClass("copy_selected_message"), false);
    assert.equal(message_row_4.hasClass("copy_selected_message"), false);

    assert(!$('#messages_markdown_' + messages_list[0].id).visible());
    assert.equal($('#copy_message_markdown_' + messages_list[0].id).val(), '');

    //When the first message is before the second one

    select_until_message(message_row_4, message_row_1);

    assert.equal(message_row_1.hasClass("copy_selected_message"), false);
    assert.equal(message_row_2.hasClass("copy_selected_message"), false);
    assert.equal(message_row_3.hasClass("copy_selected_message"), false);
    assert.equal(message_row_4.hasClass("copy_selected_message"), false);
});

run_test('show copied alert', () => {
    const alert_src = $('<span class="alert-msg pull-right"></span>');
    const alert = $(".selected_message[zid='" + messages_list[0].id + "']");
    alert.set_find_results('.alert-msg', alert_src);
    alert_src.text = function () {
        return this;
    };
    alert_src.css = function () {
        return this;
    };
    alert_src.delay = function () {
        return this;
    };
    alert_src.fadeOut = function () {
        return this;
    };
    
    show_copied_alert(messages_list[0].id);
});

run_test('handlers', () => {
    set_global('message_copy', {
        show_copied_alert: noop,
        clean_copied_messages: noop,
    });
    const event = {
        trigger: $.create('trigger'),
    }
    event.trigger.attr('data-message', message_box_id);
    clipboard_success_handler(event);
    clipboard_error_handler(event);
});