const noop = function () {};
const return_false = function () { return false; };
const return_true = function () { return true; };

set_global('page_params', {});

set_global('$', global.make_zjquery());

zrequire('rows');
zrequire('message_copy');

const copy_selected_messages = message_copy.copy_selected_messages;
const push_message = message_copy.push_message;
const show_copied_alert = message_copy.show_copied_alert;
const clean_copied_messages = message_copy.clean_copied_messages;
const select_message = message_copy.select_message;
const select_until_message = message_copy.select_until_message;
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
    }
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

set_global('ClipboardJS', function (sel) {
    assert.equal(sel, '#btn_copy_message_markdown_' + message_box_id);
    this.on = noop;
});

run_test('copy selected messages', () => {
    const selected_messages = $(".copy_selected_message");
    selected_messages.data(messages_list);
    selected_messages.each = noop;
    set_global('message_copy', {
        each: noop,
    })
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
    assert.equal(messages[0], messages_list[0].id);
});

run_test('select a message', () => {
    const message_box = $('<div class="message_box">');
    const message_row = $('#zhome' + messages_list[0].id);
    message_box.closest = function (class_name) {
        return message_row;
    };
    
    select_message(message_box);
    assert.equal($('#zhome' + messages_list[0].id).hasClass("copy_selected_message"), true);
    select_message(message_box);
    assert.equal($('#zhome' + messages_list[0].id).hasClass("copy_selected_message"), false);
});

run_test('select a message range', () => {
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
            switch(row.id) {
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
    })
    select_until_message(message_row_1, message_row_4);

    assert.equal(message_row_1.hasClass("copy_selected_message"), true);
    assert.equal(message_row_2.hasClass("copy_selected_message"), true);
    assert.equal(message_row_3.hasClass("copy_selected_message"), true);
    assert.equal(message_row_4.hasClass("copy_selected_message"), true);
});

