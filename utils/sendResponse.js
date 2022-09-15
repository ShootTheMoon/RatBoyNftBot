const axios = require('axios');

function sendMessage(api, chat, msg, msgID) {
    axios
        .post(`${api}/sendMessage`, {
            chat_id: chat,
            text: msg,
            reply_to_message_id: msgID,
            parse_mode: 'Markdown',
        })
        .catch((err) => console.log(err));
}
function sendPhoto(api, chat, image, text, button, msgID) {
    if (button) {
        axios
            .post(`${api}/sendPhoto`, {
                chat_id: chat,
                photo: image,
                caption: text,
                reply_to_message_id: msgID,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: button[0],
                                url: button[1],
                            },
                        ],
                    ],
                },
            })
            .catch((err) =>
                sendMessage(api, chat, '*Please try again later*', msgID)
            );
    } else {
        axios
            .post(`${api}/sendPhoto`, {
                chat_id: chat,
                photo: photo,
                caption: caption,
                reply_to_message_id: msgID,
                parse_mode: 'Markdown',
            })
            .catch((err) => console.log(err));
    }
}
async function sendVideo() {}

module.exports = { sendMessage, sendVideo, sendPhoto };
